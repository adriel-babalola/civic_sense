# CivicSense — Project Context (v2)

> **Companion to [`CONTEXT.md`](./CONTEXT.md).** That file documents the original hackathon build. This one documents where CivicSense has got to and where it is going. Read both.

## What is CivicSense?

**CivicSense is a truth awareness and civic sensitisation platform. The work is youth and mass sensitisation: helping young Nigerians and the wider public check what reaches them before they believe it, and reach decisions they can stand behind.**

The framing is deliberate and load-bearing across every surface, the site copy, the bot replies, the docs and the demo script. CivicSense is not a fact-checking product with a civic mission bolted on. Claim checking is the mechanism; truth awareness is the objective. Describing it the other way round misrepresents it, because a fact-checker answers one question about one claim, while what actually decides an election is a habit: whether people pause before they forward, and whether they learn to want the source rather than the summary.

Practically, CivicSense runs where the claims are. Citizens forward political claims to a WhatsApp or Telegram bot, get sourced verdicts in seconds, report election misconduct anonymously, and browse the certified 2027 presidential field with each candidate and running mate one click apart. No app download, no sign-up.

**Core problem:** Young Nigerians are handed more political information in a day than their parents saw in a year, and nearly all of it arrives unverified. Misinformation spreads fast on WhatsApp and Facebook. Political news disappears after a few days. Misconduct gets buried. Nobody can verify a claim or remember a promise. Accountability evaporates. Apathy is usually a misreading of misinformation.

**Core solution:** Put truth awareness in the path of the rumour. Keep verified truth accessible and searchable in one place, and give people the sources rather than a summary, so citizens can decide for themselves and hold leaders accountable.

**What we are not for:** telling young Nigerians what to think. The aim is that whatever they think, they arrived at it from evidence.

## Three Core Features

1. **Claim checking** — Forward a political claim to WhatsApp or Telegram. The pipeline searches a local index of 17 Nigerian newsrooms, a curated civic knowledge base and live search, then returns VERIFIED / FALSE / MISLEADING / UNVERIFIED with its sources. Under 30 seconds. No app. This is the tool that delivers the truth awareness goal.

2. **Anonymous reporting** — Citizens report misconduct, violence or unrest. Reports sit in a moderation queue; approved ones appear on the public incident map. No identity field exists in the form.

3. **Politician records** — The 2027 presidential field exactly as INEC certified it, with each ticket's running mate linked to their candidate. A candidacy is not a public record, and the site never pretends otherwise; the record sections exist and are honestly empty, ready for a researcher to fill from primary sources.

## Repository layout

| Folder | Role | Stack | Deploy |
|---|---|---|---|
| `server/` | Fact-check pipeline, WhatsApp + Telegram webhooks, RSS scraper, reporting API | Node + Express | Railway |
| `website/` | **The front door.** Public site and internal moderation console | React 19, Vite, Tailwind 4, React Router, Leaflet | Vercel / Netlify |
| `civic_sense_v1/cs_website/` | Earlier Next.js prototype. Superseded, kept for reference | Next.js 15 | Not deployed |
| `civic_sense_v1/fc_dashboard/` | Earlier dashboard prototype. The website's visual language is derived from it | React 19 + Vite | Not deployed |
| `documentation/` | This folder — context, API reference, demo script | Markdown | — |

`website/` replaced the Next.js `landing_page/` prototype. The two folders under `civic_sense_v1/` are superseded and are not part of any build.

## Route plan and status

| Route | Purpose | Status |
|---|---|---|
| `/` | Hero, how it works, sample verdicts, sources, trust | Shipped |
| `/fact-check` | Public web fact-check, same pipeline as the bot, accepts a screenshot | Shipped |
| `/politicians` | Searchable directory of the 2027 field, filter by party and role | Shipped, 36 profiles generated from the INEC list |
| `/politicians/:slug` | Profile: ticket, running-mate link, record, policies, source, share | Shipped, records intentionally empty |
| `/credits` | Every photograph, dataset and document with its author and licence | Shipped |
| `/report` | Anonymous incident report | Shipped, text evidence only |
| `/map` | Public incident map | Shipped, no third-party tiles |
| `/live` | Live fact-check feed with verdict filters | Shipped |
| `/sources` | The 17-source registry, grouped by category | Shipped |
| `/about`, `/faq`, `/privacy` | Trust and transparency | Shipped |
| `/admin/*` | Moderation queue, feed, dataset QA, analytics, settings | Shipped, client-side gate only |

Every public surface is behind a feature flag in `website/src/config/config.js`. Setting one to `false` removes the card, the navigation link and the route, so a disabled feature cannot be reached by typing its URL.

## What is honest about the current state

Stated plainly, because the alternative is a demo that falls over when a judge asks.

- **The admin console is not secure.** It is a `localStorage` password flag, and the moderation endpoints are unauthenticated. Server-side sessions are the first thing to build.
- **The report form takes no images.** The server stores evidence as a string. The form offers a text box and points at WhatsApp for screenshots, where the bot genuinely reads the image.
- **The politician dataset is sourced; its record sections are not.** The 36 profiles are generated from INEC's own final list of candidates, so the candidacy, party, running mate, age and gender on every profile trace to a primary document. Everything else on a profile still ships empty. `verification: "verified"` is scoped to the candidacy claim and nothing more, which is a distinction the code comments and the tests both enforce.
- **The LGA roster is empty.** No official gazette has been transcribed, so the report form falls back to free text. Wrong geography would misroute reports, which is worse than messy geography.
- **The map has no tiles.** Loading OSM tiles would hand a third party every visitor's IP address and the exact rectangle they viewed. The map draws a graticule and plots state-capital centroids instead.
- **Analytics are a 50-record window.** `GET /api/factchecks` returns the most recent 50. There is no lifetime aggregate and no visitor analytics, because there is no tracking at all.

## Remaining sprint

**Ship first, in this order:**

1. Server-side admin authentication. The client-side gate is the largest real gap.
2. Image evidence for reports, end to end: storage, retention window, moderator access, and a privacy policy that describes what actually happens to the file. A decision, not a feature.
3. Named editorial review to fill the empty record sections, then a CRUD API and moderation behind them. The candidate list itself is done and cited; the research on top of it has not started.
4. Official LGA roster from the gazette, replacing the free-text fallback.
5. Politician queries on WhatsApp, so the bot can answer "what has this person actually done" from the same dataset the site renders.

**Then, if the core holds:**

- Multilingual support (Yoruba, Igbo, Hausa) for claims and verdicts
- Facebook and X entry points, same pipeline
- Accessibility audit to WCAG 2.2 AA, with a screen-reader pass over the report form
- Content and distribution rather than more surfaces

## Tech stack

- **Backend:** Node.js + Express 4
- **Frontend:** React 19 + Vite + Tailwind 4 + React Router 7
- **Database:** MongoDB Atlas — FactCheck, Article, Report
- **AI:** Gemini 2.5 Flash via OpenRouter
- **Search:** Tavily across 16 Nigerian domains, plus an RSS index of 17 feeds
- **WhatsApp:** Twilio sandbox. **Telegram:** Bot API
- **Deployment:** Vercel or Netlify (web), Railway (bot)
- **Code:** Private GitHub repository

## Team and roles

- **Adriel Babalola:** Product lead, team lead, architecture
- **Ayomide Olajide:** Backend development, outreach
- **David Adeola:** Backend, research, development
- **Promise Abiodun:** QA testing, UI/UX, accessibility
- **Oreoluwa Ala:** Visionary manager, funding, strategy, tiebreaker on major decisions

These names appear in internal documentation only. The public site does not name individuals.

## Success metrics

Pick one or two primaries rather than tracking all of them:

- 1M+ people reached across channels
- 500k+ bot queries and politician record views
- 10+ media features
- 5M+ cumulative impressions

## Key files and links

- **Live website:** https://civic-sense-website.vercel.app/
- **GitHub:** https://github.com/adriel-babalola/civic_sense
- **Demo video:** https://youtu.be/nhasRYxrBNc
- **API reference:** [`API.md`](./API.md)
- **Website checks:** `cd website && npm run check`
