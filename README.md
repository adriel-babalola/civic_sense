# CivicSense — WhatsApp AI Fact-Checking Bot for Nigerians

> **Send a rumour to WhatsApp. Get the truth back.**

CivicSense is a real-time fact-checking bot that lives inside WhatsApp. No app download. No sign-up. Any Nigerian can forward a political rumour, claim, or headline to our WhatsApp number and receive a structured, sourced verdict within 20 seconds.

---

## Test the Bot (For Judges)

Scan the QR code, or send a WhatsApp message to **+1 415 523 8886** with the code **`join angle-building`** to connect to the CivicSense sandbox.

![WhatsApp QR](image.png)

Once connected, send any of these test claims:

| Claim | Expected Verdict |
|---|---|
| "Did Tinubu remove the fuel subsidy?" | **VERIFIED** |
| "Is petrol 200 naira per litre?" | **FALSE** |
| "Did Nigeria's debt exceed 100 trillion?" | **VERIFIED** |
| "Is minimum wage now 70k?" | **VERIFIED** |
| "Did Peter Obi win Lagos in 2023?" | **VERIFIED** |
| "Did INEC declare Tinubu winner of 2023 election?" | **VERIFIED** |

The bot replies within 20 seconds with a structured verdict, evidence, and sources. Try it on the spot — no app download, no sign-up required.

---

## The Demo (3 Minutes for Judges)

| Step | What Happens |
|------|-------------|
| **1.** Hand judge the phone with WhatsApp open | Bot is already connected via Twilio Sandbox |
| **2.** Judge types any claim — e.g. *"Did Tinubu remove the fuel subsidy?"* | ... |
| **3.** Bot replies in ~15s with verdict: `VERIFIED` + evidence + source link | Pipeline: Tavily search → KB lookup → Gemini 2.5 Flash → reply |
| **4.** Show the **public website** — see every verified incident on a live Leaflet map of Nigeria | Color-coded by type: red (violence), amber (misconduct), orange (unrest) |
| **5.** Show the **admin dashboard** — live feed, 7-day chart, trending claims, source breakdown, export CSV | Chat UI, approve/reject reports, Conflict Tracker beta |
| **6.** Close: *"Three civic tools. One WhatsApp number. No app. No sign-up. Any Nigerian can use this right now."* | |

---

## Architecture

```
WhatsApp User ──→ Twilio ──→ Express Server (server.js)
                                  │
          ┌──────────────┬────────┼────────────┬─────────────┐
          ▼              ▼        ▼            ▼             ▼
    RSS Scraper      Tavily    civic_kb.json  Gemini 2.5   MongoDB
    (17 NG feeds,    (live     (25 curated    Flash via    (article
     30-min sync)    search)   civic facts)   OpenRouter)  index)
          │              │        │            │
          └──────────────┴────────┼────────────┘
                                  ▼
                          Formatted Verdict
                          (text + structured
                           JSON, sources[])
                                  │
                     ┌────────────┼────────────┐
                     ▼            ▼            ▼
                Twilio Reply   MongoDB      2 React SPAs
                (WhatsApp)   (persistence)  (Dashboard + Website)
```

### Data Flow (<8s typical, <15s p95)

1. User sends a text claim and/or an image to `/api/factcheck` or the Twilio `/webhook`
2. If an image is sent, Gemini vision extracts the claim (image is analyzed only, never stored)
3. Retrieval runs in **parallel**: civic_kb.json keyword match + MongoDB article index (RSS) + Tavily live search
4. All evidence goes into a **single Gemini 2.5 Flash call** → structured verdict (JSON) + formatted WhatsApp reply
5. Verdict logged to MongoDB (dashboard reads from here), replied to the user

---

## Project Structure

```
civic_sense/
├── bot_server/                        # WhatsApp bot + AI pipeline (Express)
│   ├── server.js                      # Webhook + REST API (single /api/factcheck endpoint)
│   ├── scripts/
│   │   └── verify-feeds.js            # Checks all 17 RSS feeds (npm run verify:feeds)
│   ├── services/
│   │   ├── pipeline.js                # Orchestrator: parallel retrieval + single LLM call
│   │   ├── gemini.js                  # Gemini RAG + vision claim extraction + LRU cache
│   │   ├── scraper.js                 # RSS sync (17 NG feeds) into Mongo article index
│   │   ├── newsSources.js             # Registry: 17 NG news + fact-check sources
│   │   ├── search.js                  # Tavily live search (16 Nigerian domains)
│   │   ├── cache.js                   # Bounded LRU cache (TTL + max entries)
│   │   ├── image.js                   # Image validation/decoding only (never stored)
│   │   └── db.js                      # MongoDB: FactCheck + Article + Report schemas
│   ├── data/
│   │   └── civic_kb.json              # 25 curated Nigerian civic facts
│   ├── test/
│   │   ├── testKratos.js              # 12 parallel live claims (npm test)
│   │   └── testPipeline.js            # End-to-end: server, image, scraper (npm run test:pipeline)
│   └── package.json
│
├── fc_dashboard/                      # Admin dashboard (React 19 + Vite 6)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Live feed, 7-day chart, stats, trends, CSV export
│   │   │   ├── Chat.jsx               # Interactive fact-check UI (like WhatsApp in browser)
│   │   │   ├── ConflictTracker.jsx    # RSS-simulated incident feed with filter/delete/reset
│   │   │   └── Reports.jsx            # Admin approve/reject workflow
│   │   ├── components/
│   │   │   ├── FactCheckCard.jsx      # Verdict card with badge, evidence, source pills
│   │   │   ├── FactCheckModal.jsx     # Submit claim modal
│   │   │   ├── Sidebar.jsx            # Navigation + QR code + bot status
│   │   │   ├── SkeletonCard.jsx       # Loading shimmer
│   │   │   └── StatsRow.jsx           # 5 verdict stat counters
│   │   ├── utils/
│   │   │   └── parseVerdict.js        # Regex parser for verdict format
│   │   ├── App.jsx                    # BrowserRouter + 4 routes
│   │   └── config.js                  # API_BASE + WHATSAPP_NUMBER
│   ├── index.html
│   ├── vite.config.js
│   └── vercel.json
│
├── cs_website/                        # Public website (React 19 + Vite 6)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Bento-grid hero + 3 feature cards
│   │   │   ├── Report.jsx             # Anonymous incident report form
│   │   │   └── Map.jsx                # Leaflet map + color-coded markers + live feed
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Fixed glassmorphism header
│   │   │   ├── Footer.jsx             # 3-column footer
│   │   │   └── IncidentCard.jsx       # Incident card with type badge
│   │   ├── api/
│   │   │   └── client.js              # submitReport, fetchIncidents
│   │   ├── App.jsx                    # BrowserRouter + 3 routes
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── website/                          # Public site (Next.js 15, App Router, Tailwind v4)
│   ├── src/app/                       # Site pages + new feature pages
│   │   ├── page.tsx                   # Home: hero, how-it-works, sources, team, CTA
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── src/components/                # about, hero, how-it-works, team, sources-ticker, ...
│   ├── src/config/site-config.ts
│   ├── next.config.ts
│   └── package.json
│
├── documentation/                     # Supplementary docs
│   ├── API.md                          # Bot server API reference (all endpoints)
│   ├── CONTEXT.md                      # Original project brief (internal)
│   ├── CONTEXT_v2.md                   # Platform roadmap: 3 features, 4-month sprint
│   └── script.md                       # Judge demo script (internal)
└── README.md                          # This file
```

---

## Features

| Feature | Status |
|---------|--------|
| **WhatsApp Fact-Checking** — Twilio webhook → AI pipeline → instant reply (incl. image claims) | ✅ Live |
| **Telegram Fact-Checking** — BotFather bot, same pipeline (text + photo claims) | ✅ Live |
| **Live News Search** — Tavily API queries 16 major Nigerian news domains | ✅ Live |
| **RSS Article Index** — 17 Nigerian feeds (news + IFCN fact-checkers) synced every 30 min into MongoDB | ✅ Live |
| **Image Claim Extraction** — send a screenshot/poster, bot reads the claim (analyzed only, never stored) | ✅ Live |
| **Civic Knowledge Base** — 25 curated entries (fuel subsidy, elections, CBN, security, education) | ✅ Live |
| **Fact-Check Dashboard** — Real-time feed, 7-day chart, stats, trending, CSV export | ✅ Live |
| **Interactive Chat UI** — Web fact-check interface (mirrors WhatsApp bot) | ✅ Live |
| **MongoDB Persistence** — All verdicts logged with timestamps and channel metadata | ✅ Live |
| **Anonymous Reporting** — Submit reports (violence/misconduct/unrest) → admin approve/reject → public map | ✅ Live |
| **Public Incident Map** — Leaflet map of Nigeria with 36-state coordinates + color-coded markers | ✅ Live |
| **Public Website** — Landing page, report form, incident map | ✅ Live |
| **Conflict Tracker** — Incident feed with type filter, delete, and reset | 🔄 Beta |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 4 |
| AI Model | Gemini 2.5 Flash (via OpenRouter) |
| Web Search | Tavily API (Nigerian domain-scoped) |
| Database | MongoDB Atlas (free tier) |
| WhatsApp | Twilio Sandbox |
| Dashboard | React 19 + React Router 7 + Vite 6 |
| Website | React 19 + React Router 7 + Vite 6 |
| Maps | Leaflet (standalone, no wrapper) |
| Icons | Lucide React |
| Styling | Tailwind CSS v4 |
| Deploy (Bot) | Railway |
| Deploy (Frontends) | Vercel |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/api/health` | DB + article count + scraper status |
| `POST` | `/webhook` | Twilio WhatsApp webhook (text + image) |
| `POST` | `/webhook/telegram` | Telegram Bot webhook (text + photo, verified via secret token) |
| `POST` | `/api/factcheck` | Single endpoint: post claim and/or image, get verdict (multipart or JSON) |
| `POST` | `/api/chat` | Submit claim for fact-checking (JSON, dashboard-compatible) |
| `GET` | `/api/factchecks` | Get recent fact-checks (50 items) |
| `POST` | `/api/scrape` | Trigger RSS sync (requires `?secret=` from `SCRAPE_SECRET`) |
| `GET` | `/api/sources` | List configured news sources |
| `POST` | `/api/reports` | Submit anonymous report |
| `GET` | `/api/reports` | Get all reports (admin) |
| `PATCH` | `/api/reports/:id/approve` | Approve report → appears on public map |
| `PATCH` | `/api/reports/:id/reject` | Reject report |
| `GET` | `/api/incidents` | Get approved reports + seed data |

### Example: POST /api/factcheck

Multipart form-data (`image` file, optional `claim`, optional `caption`) **or** JSON:

```json
// Request
{ "claim": "Did Tinubu remove the fuel subsidy?" }

// Response
{
  "success": true,
  "data": {
    "claim": "Did Tinubu remove the fuel subsidy?",
    "extractedClaim": null,
    "verdict": "*VERDICT: VERIFIED*\n*Confidence: 95%*\n*What we found:*\nPresident Tinubu announced the removal of the petrol subsidy during his inauguration speech on May 29 2023.\n*Source:*\nhttps://www.premiumtimesng.com/...",
    "structured": {
      "verdict": "VERIFIED",
      "confidence": 95,
      "whatWeFound": "President Tinubu announced the removal of the petrol subsidy during his inauguration speech on May 29 2023.",
      "source": "Premium Times",
      "sources": [{ "title": "...", "url": "https://...", "site": "premiumtimesng.com" }]
    },
    "latencyMs": 3871
  }
}
```

To fact-check an image: send multipart `image=<file>` (or JSON `imageBase64` / `imageUrl`). The image is analyzed to extract the claim and is never stored or served back.

### Verdict Format

```
*VERDICT: [VERIFIED / MISLEADING / FALSE / UNVERIFIED]*
*Confidence: [0-100]%*
*What we found:*
[2-4 plain English sentences explaining the evidence]
*Source:*
[List of live URLs from search results]
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string
- OpenRouter API key
- Tavily API key
- Twilio account with WhatsApp Sandbox

```bash
# Bot server
cd bot_server
cp .env.example .env   # Fill in your keys
npm install
npm start              # Runs on :3000
npm test               # 12 parallel live claims
npm run test:pipeline  # End-to-end: server + image + scraper
npm run verify:feeds   # Check all 17 RSS feeds

# Register the Telegram webhook (run after deploying):
npm run setup:telegram -- https://your-app.up.railway.app/webhook/telegram

# Dashboard (separate terminal)
cd fc_dashboard
npm install
npm run dev            # Local: http://localhost:5173

# Public website (separate terminal)
cd cs_website
npm install
npm run dev            # Local: http://localhost:5174
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for Gemini 2.5 Flash |
| `TAVILY_API_KEY` | Tavily search API key |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Secret for Telegram webhook verification |
| `PORT` | Server port (default: 3000) |
| `LLM_MODEL` | Model ID on OpenRouter (default: `google/gemini-2.5-flash`) |
| `LLM_TIMEOUT_MS` | LLM timeout (default: 25000) |
| `PIPELINE_DEADLINE_MS` | Total pipeline budget (default: 25000) |
| `SCRAPE_INTERVAL_MIN` | RSS sync interval in minutes (default: 30) |
| `ARTICLE_TTL_DAYS` | Days to keep articles in Mongo (default: 14) |
| `SCRAPE_SECRET` | Secret for the `/api/scrape` endpoint |
| `MEDIA_MAX_MB` | Max image upload size (default: 5) |
| `CACHE_TTL_SEC` | Verdict cache TTL (default: 3600) |
| `CACHE_MAX_ENTRIES` | Verdict cache size (default: 300) |
| `RATE_LIMIT_MAX` | Requests per 15 min per IP (default: 60) |
| `VITE_API_URL` | API base URL for frontends |

---

## Team

| Role | Person |
|------|--------|
| WhatsApp Webhook & Backend | adriel-babalola |
| AI Pipeline, Dashboard & Website | debugAyo |
| Knowledge Base Curation | adriel-babalola |

---

## Acknowledgements

- **Gemini 2.5 Flash** via OpenRouter for AI reasoning
- **Tavily** for Nigerian news search
- **Twilio** for WhatsApp integration
- **MongoDB Atlas** for free-tier database
- **Leaflet** for open-source maps
- **Premium Times, Punch, TheCable, Channels TV, Vanguard, Daily Post, Daily Trust, Leadership, Tribune, BusinessDay, PM News, Ripples, Information Nigeria, Dubawa, FactCheckHub, FactCheck Africa** for Nigerian journalism and fact-checking

---

*Built for the Nigerian Civic Tech hackathon. Fighting misinformation one WhatsApp message at a time.*
