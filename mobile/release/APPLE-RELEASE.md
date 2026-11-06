# High Life Radio — Apple release work

Release candidate: 1.0.0. Continue `build/mobile-app-foundation` / PR #1. The app is in `mobile/`; the existing website is preserved.

## Implemented

One persistent player above Expo Router survives all three screens. Explicit Play/Pause, volume/mute controls, honest Now Playing fallback, runtime public station configuration, station-time programming, conditional published hosts/events, native sharing, listening help and in-app privacy information are implemented. No listener account, purchase, recording, location request, analytics SDK, or advertising SDK is included.

Expo Audio configures the native playback session for silent-switch and background listening. The native lock screen registers live-stream Play/Pause metadata without seeking. Source errors and stalled playback get bounded retries; user/remote pause is respected. These native behaviors still need physical-device verification.

Keep bundle ID `com.nychighlife.highliferadio`. The separate local reference foundation's provisional `com.highliferadio.app` was not adopted. A source bundle ID is not proof of Apple registration.

## Signing and upload

Apple requires Xcode 26+ with the iOS 26+ SDK for uploads as of April 28, 2026. The EAS production profile selects `sdk-57`, currently documented as Xcode 26.6. Full Xcode is absent on this Mac, so use the authenticated cloud-build route rather than treating bundle export as a signed app.

```sh
cd mobile
npm ci
npm run typecheck
npm run lint
npm test
npx expo-doctor
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform ios --profile production
```

Use the account holder's Apple team. Do not borrow signing identifiers, alter the WayneKastro record, or invent Apple IDs. Apple/Expo account-holder approval may be needed to manage signing credentials.

After a successful signed production build, upload through `npx eas-cli@latest submit --platform ios --profile production`. This uploads to App Store Connect/TestFlight; it does not publish to the public App Store. The user must complete account verification and any Apple agreements themselves.

## Required device evidence

Install the signed build through TestFlight. Play and verify audible radio; lock the iPhone for at least ten minutes; test Control Center/lock-screen Play/Pause; unlock and switch every screen without restarting the stream. Test silent switch, Bluetooth/headphone disconnection, calls/another audio app, Wi-Fi/cellular transitions and an interrupted network. Verify bounded recovery and that pause stays paused. Check iPad because `supportsTablet` is enabled.

Capture genuine native iPhone and iPad screenshots at Apple's accepted sizes. Browser preview screenshots are review evidence only and must not be represented as native App Store screenshots.

## Listing and policy information

`metadata.json` contains a description, subtitle, keywords and category draft. Supply stable public support/privacy URLs. Copy `private.example.json` to ignored local `private.json` for reviewer contact, Apple team and app record IDs; do not commit private contact information to GitHub. Confirm music/brand distribution rights, logging/retention practices at the streaming/configuration servers, and the broadcast's age-rating content. The app has no parental-control or age-assurance feature; do not claim those in Apple's questionnaire. Do not assume a 4+ rating for a stream with unknown lyrics/content.

The draft privacy and support text is stored alongside this file for the owner to complete. Do not publish incomplete legal text or fill unknown server practices with invented promises. EU distribution also requires the account holder's trader-status information, which App Store Connect currently flags. Keep manual release while the owner inspects the signed app.

Run `npm run release:check` to identify unverified submission fields. It intentionally fails while real account, policy, rights and device evidence are missing.

## Dependency status

The runtime URL-decoding advisory GHSA-vcc3-ghjq-m6fr is fixed using `decode-uri-component@0.5.0`. SDK 57's CommonJS `query-string` needs a small documented default-export bridge installed by `scripts/patch-query-string.cjs`; unicode, arrays and malformed-percent regression tests cover it.

The remaining audit result is 27 findings: 19 high and 8 moderate. Root issues are `braces@3.0.3`, `node-forge@1.4.0` in Expo/Metro build tooling, and `uuid@7.0.3` in the native xcode configuration library. Current latest braces/node-forge versions are still affected. No incompatible forced Expo downgrade or untested UUID major override was applied. This remains an explicit release-risk review item, not a clean audit result.

## Sources

- https://developer.apple.com/news/upcoming-requirements/?id=02032026a
- https://docs.expo.dev/versions/v57.0.0/sdk/audio/
- https://docs.expo.dev/submit/ios/
- https://docs.expo.dev/build-reference/infrastructure/
- https://github.com/advisories/GHSA-vcc3-ghjq-m6fr

