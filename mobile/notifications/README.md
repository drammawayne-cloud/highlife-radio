# NYC High Life Radio live-show alerts

A separate Cloudflare Worker polls the existing public AzuraCast Now Playing endpoint once a minute. It sends one Apple production push notification when live status changes from AutoDJ to a live DJ, or the live DJ name changes. Song changes do not trigger notifications. The first successful poll establishes the baseline and does not send an old live-show alert.

Only iPhone listeners who explicitly allow notifications and subscribe in Menu are registered. No email/account is required. A native APNs token and random installation secret are sent over HTTPS. Only the secret's SHA-256 hash is stored on the server. DELETE requires that secret. The app keeps it in iOS Keychain. No public subscriber-list or send endpoint exists.

The Worker uses three prefixed tables in the existing station newsroom D1 database, because this account has reached its free database-count limit. No existing newsroom tables or routes were edited. It binds the database internally; public requests can only access the subscription operations implemented here.

Apple key 95BXX89CAU was created with owner approval, restricted to production and com.nychighlife.highliferadio. Its private value is a Worker secret; never commit or print it. APNS_KEY, APNS_KEY_ID and APNS_TEAM_ID are set in Cloudflare. /status reports configuration presence only, not delivery success.

Notifications expire after ten minutes. Opted-out subscribers are excluded. Apple's invalidated tokens are removed, and delivery bookkeeping is cleaned after 24 hours. Jobs retry pending notifications; exactly-once transport delivery is not claimed. Apple collapse IDs reduce duplicate presentation.

Native app requires the Push Notifications capability and an App Store production provisioning profile with aps-environment=production. Remote notifications cannot be verified in a browser preview. Physical TestFlight opt-in, receipt, tap-to-open, and unsubscribe must be tested before claiming listener-ready delivery. A notification opens Home; it does not force audio playback or subscribe without permission.

Deploy: wrangler deploy --config notifications/wrangler.jsonc
Test: npm test
The native build includes expo-notifications, expo-device, expo-crypto and expo-secure-store. EAS/Expo push-service enrollment is not required because delivery uses APNs directly.
