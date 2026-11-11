# Live station screen

The homepage radio console shows the station logo and current daily rotation block in America/New_York. The schedule updates every 15 seconds and handles midnight and daylight saving time.

A separate, permanently muted HLS video element reads the existing OBS picture. Two consecutive nonblank samples fade it in over 750 ms. A blank/stalled picture for six seconds, or a fatal connection error, returns to the logo and rotation. Offline streams retry after 30 seconds. Reduced-motion users receive an immediate change.

Video never starts, pauses, seeks or replaces the existing radio audio element. The original Play controls and hourly radio commercials remain independent. No microphone permission or recording is requested. Video timing and radio timing are independent; exact lip synchronization has not been calibrated.

The read-only public picture URL is https://richrow-radio.129-213-164-255.sslip.io:8443/highlife-radio/index.m3u8 . The receiving server pulls the existing OBS ingest privately. Its credentials stay on the server. Only this named picture route is public; existing publisher authentication remains enabled. Do not put private OBS keys into website files.

Current OBS radio scene has audio sources only, so the public screen intentionally keeps the logo until a camera, video or other visible source is added to the OBS program. The video and radio outputs do not require separate OBS broadcasts.

Validation: ten automated checks passed. A browser test with a private HLS fixture passed default -> picture -> default while the real radio audio element remained playing and advanced to 27 seconds (muted local monitoring to avoid a broadcast loop). The actual public video route decoded in the browser. Desktop and phone width checks passed. A real camera/program picture has not yet been supplied by the operator.
