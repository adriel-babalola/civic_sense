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
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              Tavily API    civic_kb.json   Gemini 2.5 Flash
             (live news)   (25 curated     (RAG reasoning
              6 NG domains)  civic facts)   via OpenRouter)
                    │            │            │
                    └────────────┼────────────┘
                                 ▼
                          Formatted Verdict
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
               Twilio Reply   MongoDB      2 React SPAs
               (WhatsApp)   (persistence)  (Dashboard + Website)
```

### Data Flow (15-20s end-to-end)

1. User sends WhatsApp message with a claim
2. Twilio fires POST to `/webhook` on Express
3. **Tavily API** fetches 5 live results from Premium Times, Punch, TheCable, Channels TV, Vanguard, Daily Post
4. **civic_kb.json** (25 curated entries) matched by keyword scoring
5. Both fed into Gemini 2.5 Flash (temp 0.1, max 250 tokens) → structured verdict
6. Verdict sent back via Twilio, logged to MongoDB

---

## Project Structure

```
civic_sense/
├── bot_server/                        # WhatsApp bot + AI pipeline (Express)
│   ├── server.js                      # Webhook + REST API (8 endpoints)
│   ├── services/
│   │   ├── gemini.js                  # Gemini RAG + KB lookup + response cache
│   │   ├── search.js                  # Tavily web search (6 Nigerian domains)
│   │   └── db.js                      # MongoDB: FactCheck + Report schemas
│   ├── data/
│   │   └── civic_kb.json              # 25 curated Nigerian civic facts
│   ├── test/
│   │   └── testKratos.js              # 20-test claim harness
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
├── CONTEXT.md                         # Original project brief (internal)
├── script.md                          # Judge demo script (internal)
└── README.md                          # This file
```

---

## Features

| Feature | Status |
|---------|--------|
| **WhatsApp Fact-Checking** — Twilio webhook → AI pipeline → instant reply | ✅ Live |
| **Live News Search** — Tavily API queries 6 major Nigerian news domains | ✅ Live |
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
| `POST` | `/webhook` | Twilio WhatsApp webhook |
| `POST` | `/api/chat` | Submit claim for fact-checking (JSON) |
| `GET` | `/api/factchecks` | Get recent fact-checks (50 items) |
| `POST` | `/api/reports` | Submit anonymous report |
| `GET` | `/api/reports` | Get all reports (admin) |
| `PATCH` | `/api/reports/:id/approve` | Approve report → appears on public map |
| `PATCH` | `/api/reports/:id/reject` | Reject report |
| `GET` | `/api/incidents` | Get approved reports + seed data |

### Example: POST /api/chat

```json
// Request
{ "claim": "Did Tinubu remove the fuel subsidy?" }

// Response
{
  "success": true,
  "data": {
    "claim": "Did Tinubu remove the fuel subsidy?",
    "verdict": "*VERDICT: VERIFIED*\n*Confidence: 95%*\n*What we found:*\nPresident Tinubu announced the removal of the petrol subsidy during his inauguration speech on May 29 2023.\n*Source:*\nhttps://www.premiumtimesng.com/..."
  }
}
```

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
npm test               # 20-claim test harness

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
| `PORT` | Server port (default: 3000) |
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
- **Premium Times, Punch, TheCable, Channels TV, Vanguard, Daily Post** for Nigerian journalism

---

*Built for the Nigerian Civic Tech hackathon. Fighting misinformation one WhatsApp message at a time.*
