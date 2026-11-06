# High Life Radio — staging preview

Public homepage preview for **High Life Radio**, owned and operated by **NYC High Life Entertainment**. Team Unstoppable is the integrated staff division.

This repository is independent of the Rich Row repositories. No production domain or broadcasting backend is modified.

## First-preview scope

Responsive original homepage, persistent audio player, station metadata with stale-data detection, Monday–Sunday sample programming, concept shows, Team Unstoppable section, original sample editorial, High Life/Sponsored Events tabs, contextual information dialogs and ownership footer. All sample programming and editorial is labeled. No invented staff identities, company history, event dates or ticket sales.

Deploy using GitHub Pages from `main` / root. Plain HTML/CSS/JavaScript; no build or dependency installation required. The public staging URL is https://drammawayne-cloud.github.io/highlife-radio/ . Search indexing is discouraged with robots metadata (the website remains public).

## Radio

`station.json` holds only public HTTPS stream/API endpoints. The player connects to the existing station without changing the radio service. Playback starts only after user interaction. Track metadata is suppressed when older than the track duration plus the freshness allowance. Do not equate AutoDJ/stream availability with a live DJ broadcast.

## Next backend phase

The unified master prompt defines a larger platform. A relational database, protected Command Center, secure owner invitation/authentication, backend-enforced roles, CMS, media uploads, private submission queues, advertising workflows and audit/backups are future work, not implemented by this static preview. Do not add a pretend client-side administrator login. The Command Center must use authenticated backend authorization. Its configuration service will replace this preview's static station configuration.

No newsletter/contact/music/event submissions are collected. No owner email, password, service key or private credential is shipped to the public site. The master prompt is reference material and is not published here.

## Local review

Serve this folder with any static server, for example `python3 -m http.server 4173`. Check narrow and wide layouts, navigation and dialogs, schedule/event tabs, play/pause, mute/volume, stream error feedback and metadata freshness. The audio element stays mounted during in-page navigation.

## Color and record controls

The homepage defaults to dark mode with black, red, gold and green. The header sun/moon button switches the entire page between dark and light palettes and saves the visitor preference in local browser storage when available. Audio is not restarted by display changes.

The hero record spins continuously, with a Pause spin control. Clicking the record or Flip record turns it between Side A and Side B. Reduced-motion preference pauses rotation by default and removes the flip transition; visitors can explicitly start the rotation.

## Studio atmosphere update — November 5, 2026

All 21 public HTML pages load studio-atmosphere.css. The original generated broadcast-room background stays fixed behind floating content panels. The homepage uses smaller show/editorial cards and a two-column news/Now Playing row on desktop, with a stacked mobile layout. Existing show names, sample-programming labels, stream endpoints and player logic are preserved. Private admin markup is outside this visual change. Artwork provenance is documented in assets/studio/README.md.

## Daily rotation — November 5, 2026

rotation.js contains the owner-defined daily station blocks, distinct from DJ show names. The same complete 24-hour rotation appears for every day in America/New_York. All boundaries are on the hour: Sunshine 6–10 a.m.; Early Bird 10 a.m.–noon; Noon News noon–1 p.m.; Motion 1–3 p.m.; Lock-in 3–6 p.m.; Evening News 6–7 p.m.; Icing In 7–9 p.m.; High Life Shift 9 p.m.–midnight; Nightly News midnight–1 a.m.; Motion replay 1–3 a.m.; Lock-in replay 3–6 a.m.

Every hour opens with four commercial spots, including within longer blocks, capped at a combined 210 seconds (3:30). A full break leaves 56:30 of programming. Valid full-break examples: 60+60+45+45 and 60+60+60+30. Four 60-second spots exceed the cap. A shorter mix can return to programming earlier; it is not permission to exceed four paid spots. Weekly rates confirmed so far: 15 seconds $50 and 30 seconds $100. The owner is choosing between 45 seconds $150 or $200 and 60 seconds $250 or $300; those unsettled prices are not published. Package placement frequency and ad media are not supplied here. This is the public programming plan: this change does not program AzuraCast, upload commercial audio, create live broadcasts, or infer which DJ is currently on air. Tea Hour was an undecided naming idea and is not a replacement for Early Bird Hour.
