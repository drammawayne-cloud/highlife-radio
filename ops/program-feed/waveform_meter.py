#!/usr/bin/env python3
"""Extract public programme levels from completed HLS segments; never record media."""
import av,numpy as np,json,time,io,re,datetime,urllib.request,urllib.parse,os,subprocess
from collections import deque
from pathlib import Path
BASE='https://richrow-radio.129-213-164-255.sslip.io:8443/highlife-radio/index.m3u8?cookieCheck=1'
DEST=Path('/var/lib/docker/volumes/azuracast_station_data/_data/rich_row_radio/config/highlife-waveform.json')
frames=deque(maxlen=1200);seen=deque(maxlen=80);init_cache={};media_url=None
def get(url):
 with urllib.request.urlopen(url,timeout=8) as r:return r.read()
def playlist():
 global media_url
 if media_url is None:
  master=get(BASE).decode();child=next(x for x in master.splitlines() if x and not x.startswith('#'));media_url=urllib.parse.urljoin(BASE,child)
 url=media_url;body=get(url).decode();entries=[];stamp=None;init=None
 for line in body.splitlines():
  if line.startswith('#EXT-X-MAP:'):init=urllib.parse.urljoin(url,re.search(r'URI="([^"]+)"',line).group(1))
  elif line.startswith('#EXT-X-PROGRAM-DATE-TIME:'):stamp=datetime.datetime.fromisoformat(line.split(':',1)[1].replace('Z','+00:00')).timestamp()
  elif line and not line.startswith('#') and stamp is not None:entries.append((urllib.parse.urljoin(url,line),stamp,init));stamp=None
 return entries
last_route_check=0
while True:
 try:
  if time.monotonic()-last_route_check>60:
   last_route_check=time.monotonic()
   route='/etc/nginx/azuracast.conf.d/highlife-waveform.conf'
   if subprocess.run(['docker','exec','azuracast','test','-s',route],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode:
    subprocess.run(['docker','cp','/opt/highlife-program/highlife-waveform.conf','azuracast:'+route],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    subprocess.run(['docker','exec','azuracast','nginx','-t'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    subprocess.run(['docker','exec','azuracast','nginx','-s','reload'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  for url,stamp,init in playlist()[-8:]:
   key=urllib.parse.urlsplit(url).path
   if key in seen:continue
   prefix=b''
   if init:
    initkey=urllib.parse.urlsplit(init).path
    if initkey not in init_cache:init_cache={initkey:get(init)}
    prefix=init_cache[initkey]
   media=prefix+get(url);first=None
   with av.open(io.BytesIO(media)) as source:
    for frame in source.decode(audio=0):
     pts=float(frame.pts*frame.time_base)
     if first is None:first=pts
     rms=float(np.sqrt(np.mean(frame.to_ndarray()**2)))
     db=20*np.log10(max(1e-6,rms));level=int(np.clip((db+60)/48,0,1)*255)
     frames.append([round((stamp+pts-first)*1000),level])
   seen.append(key)
  now=time.time()*1000
  while frames and frames[0][0]<now-18000:frames.popleft()
  data={'updated':round(now),'frames':list(frames)}
  tmp=DEST.with_suffix('.tmp');tmp.write_text(json.dumps(data,separators=(',',':')));os.chmod(tmp,0o644);tmp.replace(DEST)
 except Exception as error:
  media_url=None;print(json.dumps({'event':'meter_retry','type':type(error).__name__}),flush=True)
 time.sleep(.6)
