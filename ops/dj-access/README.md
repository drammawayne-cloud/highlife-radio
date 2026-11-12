# Smokey Gwallaz — The Grand Rising Show

Server-side setup only. No changes to the owner's OBS profile or existing studio credentials.

- Daily access: 06:00 inclusive through 10:00 exclusive, `America/New_York`, including DST.
- First authorized test: November 12, 2026, expires 16:49:10 UTC (11:49 a.m. New York).
- Private connection card: `/etc/highlife-djs/smokey-connection.json`, root-only; never commit it.
- Scoped publisher path: `smokey-gwallaz`. Existing `live` publisher stays separate.
- Control API binds only to `127.0.0.1:9997` with a private control credential.
- Controller removes publishing permission outside the schedule and kicks that DJ's existing publisher.
- Only a ready DJ stream containing audio is selected, after three health checks. Missing/disconnected/expired DJ input returns the receivers to the original saved studio input.
- Handover restarts the OBS audio receiver and combined programme encoder; it does not stop either OBS publisher. Brief receiver reconnection is possible. AzuraCast automation remains the audio fallback. Hourly ad routing is unchanged.
- Until a real DJ connection and audible public-output/return test pass, do not describe the on-air handover as verified.

## Owner controls on station host

```sh
sudo /opt/highlife-djs/dj_access.py status
sudo /opt/highlife-djs/dj_access.py disable
sudo /opt/highlife-djs/dj_access.py enable
sudo /opt/highlife-djs/dj_access.py test --minutes 30
```

`disable` revokes this DJ and restores the saved studio receiver route. `enable` restores scheduled access only. `test` grants a temporary additional window; only use when the owner authorizes a live test. No shared studio key is rotated.

## Verification on November 12

Eight schedule/DST/test/revocation checks passed. An isolated eight-second RTMP publish/read test passed with H264 and MPEG-4 Audio while the original publisher ID and active programme route stayed unchanged. Publishing with this DJ's key to the existing studio path was denied. Publishing to the DJ path while its permission was removed was denied; test access was restored afterward. Localhost reader access is deliberately permitted by the pre-existing loopback-only reader; it is not evidence of remote DJ read privileges.

An initial atomic config replacement lost the service user's file ownership and stopped the receiver. File ownership was corrected to `ubuntu:ubuntu`, the receiver restarted, and the original studio publisher reconnected. The atomic writer now preserves the existing file owner. Do not restore backups with root ownership to the service-user config.

No credentials or copied OBS configurations belong in this repository.
