# DJ connection setup — station owner

Public onboarding page: /dj/. It contains no broadcast credentials, no self-service broadcast authorization and no simulated broadcasting controls. Access requests open an email draft to the existing public business contact. No request is automatically sent or stored.

## Verified November 6, 2026

- Shared station API identifies station 1 / rich_row_radio, Liquidsoap backend and Icecast frontend.
- Stream is online; API reported no live DJ at inspection time.
- Public Web DJ route /public/rich_row_radio/dj returns "This station does not currently support this functionality." It is not presented as a working booth.
- An existing Chrome dashboard tab was found, but browser inspection failed; a tab title alone does not establish a current authenticated administrative session. No server settings, DJ accounts, permissions or credentials were changed.

## Required owner configuration

1. Sign into the existing AzuraCast station and confirm the account has Manage Station Streamers permission.
2. Inspect the station profile and enable DJs/streamers if disabled. Check the deployed station's own options and connection information; do not infer ports, mount or passwords from examples.
3. Create an individual broadcaster account for an approved named DJ. Do not share owner login or the source/master password. Confirm permitted schedule or access restrictions supported by the deployed version.
4. Share that DJ's connection pack privately: server, port, mount, protocol, personal username/password and approved format/bitrate. Do not commit credentials or put them on the public website.
5. Verify native encoder reachability and/or the Web DJ secure connection. A rendered browser booth does not prove its websocket/encoder path works.
6. Arrange an authorized soundcheck. Check audible music/mic, live metadata, join/leave transition and return to AutoDJ, plus a forced disconnection. Avoid taking over the public stream without an agreed test window.
7. Test commercial handling while a live DJ is connected. Public plans for four spots / 210 seconds per hour do not prove Liquidsoap will insert them into live audio. Decide and verify the station's automation or explicit DJ handoff before promising this behavior.
8. Enable the browser-booth link on /dj/ only after the station feature and end-to-end test pass. Recordings and replay programming need their own actual configuration and verification.

## How the audio flows

Station library + scheduled playlists -> Liquidsoap AutoDJ -> Icecast -> current public stream -> website/app listeners.
DJ player/controller/mic -> compatible source encoder + personal DJ login -> Liquidsoap live input -> the same Icecast/public stream.

Sources:
- https://www.azuracast.com/docs/user-guide/streamers-and-djs/
- https://www.azuracast.com/docs/user-guide/streaming-software/
- https://github.com/AzuraCast/AzuraCast/blob/main/backend/config/routes/public.php
- https://github.com/AzuraCast/AzuraCast/blob/main/backend/src/Controller/Frontend/PublicPages/WebDjAction.php
