# Radio-first app redesign — 2026-11-10

Home opens with the station logo, FROM NEW YORK TO THE WORLD, and a large interactive wooden radio. Its Play/Pause button and persistent bottom player control the same existing station stream. Current track information stays in the radio display. A horizontally scrolling news-caption strip sits beneath the radio, reads the live website newsroom feed, opens each selected article, and falls back honestly when unavailable.

Home and Menu are the only primary tabs. Shows/daily rotation, news/culture and about/listening help are separate routes. Events, Team Unstoppable, website and sharing are in Menu. Smokey's removed profile remains excluded. All daily rotation names remain collapsed by default.

## Free live-show alerts

The owner approved a production Apple notification key scoped only to com.nychighlife.highliferadio and private storage in the station service. The key is created and Push Notifications enabled for the app. Key material is outside Git, protected locally and in Worker secrets.

The separate highlife-live-alerts Worker checks AzuraCast once per minute for live-DJ transitions. Its scheduled invocation completed with outcome ok and no exceptions. Health reports available=true. Production contract checks passed: subscribe=200, wrong installation secret=403, unsubscribe=200, using a fake non-listener token removed after testing. Apple APNs returned BadDeviceToken for an intentionally invalid all-zero token during a direct authentication check. Real device receipt is not established.

The iPhone app requests permission only when a listener subscribes in Menu, uses Apple's native token, stores a random installation secret in Keychain and supports unsubscribe. Notification taps open Home. Browser preview does not send push notifications. A physical iPhone opt-in, receipt, tap-to-open and unsubscribe test remains required.

## Validation

TypeScript, lint, 20 regression tests and web/iOS/Android bundle exports passed. Phone-width browser checks verified large-button playback, persistent playback across Menu navigation and real news captions beneath the radio.

The earlier Apple upload is 1.0.0 build 1. Build 2 contains this redesign; signing/upload status must be checked separately. Public review still requires owner contact/rights/content/privacy answers, approved policy/support pages, screenshots and device evidence.

Final native archive: /tmp/highlife-release/NYCHighLifeRadio-build2-final.xcarchive, ARCHIVE SUCCEEDED. Bundle com.nychighlife.highliferadio, version 1.0.0, build 2. App Store distribution/upload started and reached the protected Mac keychain prompt. Do not claim build 2 uploaded until the upload receipt and Apple UI confirm it.

Current browser preview deployment: https://cc9c22bd.highlife-radio.pages.dev/ (alias https://mobile-app.highlife-radio.pages.dev/).
