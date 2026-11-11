# High Life Radio privacy policy — owner review draft

Not approved or published. Complete the operator, contact, service-provider practices, effective date and applicable rights below before use as the public policy.

High Life Radio provides streaming radio and public station/programme information. This app version does not require an account, sell products, accept submissions, record microphone audio, collect device location, or include analytics or advertising SDKs. Playback and volume settings are maintained in the running app and do not create a listener profile in the app.

The app requests station configuration, Now Playing information and streaming audio from the station's network services. Providing these connections exposes network information such as the listener's IP address to those services. The station operator must specify its actual logs, purposes, providers, retention periods, security measures, data-sharing practices and applicable legal basis. A statement that “no data is collected” must not be made without checking those services.

Native sharing passes the station website link to the destination selected by the listener through the device sharing interface. External website and email links leave the app; information submitted there is handled by those services' policies.

The operator must provide the contact method for privacy inquiries, any available access/deletion rights, children's-data practices, international transfers where applicable, and policy-update notices.

Owner information still needed: legal operator; public contact; service-provider identities and locations; network-log retention and use; rights-request process; applicable jurisdictions; approved effective date.

Optional live-show alerts: listeners must explicitly enable notifications. The app sends an Apple APNs device token and a random installation secret to the station alert service over HTTPS. The server stores the token, SHA-256 hash of the secret and subscription time in Cloudflare D1. The secret is retained in iOS Keychain. The token is sent to Apple to deliver live-show notifications. Turning alerts off in the app deletes the subscription; Apple-invalid tokens are also removed. Delivery records expire after 24 hours when the configured scheduled service runs. No delivery or real-device receipt is established until tested. These practices must be reflected in the approved public policy and App Store privacy answers before release.
