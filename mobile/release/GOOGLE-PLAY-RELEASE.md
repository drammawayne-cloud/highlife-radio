# NYC High Life Radio Android release

Package com.nychighlife.highliferadio, version 1.0.0 (1). Same current source as Apple build 5: radio-first Home, permanent player, station rotations, news, waveform/scenery and real station stream. Android PCM visualization is disabled because playback sampling would request microphone permission; no microphone permission is requested. Native Android push alerts are not yet enabled; the interface states their iPhone availability.

On November 10, 2026, the existing Dramma Wayne developer account was found under the station business Google login. The NYC High Life Radio creation form is prepared with the available package, English (US), App and Free. Developer Program Policies and U.S. export-law declarations remain unchecked pending the owner's explicit answer. No app record or Play upload has been created yet. Do not claim Google Play availability until the public listing is verified.

The final signed AAB and APK built successfully. Android API 36 emulator playback, menu navigation and active media-session checks passed. Screenshots and SHA-256 checksums are stored in the 1.0.0-5 release evidence folder. Physical-device playback remains unverified.

## Local release build

Run npm run build:android:local from mobile. It prebuilds Android and creates release AAB and APK with private upload signing. The config plugin removes Expo's default debug signing from release builds; secrets are supplied only through environment variables. Private signing file: ~/.config/nyc-highlife-radio/android/upload-signing.json, mode 600; private keystore sits beside it. Never commit or upload these private files to GitHub. Keep a secure owner-controlled backup before enrolling the key in Play App Signing. Reuse the same key for future uploads; do not regenerate it.

Outputs after a successful build: android/app/build/outputs/bundle/release/app-release.aab and android/app/build/outputs/apk/release/app-release.apk. The AAB is the Play upload; the APK is a direct device-test artifact, not a Google Play publication. Verify target SDK, package/version, signing certificate, permissions and 16 KB native page alignment before upload. Verify live playback, background controls, menu navigation and recovery on an Android device/emulator.

## Console requirements

Complete the account verification and app listing, public support and privacy URLs, content rating, Data safety, ads declaration (broadcast contains commercials), app access (no login), foreground media-playback declaration, countries and pricing (free). State the actual technical data practices: station/provider network connections and optional iPhone APNs subscriptions; this Android release does not register APNs subscriptions. Confirm music and branding distribution rights with the owner. Google may require additional verification/testing/review; no immediate availability is promised.

App-specific public privacy and support pages are prepared in mobile/public. The current station contact page publicly lists richrowrecords@gmail.com. Reviewer contact is supplied and saved privately; content rights and mature-content answers remain unanswered.
