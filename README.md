# CivicSense

> **Truth awareness, so every decision is an informed one.**

CivicSense is a truth awareness and civic sensitisation platform for Nigeria. The
work is youth and mass sensitisation: helping young Nigerians and the wider
public check what reaches them before they believe it, and reach decisions they
can stand behind.

Checking individual claims is how that gets done, not the whole point of it. A
fact-checker answers one question about one claim; what decides an election is a
habit, whether people pause before they forward. So the claim-checking pipeline
is the tool here and truth awareness is the goal.

It runs where the claims are: a WhatsApp and Telegram bot, a public website, and
an internal moderation console. A claim sent as text or as a screenshot comes
back labelled VERIFIED, FALSE, MISLEADING or UNVERIFIED, with the sources it was
read from, so the reader can judge the evidence rather than take our word for it.

This repository is a monorepo. The website and the bot are separate
deployments that share one API.

---

## Repository layout

| Path | What it is | Stack | Deploy to |
|---|---|---|---|
| `website/` | Public site and admin console | React 19, Vite, Tailwind 4, React Router, Leaflet | Vercel, Netlify, any static host |
| `server/` | Bot and API. Twilio, Telegram, fact-check pipeline, moderation queue, RSS scraper | Node, Express, Mongoose, Gemini, Tavily | Railway, Render, Fly, a VPS |
| `civic_sense_v1/cs_website/` | Earlier Next.js prototype, kept for reference | Next.js | Not deployed |
| `civic_sense_v1/fc_dashboard/` | Earlier dashboard prototype. The website's visual language is derived from it | React | Not deployed |
| `documentation/` | Architecture notes, API reference, planning context | Markdown | — |

`website/` is the current front end. The two folders under `civic_sense_v1/` are
superseded and are not part of any build.

---

## Quick start

Two terminals, because the website needs the API to return anything.

```bash
# 1. API on :3000
cd server
npm install
cp .env.example .env        # then fill in the keys marked required
npm start

# 2. Website on :5173
cd website
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:3000`, so no environment file is
needed for local development. Open http://localhost:5173.

### Website checks

```bash
cd website
npm run lint      # ESLint
npm test          # Vitest — renders every route against a stubbed API
npm run build     # production bundle into dist/
npm run check     # all three, in that order
```

The test suite is a route smoke test: it mounts each page with a stubbed API
and asserts the page renders, submits and gates correctly. It is the fastest
way to catch a broken import or a field the server never sends.

---

## Configuration

### Website

Every website setting is resolved in one file, `website/src/config/config.js`.
Copy `website/.env.example` to `website/.env.local` and set what you need.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | same-origin | Absolute API origin. Leave unset unless the API is on another domain. |
| `VITE_SITE_URL` | the Vercel URL | Used for share links and canonical URLs. |
| `VITE_FEATURE_FACTCHECK` | `true` | Set `false` to remove `/fact-check`. |
| `VITE_FEATURE_POLITICIANS` | `true` | Set `false` to remove `/politicians`. |
| `VITE_FEATURE_MAP` | `true` | Set `false` to remove `/map`. |
| `VITE_FEATURE_FEED` | `true` | Set `false` to remove `/live`. |
| `VITE_FEATURE_REPORTS` | `true` | Set `false` to remove `/report`. |
| `VITE_FEATURE_ADMIN` | `true` | Set `false` to remove `/admin`. |
| `VITE_ADMIN_PASSWORD` | `civicsense` | Admin access gate. See the warning below. |

A feature set to `false` removes the surface properly: the card, the navigation
link and the route. `FeatureGate` renders the 404 page, so a disabled feature is
unreachable by typing its URL rather than merely unlisted.

> **The admin password is not a security boundary.** It is a `localStorage` flag
> that hides the console from a casual visitor. Anyone who opens developer tools
> can read the data. The moderation endpoints in `server/server.js` are
> currently unauthenticated, which is the real gap to close. `AdminSettings`
> says so on screen, and `services/auth.js` warns while the default is in use.

### Server

`server/.env.example` lists every key. The ones without a working default:
`OPENROUTER_API_KEY` (the model behind the verdict), `TAVILY_API_KEY` (live
search), `MONGODB_URI` (article index and moderation queue),
`TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` (WhatsApp), and
`TELEGRAM_BOT_TOKEN`. The pipeline degrades honestly without them: with no model
key, `/api/factcheck` returns an error rather than inventing a verdict, and
with no database the moderation queue reads as empty rather than pretending to
hold reports.

---

## Deployment

### Website

Static output in `dist/`. `vercel.json` and `netlify.toml` both ship the SPA
fallback, so a deep link like `/politicians/peter-gregory-obi` reaches the app instead
of a 404, and hashed assets get a one-year immutable cache.

If the API is on a different domain, set `VITE_API_URL` to its origin. The
site's own privacy promises depend on that staying first-party — see below.

### Server

Any Node host that can run `npm start` and keep a process alive. It needs a
reachable `MONGODB_URI`; without one the moderation endpoints return empty
lists rather than failing loudly.

---

## What this system does not do

Stated here because the code is the honest source and the claims should match it.

- **The admin console is not secure.** Password-gated, not authenticated.
- **The report form takes no images.** The server stores evidence as a string.
  The form therefore offers a text box and points people at WhatsApp for
  screenshots, where the bot really does read the image. An upload control that
  silently wrote `{}` to the database would be worse than no control at all.
- **The politician directory is read-only.** 36 profiles covering the 18
  presidential tickets INEC certified for the 16 January 2027 election, each one
  generated from that single primary document rather than typed in by hand. There
  is no CRUD API, so an edit is a change to `website/src/data/elections2027.js`
  and needs named human review.
- **"Verified" on a profile means one narrow thing.** It means INEC cleared that
  person to contest, and it is scoped to that claim alone. The public record,
  career history, education, statements and investigations arrays all ship empty
  and render as an explicit "nothing verified yet", because naming a living
  person as corrupt is defamatory if it is wrong and an empty section is the
  honest state.
- **Being a candidate is not a record.** A ticket says who is running and with
  whom. It says nothing about anyone's conduct, and the site must never let the
  two blur together.
- **Six of the 36 profiles have a photograph.** Every portrait is licence-cleared
  and credited twice: in a caption under the photo, and in full on `/credits`.
  Stock images and news-scraped photos are not used, because putting the wrong
  face next to a real name is misinformation. The rest render their initials.
- **The local government roster is empty.** `website/src/data/lgas.js` has no
  data because no official gazette has been transcribed. The report form falls
  back to a free-text field, which is worse for data quality but better than
  sending reports to the wrong local government.
- **The map loads no tiles.** A third-party tile server would see every
  visitor's IP address and the exact rectangle they loaded. Instead the map draws
  Nigeria's state outlines from boundaries compiled into the bundle, by
  `website/scripts/build-boundaries.mjs`, over a graticule, and plots
  state-capital centroids. Boundaries are geoBoundaries gbOpen ADM1, CC BY 4.0,
  credited on the map itself.
- **Analytics describe the last 50 fact-checks.** Not lifetime totals, and not
  visitors. There is no analytics vendor and no tracking script of any kind.

---

## Where the data comes from

Two published facts carry almost all of the site's civic weight, and both trace to
a primary document rather than to a research pass:

| Data | Source | Licence / citation |
|---|---|---|
| Candidates, parties, running mates, ages, genders | [INEC final list of candidates](https://inecnigeria.org/documents/press/2027%20PRESIDENTIAL%20FINAL%20LIST.pdf), published 12 September 2026, signed by Rose Oriaran-Anthony | Primary source. Transcribed into `website/src/data/elections2027.js` |
| State boundaries | [geoBoundaries](https://github.com/wmgeolab/geoBoundaries) gbOpen NGA ADM1, compiled into the bundle | CC BY 4.0, credited on the map and on `/credits` |
| Politician photographs | Wikimedia Commons, plus US federal and Voice of America public-domain material | Per image, recorded in `website/src/data/photos.js` and listed on `/credits` |

`/credits` renders the full attributions in one place, because a CC BY or CC BY-SA
licence requires credit and "somewhere in the repo" is not where a reader will
look for it.

---

## The bot

Send a claim to the WhatsApp sandbox or the Telegram bot. The pipeline:

1. Extract the claim, from text or from an image.
2. Search the local RSS index and live search in parallel.
3. Read the retrieved articles once and return a structured verdict.
4. Format it for the channel, with source links.

`documentation/CONTEXT_v2.md` has the product context and `documentation/API.md`
the endpoint reference. `documentation/page_content_text.md` holds the public
copy in one place, for review and for translation.

---

## Design

The website follows `civic_sense_v1/fc_dashboard`: `#0a0a0a` surface, `#141414`
cards, `#1e1e1e` borders, Inter, green accents, restrained motion, visible focus
rings. Tokens live in `website/src/styles/index.css`. Leaflet is bundled rather
than loaded from a CDN, because a CDN request is a third party learning who
visited.

---

## Licence

See `LICENSE`.
