# Release candidate validation — 2026-10-05

Version 1.0.0; Expo SDK 57. All source changes are confined to `mobile/`. Website source and unrelated repositories are unchanged.

## Passed

- Clean `npm ci`, including the query-string decoder compatibility bridge.
- TypeScript check and Expo ESLint.
- 15 regression tests: station configuration and URL safety, fresh/stale metadata, overnight programming, playback recovery/remote pause, retry limits, Unicode/array links and malformed URL decoding.
- Expo production bundle exports for web, iOS and Android.
- iOS native generation with `expo prebuild --platform ios --no-install`.
- Generated iOS configuration contains background audio and no microphone usage permission; encryption declaration is configured.
- App icon is 1024px RGB with no alpha.
- Browser playback, navigation across Listen/Programming/More, volume and mute/unmute, pause and resume at phone width. The persistent player reported Streaming live across screens; no browser error logs were captured.
- The shared stream returned 241,998 audio bytes in an 8-second bounded fetch. Decoding yielded 10.08 seconds of non-silent stereo audio at 44.1 kHz. This verifies the source, not physical iPhone playback.
- Live Now Playing API returned fresh metadata (Risky by Q Don, 93 seconds old when checked); the app later updated to another live track. Stale metadata falls back honestly.

Phone browser screenshot is preview evidence, not a native App Store screenshot.

## Not passed / not yet verified

- Expo Doctor: 20/21 after native generation. The local native-tooling check fails because CocoaPods is absent. Full Xcode is also absent. The authenticated EAS cloud route is configured instead.
- Actual production EAS build attempt failed before a cloud job started: Expo account not logged in. No signed IPA was produced.
- Apple session expired while opening the New App flow. No High Life Radio App Store record was created, build uploaded, TestFlight installation made, or review submitted.
- Physical iPhone/iPad listening, background/lock-screen/Control Center playback, audio interruptions, headphone/Bluetooth and network-transition tests remain unverified.
- Native store screenshots, owner-confirmed rights, public support/privacy URLs, review contacts, age-rating answers and server privacy practices remain outstanding.
- Dependency audit is 27 findings (19 high, 8 moderate) in the documented Expo/Metro/native build-tool dependency tree. Runtime decoder advisory was patched. The remaining risk has not been accepted or declared resolved.
- `npm run release:check` intentionally fails for the missing account, policy and device evidence.

## Preview launch

The temporary browser preview is https://dictionaries-rhythm-spears-golden.trycloudflare.com/ . It runs only while this Mac is awake and its local server/tunnel remain running. Tap Listen Live to start playback. Rebuild with `npm run export:web` and serve `dist/` to restart a browser preview; the generated web build can also be hosted as a separate static preview without replacing the station website.

This is a tested source release candidate, not a published Apple app. See APPLE-RELEASE.md for the signing, TestFlight/device validation and App Store submission steps.
