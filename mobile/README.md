# High Life Radio Mobile

Cross-platform iOS/Android foundation sharing the live High Life Radio stream and Now Playing API with the website.

## Run

```bash
cd mobile
npm install
npm run typecheck
npx expo start
```

## Current phase

- Original High Life Radio mobile home
- Real shared live stream configuration
- Shared Now Playing metadata refresh
- Live play/pause component
- Programming screen
- iOS/Android identifiers and background-audio declarations

The sample schedule is explicitly temporary. The next phase replaces it with Command Center/API schedule data and expands persistent background media controls, navigation, accounts and notifications.

## Clickable browser preview

This mobile project also runs in a browser using Expo Web. It is separate from the repository-root radio website.

```bash
cd mobile
npm ci
npm run web
```

Open the localhost address printed by Expo (normally http://localhost:8081). On a phone connected to the same Wi-Fi, open `http://<Mac-LAN-IP>:8081` in Safari or Chrome. Tap Play to start the real shared stream; browsers require a user gesture for audio.

For a production-style browser preview:

```bash
npm run export:web
npx serve -s dist -l 8081
```

The web output is a single-page app. Hosting must fall back to `index.html` for `/schedule` and other app routes. A temporary HTTPS tunnel can share this preview without changing GitHub Pages or the existing website. Tunnel links work only while the preview server and tunnel are running and the Mac is awake.

## Validation

- `npm run typecheck`
- `npx expo-doctor`
- `npm run export:web`
- `npx expo export --platform ios --platform android --output-dir dist-native`

Native bundle export validates bundling; it does not replace testing an installed iOS/Android app or background audio on a physical device. Expo Go must support SDK 54; otherwise use a compatible development build.

Now Playing refreshes every 30 seconds. Stale current-track metadata falls back to the station name and stale next-track metadata displays “Awaiting fresh station metadata”. Station online status remains independent of track freshness.

The Phase-1 sample schedule remains labeled as preview data. Discovery tiles are visual placeholders. The player currently belongs to Home and stops when Home unmounts.

The 2026-10-03 dependency audit reports 34 advisories (23 high, 11 moderate) in the SDK 54 dependency tree. Resolving the remaining advisories requires a separate SDK/dependency upgrade review; forced incompatible upgrades were not applied for this preview.
