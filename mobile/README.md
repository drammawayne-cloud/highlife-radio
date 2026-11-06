# NYC High Life Radio — website-matched app

Updated November 5, 2026 to match https://nychighliferadio.com/: official logo, Barlow Condensed display type, gold/red/green dark palette, native Home/Discover/Shows/More screens and persistent live player. Shared stream and Now Playing services remain unchanged; station configuration now comes from the canonical domain.

Discover uses three featured website story snapshots captured November 5; All news and story/profile buttons open the current website externally. These snapshots are not an automatically refreshing news feed. The website currently supplies no machine-readable news feed (its apparent JSON route returns HTML), so no background scraping or fabricated feed is used. Show concepts remain explicitly labeled; confirmed schedules come only from station configuration. The Winning Team and Team Unstoppable remain distinct.

Website privacy/contact pages are accessible through More. The website policy describes the website; native App Store privacy declarations and signing/device requirements still need completion. No website source was changed as part of this redesign.

# High Life Radio mobile — release candidate 1.0.0

Caribbean Energy. Global Frequency. Continue this app in `build/mobile-app-foundation` / PR #1. Its source is separate from the repository-root website, which remains unchanged.

## Run and check

```sh
cd mobile
npm ci
npm run web
npm run typecheck
npm run lint
npm test
npx expo-doctor
npm run build:all
```

Expo SDK 57 / React Native 0.86 / TypeScript. Node 24 was used for validation. `npm ci` installs a documented CommonJS/ESM bridge for the patched URL decoder; do not disable the project postinstall script.

For a production-style browser review:

```sh
npm run export:web
npx serve -s dist -l 8081
```

Open http://localhost:8081. On a phone on the same Wi-Fi, use this Mac's LAN address and port 8081. A temporary HTTPS tunnel can share the web review while the Mac/server/tunnel remain running. Routes `/schedule` and `/about` require the host to fall back to `index.html`.

## Radio behavior

A root player survives Home, Discover, Shows and More navigation. Play/Pause, volume/mute, native station sharing, listening help and in-app privacy information are implemented. Native background playback and live-stream lock-screen controls are configured without microphone permission. User/remote pause is respected, errors/stalls trigger bounded reconnects, and a failed connection offers manual retry.

The real shared stream and Now Playing endpoints remain unchanged. The website's public station.json refreshes every minute, metadata every 15 seconds, and both refresh on returning to the app. Stale song metadata is suppressed. Public configuration can provide published shows, hosts, events and contact/social links. No sample programming or fabricated people are shipped. Until official programming is published, the app shows station rotation.

## Apple release

Read [release/APPLE-RELEASE.md](release/APPLE-RELEASE.md) and [release/VALIDATION.md](release/VALIDATION.md). The bundle ID remains `com.nychighlife.highliferadio`. Signing, TestFlight device verification, native screenshots, public support/privacy pages and accurate listing/rights information are still required. Browser and Hermes exports are not signed .ipa files.

EAS build profiles are included. Authenticate with the correct Expo account and link the project before a cloud iOS build. Keep reviewer contact information in ignored `release/private.json`, not the public repository. `npm run release:check` reports missing release evidence; the submission script runs it before upload.

The dependency audit remains nonzero; see the release document for the corrected runtime advisory and remaining tooling findings.
