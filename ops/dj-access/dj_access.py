#!/usr/bin/python3
"""Scoped DJ access and scheduled handover. Private credentials never enter logs."""
import argparse
import base64
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.request
from zoneinfo import ZoneInfo
import yaml

ROOT = Path('/etc/highlife-djs')
MEDIA = Path('/home/ubuntu/mediamtx/radio.yml')
RELAY = Path('/etc/highlife-obs-bridge/relay.json')
DJ = 'smokey-gwallaz'


def allowed(config, now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    if not config.get('enabled', False):
        return False
    if config.get('session_override', False):
        return True
    test = config.get('test_until')
    if test and now < dt.datetime.fromisoformat(test):
        return True
    local = now.astimezone(ZoneInfo('America/New_York'))
    return 6 <= local.hour < 10


def atomic(path, text):
    owner = path.stat() if path.exists() else None
    temp = path.with_name(path.name + '.new')
    fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as file:
        file.write(text)
    if owner:
        os.chown(temp, owner.st_uid, owner.st_gid)
    os.replace(temp, path)


def api(config, endpoint, method='GET'):
    auth = base64.b64encode((config['api_user'] + ':' + config['api_pass']).encode()).decode()
    request = urllib.request.Request('http://127.0.0.1:9997/v3/' + endpoint,
                                     headers={'Authorization': 'Basic ' + auth}, method=method)
    with urllib.request.urlopen(request, timeout=3) as response:
        return json.loads(response.read() or b'{}')


def enforce(config, permit):
    media = yaml.safe_load(MEDIA.read_text())
    user = next(u for u in media['authInternalUsers'] if u['user'] == DJ)
    permissions = [{'action': 'publish', 'path': DJ}] if permit else []
    if user['permissions'] != permissions:
        user['permissions'] = permissions
        atomic(MEDIA, yaml.safe_dump(media, sort_keys=False))
    if not permit:
        # Existing sessions must end too; removing credentials alone only blocks reconnects.
        for connection in api(config, 'rtmpconns/list').get('items', []):
            if connection.get('path') == DJ and connection.get('state') == 'publish':
                api(config, 'rtmpconns/kick/' + connection['id'], 'POST')


def switch(config, desired):
    relay = json.loads(RELAY.read_text())
    if relay['input'] == desired:
        return False
    relay['input'] = desired
    atomic(RELAY, json.dumps(relay, indent=2) + '\n')
    # Only the receivers reconnect. OBS publishers, hourly breaks, and station services stay up.
    subprocess.run(['systemctl', 'restart', 'highlife-obs-audio.service'], check=True)
    subprocess.run(['systemctl', 'restart', 'highlife-program.service'], check=True)
    print(json.dumps({'event': 'programme_source', 'source': DJ if desired == config['dj_input'] else 'studio'}), flush=True)
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['run', 'status', 'disable', 'enable', 'test', 'session'])
    parser.add_argument('--minutes', type=int, default=30)
    args = parser.parse_args()
    path = ROOT / (DJ + '.json')
    config = json.loads(path.read_text())
    if args.command in ('disable', 'enable', 'test', 'session'):
        config['enabled'] = args.command != 'disable'
        config['session_override'] = args.command == 'session'
        config['session_seen'] = False
        config['session_last_seen'] = None
        if args.command == 'test':
            if not 1 <= args.minutes <= 120:
                raise SystemExit('Test window must be 1–120 minutes')
            config['test_until'] = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=args.minutes)).isoformat()
        elif args.command in ('enable', 'session'):
            config['test_until'] = None
        atomic(path, json.dumps(config, indent=2) + '\n')
        enforce(config, allowed(config))
        if args.command == 'disable':
            switch(config, config['studio_input'])
        print('DJ access updated. Studio credentials unchanged.')
        return
    if args.command == 'status':
        state = Path('/run/highlife-djs/status.json')
        print(state.read_text() if state.exists() else 'Controller starting')
        return
    Path('/run/highlife-djs').mkdir(exist_ok=True)
    healthy = 0
    while True:
        try:
            config = json.loads(path.read_text())
            permit = allowed(config)
            enforce(config, permit)
            paths = api(config, 'paths/list').get('items', [])
            source = next((p for p in paths if p['name'] == DJ), {})
            tracks = source.get('tracks') or []
            has_audio = any(any(x in str(t).lower() for x in ('audio', 'aac', 'opus', 'mpeg-1', 'mp3')) for t in tracks)
            ready = bool(permit and source.get('ready') and has_audio)
            if config.get('session_override'):
                current = dt.datetime.now(dt.timezone.utc)
                if ready:
                    config['session_seen'] = True
                    config['session_last_seen'] = current.isoformat()
                    atomic(path, json.dumps(config, indent=2) + '\n')
                elif config.get('session_seen') and config.get('session_last_seen'):
                    # A brief network reconnect is allowed; a finished session closes access.
                    elapsed = (current - dt.datetime.fromisoformat(config['session_last_seen'])).total_seconds()
                    if elapsed >= 30:
                        config['session_override'] = False
                        config['test_until'] = None
                        atomic(path, json.dumps(config, indent=2) + '\n')
                        permit = allowed(config, current)
                        enforce(config, permit)
                        print(json.dumps({'event': 'session_finished', 'dj': DJ}), flush=True)
            healthy = healthy + 1 if ready else 0
            desired = config['dj_input'] if healthy >= 3 else config['studio_input']
            # During the initial health check retain the existing source instead of oscillating.
            if ready and healthy < 3:
                desired = json.loads(RELAY.read_text())['input']
            switch(config, desired)
            Path('/run/highlife-djs/status.json').write_text(json.dumps({
                'dj': DJ, 'show': 'The Grand Rising Show', 'enabled': config['enabled'],
                'access_now': permit, 'schedule': 'Daily 06:00–10:00 America/New_York',
                'test_until': config.get('test_until'), 'publisher_ready': bool(source.get('ready')),
                'session_override': config.get('session_override', False),
                'audio_detected': has_audio, 'on_air': desired == config['dj_input'],
                'checked_at': dt.datetime.now(dt.timezone.utc).isoformat()}))
        except Exception as error:
            print(json.dumps({'event': 'controller_retry', 'error_type': type(error).__name__}), flush=True)
            # A management/API outage must never allow a DJ past their scheduled window.
            try:
                if not allowed(json.loads(path.read_text())):
                    switch(config, config['studio_input'])
            except Exception:
                pass
        time.sleep(2)


if __name__ == '__main__':
    main()
