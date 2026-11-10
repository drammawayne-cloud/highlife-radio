# Release candidate validation — 2026-11-10

Version 1.0.0; Expo SDK 57. App changes are confined to mobile/. The production website and radio broadcasting services were not changed.

## Passed in this session

- TypeScript and Expo ESLint.
- 17 regression tests covering playback recovery, explicit pause, metadata freshness, station configuration, hourly rotation coverage, and safe newsroom links.
- Expo production bundle exports for web, iOS and Android.
- Native iOS generation; CocoaPods installed locally with Ruby-compatible dependencies.
- Browser preview reports Streaming live with real station audio source and fresh Now Playing updates across screen navigation.
- All 11 rotation blocks start collapsed; Sunshine Morning Show expands to 06:00–10:00 and collapses again.
- Studio room background, capitalized FROM NEW YORK TO THE WORLD, and removal of the Smokey profile/artwork from the app.
- Unsigned Release archive passed in local Xcode: /tmp/highlife-release/NYCHighLifeRadio.xcarchive. App Store export succeeded after owner keychain approval. The IPA passed codesign --verify --deep --strict. Version 1.0.0, build 1, team 8JW27TKSRM.
- Registered explicit Apple bundle ID com.nychighlife.highliferadio and created App Store Connect record 6833131455, currently Prepare for Submission.

## Runnable preview

https://mobile-app.highlife-radio.pages.dev/

Immutable deployment: https://7ed19ebf.highlife-radio.pages.dev/

Open on a phone or computer and tap Listen Live. This preview is separately hosted; it does not depend on a local development tunnel. It is a browser preview, not TestFlight or an App Store release.

## Remaining release gates

Signed IPA exported and uploaded to Apple successfully on 2026-11-10. Xcode reported Uploaded NYCHighLifeRadio and EXPORT SUCCEEDED. Upload receipt at 15:32 EST reports Upload succeeded and Uploaded package is processing. TestFlight list visibility is still pending. Upload warnings report missing dSYM files for React.framework, ReactNativeDependencies.framework and hermesvm.framework; upload was not blocked. The initial development-signing attempt failed due to no registered development device/profile; archive and App Store distribution signing subsequently succeeded. Native device playback, lock-screen controls, interruption recovery, store screenshots and TestFlight validation remain outstanding.

Apple listing text has been entered, but Save returned required reviewer email/phone errors. Do not claim the metadata has been saved until that form succeeds. Reviewer name is Dwayne Vidal; email and phone remain owner inputs. Music/brand rights, mature-content answers and server privacy practices remain unconfirmed. Stable public support/privacy pages must be supplied and verified.

Production dependency audit currently reports 16 findings: 6 high, 9 moderate, 1 low. A previous decoder compatibility patch exists, but the current audit still identifies its package version. No blanket risk acceptance or full remediation is claimed.

EAS is not authenticated or project-linked; the local Xcode route is being prepared. The generic release-check script still requires EAS even for a future local build, so it is a conservative checklist rather than proof of local signing.
