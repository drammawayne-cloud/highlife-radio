LATEST — November 10, 2026
Version 1.0.0 build 5 submitted to Apple App Review. Console explicitly confirms 1 Item Submitted and Waiting for Review, submission d06202d8-1df2-4938-bb74-4d6399a72e67. Genuine iPhone 1206×2622 and iPad 2064×2752 screenshots uploaded. Music category, content rights, calculated 18+ rating, free pricing, availability and privacy responses saved. Owner approved Apple privacy accuracy/update agreement. Device ID and Other Diagnostic Data are disclosed for app functionality, linked conservatively, not tracking. Manual release remains selected. Physical-device interruption and APNs receipt remain unverified. Historical preparation notes below must not override this current status.

# High Life Radio — Apple release work

Release candidate: 1.0.0. Continue `build/mobile-app-foundation` / PR #1. The app is in `mobile/`; the existing website is preserved.

## Implemented

One persistent player above Expo Router survives navigation between Home, Menu, rotation, news and listening help. Explicit Play/Pause, volume/mute controls, honest Now Playing fallback, runtime public station configuration, station-time programming, conditional published hosts/events, native sharing, listening help and in-app privacy information are implemented. No listener account, purchase, recording, location request, analytics SDK, or advertising SDK is included.

Expo Audio configures the native playback session for silent-switch and background listening. The native lock screen registers live-stream Play/Pause metadata without seeking. Source errors and stalled playback get bounded retries; user/remote pause is respected. These native behaviors still need physical-device verification.

Keep bundle ID `com.nychighlife.highliferadio`. The separate local reference foundation's provisional `com.highliferadio.app` was not adopted. A source bundle ID is not proof of Apple registration.

## Signing and upload

The local Xcode 26.6 signing route is working. Version 1.0.0 build 5 was archived, signed and uploaded on November 10, 2026 at 6:54 p.m. New York time. App Store Connect finished processing and reports Ready to Submit. This is the final current candidate with the patched decoder, refreshed dependencies and the website's dated Reuters/AP reports. App Store Connect app 6833131455, team 8JW27TKSRM, bundle com.nychighlife.highliferadio. Build 5 is selected and saved in the release draft. Upload is not review submission or public availability.

The existing EAS profiles remain an alternative; an Expo account link is not required for local Xcode. Reviewer name and owner-supplied contact details are saved privately and in Apple's release draft. Content rights and mature-content answers remain unanswered; do not infer them from contact details. Manual release is selected.

Local archive: /tmp/highlife-release/NYCHighLifeRadio-build5.xcarchive. Upload result: /tmp/highlife-build5-upload.log. Persistent release evidence: /Users/apple/Documents/NYC High Life Radio Releases/1.0.0-5/. Upload succeeded with a missing Hermes dSYM warning, which limits that framework's crash symbolication.

## Required device evidence

Install the signed build through TestFlight. Play and verify audible radio; lock the iPhone for at least ten minutes; test Control Center/lock-screen Play/Pause; unlock and switch every screen without restarting the stream. Test silent switch, Bluetooth/headphone disconnection, calls/another audio app, Wi-Fi/cellular transitions and an interrupted network. Verify bounded recovery and that pause stays paused. Check iPad because `supportsTablet` is enabled.

Capture genuine native iPhone and iPad screenshots at Apple's accepted sizes. Browser preview screenshots are review evidence only and must not be represented as native App Store screenshots.

## Listing and policy information

`metadata.json` contains a description, subtitle, keywords and category draft. Supply stable public support/privacy URLs. Copy `private.example.json` to ignored local `private.json` for reviewer contact, Apple team and app record IDs; do not commit private contact information to GitHub. Confirm music/brand distribution rights, logging/retention practices at the streaming/configuration servers, and the broadcast's age-rating content. The app has no parental-control or age-assurance feature; do not claim those in Apple's questionnaire. Do not assume a 4+ rating for a stream with unknown lyrics/content.

The draft privacy and support text is stored alongside this file for the owner to complete. Do not publish incomplete legal text or fill unknown server practices with invented promises. EU distribution also requires the account holder's trader-status information, which App Store Connect currently flags. Keep manual release while the owner inspects the signed app.

Run `npm run release:check` to identify unverified submission fields. It intentionally fails while real account, policy, rights and device evidence are missing.

## Dependency status

The November 10 refresh identified a newer decoder advisory affecting the earlier 0.5.0 pin. The override is updated to decode-uri-component 0.5.1, with the existing CommonJS default-export bridge retained. The regression suite now includes distinct malformed percent runs and passes 26 tests. This changes the release candidate: build 3 already uploaded before this refresh is not the final patched candidate; a new numbered archive/upload is required.

A compatible npm audit fix was prepared in the lockfile, reducing the reported findings to nine moderate tooling findings, with no high/critical findings in that lockfile result. Installed dependencies were refreshed, the subsequent audit reports nine moderate and zero high/critical findings, and iOS/Android release builds succeeded. Type checking and lint passed. iPhone simulator playback, waveform, navigation and extended background playback passed; Android emulator playback, navigation and media-session checks passed. Physical-device interruption and notification receipt remain unverified. No forced Expo downgrade or unsupported major SDK jump was used.

## Sources

- https://developer.apple.com/news/upcoming-requirements/?id=02032026a
- https://docs.expo.dev/versions/v57.0.0/sdk/audio/
- https://docs.expo.dev/submit/ios/
- https://docs.expo.dev/build-reference/infrastructure/
- https://github.com/advisories/GHSA-vcc3-ghjq-m6fr


## Current candidate: November 11, 2026

Build 6 is signed and exported. Xcode upload is waiting at a second macOS codesign keychain prompt for direct owner approval. Build 5 remains Waiting for Review and has not been withdrawn. Build 6 is not yet submitted. The updated native player uses one combined programme with background playback enabled, live picture, timestamp-driven waveform and double-tap full screen. A quiet iPhone simulator test passed live picture, moving waveform, full-screen entry/return, and return from Home/lock still Streaming live without another Play. This is not physical-phone listening proof. All 26 app tests, type checking and lint pass. A new native Home screenshot is saved in the local 1.0.0-6 release folder; it is not yet uploaded to Apple.
