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

The decorative hero record spins continuously and turns automatically between Side A and Side B on a gentle 28-second cycle. It has no click target or visible animation controls. The visitor’s reduced-motion preference displays a still record; the radio playback controls remain independent.

## Studio atmosphere update — November 5, 2026

All 21 public HTML pages load studio-atmosphere.css. The original generated broadcast-room background stays fixed behind floating content panels. The homepage uses smaller show/editorial cards and a two-column news/Now Playing row on desktop, with a stacked mobile layout. Existing show names, sample-programming labels, stream endpoints and player logic are preserved. Private admin markup is outside this visual change. Artwork provenance is documented in assets/studio/README.md.

## Daily rotation — November 5, 2026

rotation.js contains the owner-defined daily station blocks, distinct from DJ show names. The same complete 24-hour rotation appears for every day in America/New_York. All boundaries are on the hour: Sunshine 6–10 a.m.; Early Bird 10 a.m.–noon; Noon News noon–1 p.m.; Motion 1–3 p.m.; Lock-in 3–6 p.m.; Evening News 6–7 p.m.; Icing In 7–9 p.m.; High Life Shift 9 p.m.–midnight; Nightly News midnight–1 a.m.; Motion replay 1–3 a.m.; Lock-in replay 3–6 a.m.

Every hour opens with four commercial spots, including within longer blocks, capped at a combined 210 seconds (3:30). A full break leaves 56:30 of programming. Valid full-break examples: 60+60+45+45 and 60+60+60+30. Four 60-second spots exceed the cap. A shorter mix can return to programming earlier; it is not permission to exceed four paid spots. Public prices were removed at the owner’s request on November 6. Advertising is consultation-led: budget, existing commercial versus production needs, campaign goals/dates and preferred airtime. Pricing and placement are agreed privately. The request link opens an email draft to the existing public business contact; no enquiry is submitted or payment collected automatically. This is the public programming plan: this change does not program AzuraCast, upload commercial audio, create live broadcasts, or infer which DJ is currently on air. Tea Hour was an undecided naming idea and is not a replacement for Early Bird Hour.

## World desk — November 9, 2026

The homepage now links to `/news/world/`, a dated edition of six source-attributed briefs. Public source dates and the edition review date are separate. The world page links directly to primary evidence and to CNN, Reuters and AP for subsequent reporting; it is not an automatically updating wire or a CNN syndication service. The cards use typography, not fabricated event photography. AI assistance and the difference between source summaries and editorial context are disclosed on the page.

`news/world/edition.json` records the six brief texts and evidence URLs; the HTML is pre-rendered for reading without JavaScript. Future editorial updates must update this file, the world page, homepage teasers, `news/index.json` and `news/feed.xml` together, and advance the review date only after rechecking the reports. The 15-minute browser refresh only reloads the saved index; it does not research or create news.

The missing public news index and RSS feed are restored. The index includes the six world briefs and seven existing October 15 articles, whose publication dates remain visible. Three old teasers pointing to captured homepage markup rather than articles are omitted from navigation and the feed; their files remain intact. World, Haiti and Caribbean filtering includes the Haiti world brief. Existing player, stream settings, daily rotations, DJ Connect and team pages are unchanged.

## Documentary photo update — November 9, 2026

Six real, reusable photographs now accompany the world edition, homepage previews and filtered news cards. Archive/context labels, captions, dates where established, photographer credits and rights links are visible. The 2012 Afghan classroom remains a full group view and is explicitly identified as preceding the Taliban’s 2021 return; the 2021 Haiti image explicitly depicts earthquake relief, not the present hunger crisis. EU-owned Sudan and Yemen photos and the report’s original Unsplash climate image are contextual, not claimed as photographs of a specific new incident. The MONUSCO image is visibly dated December 2024. Per-image provenance and reuse evidence are recorded in `assets/news/documentary/README.md`; no generated imagery or semantic image edits were used.

World briefs now link related AP or Reuters reporting as well as their original documents; older background and reports of separate events are labeled. The source standards panel links independent Ad Fontes assessments of Reuters and AP and explains their limits. No newswire license, paid subscription or automatic news ingestion was added.

To update this edition, edit `news/world/edition.json` with verified text, reporting URLs and image provenance, then run `python3 tools/build-world-news.py`. The repeatable builder updates the world page, homepage, news listing and RSS together. Do not remove archive/context labels or advance review dates without checking the sources. The builder and Markdown provenance records are source-maintenance files; exclude `tools/` and Markdown files from public deployment archives.

## Automatic publisher video reporting — November 9, 2026

The homepage, news hub and world desk now load `/api/world-news`, served by a narrowly routed Cloudflare Pages Worker. It reads only the allowlisted official Reuters and AP YouTube Atom feeds, validates publisher/channel/video IDs and dates, sorts publication times, and checks standard oEmbed availability. Up to four reports per publisher are retained; the world page displays three each and the homepage/news hub one each. Videos and their preview images remain in YouTube’s official privacy-enhanced player. No footage, standalone wire photographs or article bodies are copied. This is a free video-reporting integration, not a full AP/Reuters article/photo syndication license.

The API checks each source after a five-minute cache interval when requested. The browser refreshes on load, every five minutes while visible, and on return to the tab. There is no unattended cron job or AI rewriting. Current reports expire after seven days. Failed refreshes preserve available dated cached reports and their actual last successful retrieval time; partial outages are labeled. Cache eviction plus publisher failure falls back to direct source links and the separately dated reviewed background edition. A reader interacting with a player gets a new-reports button instead of having the player replaced mid-viewing. Publisher removals, region restrictions and embedding changes can still affect individual videos.

The prior six briefs, static news index and RSS remain a dated background archive. They are not silently presented as newly researched stories. The maintained builder preserves the independent automatic panels and source policy. Radio, rotation, DJ and team implementations are unchanged.

Validation: `node --test tests/live-news.test.mjs` checks publisher/ID validation, XML rejection, sorting, duplicate/future/old stories, embedding denial, partial/full outages, cache expiry, new-story retrieval and static route preservation. Package with `python3 tools/package-site.py /absolute/build/directory` outside the checkout. The packager strips test-helper exports from the Worker and excludes private/local state, tools, tests and Markdown. Deploy the resulting directory with Wrangler to the existing `highlife-radio` Pages project; `_routes.json` invokes the Worker only for `/api/world-news`. No new paid plan, database, secret or scheduled job is required.

Provider research is saved privately at https://chatgpt.com/space/page_ba188145e8cc8191868552fced4cb827 . DW/dpa German News Service is a promising free article/photo partnership requiring enrollment; no provider account or contract was opened by this change.
