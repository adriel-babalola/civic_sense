# CivicSense — WhatsApp AI Fact-Checking Bot for Nigerians

> **Send a rumour to WhatsApp. Get the truth back.**

CivicSense is a real-time fact-checking bot that lives inside WhatsApp. No app download. No sign-up. Any Nigerian can forward a political rumour, claim, or headline to our WhatsApp number and receive a structured, sourced verdict within 20 seconds.

---

## The Problem

Nigerian political discourse is flooded with misinformation — fake news about elections, fuel prices, government policies, security incidents, and economic data spreads faster than corrections. Most fact-checking tools require visiting a website, which is a non-starter for the 60%+ of Nigerians who experience the internet primarily through WhatsApp.

## The Solution

A WhatsApp bot powered by AI that:
1. Receives any political claim forwarded to a WhatsApp number
2. Searches a curated Nigerian civic knowledge base **and** live Nigerian news sources
3. Runs the evidence through Gemini 2.5 Flash for a structured verdict
4. Replies within 20 seconds with a clear verdict: **VERIFIED, MISLEADING, FALSE, or UNVERIFIED**

No website to visit. No app to install. The bot meets users where they already are.

---

## Architecture

```
WhatsApp User → Twilio Webhook → Express Server (server.js)
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                    Tavily API   civic_kb.json   Gemini 2.5 Flash
                   (live news)  (curated facts)  (RAG reasoning)
                          │          │          │
                          └──────────┼──────────┘
                                     ▼
                              Formatted Verdict
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                     Twilio Reply   MongoDB     Dashboard + Website
                     (WhatsApp)   (persistence) (two React SPAs)
```

### Data Flow

1. **User** sends a WhatsApp message with a claim
2. **Twilio** fires a POST to `/webhook` on the Express server
3. **Tavily Search API** fetches 5 relevant live results from Nigerian news domains (Premium Times, Punch, TheCable, Channels TV, Vanguard, Daily Post)
4. **Knowledge Base** (civic_kb.json, 25 curated entries) is searched for keyword matches
5. **Gemini 2.5 Flash** via OpenRouter receives the claim + KB context + live search results and returns a structured verdict
6. **Verdict** is formatted, sent back to the user via Twilio, and logged to MongoDB

---

## Features

| Feature | Status | Details |
|---|---|---|
| **WhatsApp Fact-Checking** | ✅ **Live** | Twilio webhook → AI pipeline → instant reply |
| **Live News Search** | ✅ **Live** | Tavily API queries 6 major Nigerian news domains |
| **Civic Knowledge Base** | ✅ **Live** | 25 curated entries covering fuel subsidy, elections, CBN policy, security, education |
| **Fact-Check Dashboard** | ✅ **Live** | React SPA with real-time feed, 7-day chart, stats, trends, export CSV |
| **Interactive Chat UI** | ✅ **Live** | Web interface for fact-checking without WhatsApp |
| **MongoDB Persistence** | ✅ **Live** | All verdicts logged with timestamps and channel metadata |
| **Anonymous Reporting** | ✅ **Live** | Submit misconduct reports (type, description, state, LGA) — admin approve/reject workflow |
| **Public Incident Map** | ✅ **Live** | Leaflet map of Nigeria with color-coded incident markers + live feed |
| **Public Website** | ✅ **Live** | Landing page, report form, and incident map for the general public |
| **Conflict Tracker** | 🔄 **Beta** | Real-time conflict monitoring by state and LGA |
| **RSS News Scraper** | 📋 **Planned** | Background scraper for continuous news ingestion |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express 4 |
| **AI Model** | Gemini 2.5 Flash (via OpenRouter API) |
| **Web Search** | Tavily API (Nigerian news domain-scoped) |
| **Database** | MongoDB Atlas (free tier) |
| **WhatsApp Gateway** | Twilio WhatsApp Sandbox |
| **Dashboard** | React 19 + React Router 7 + Vite 6 |
| **Public Website** | React 19 + React Router 7 + Vite 6 |
| **Maps** | Leaflet + react-leaflet |
| **Icons** | Lucide React |
| **Styling** | Tailwind CSS v4 |
| **Dashboard Deploy** | Vercel |
| **Bot Deploy** | Railway |

---

## Project Structure

```
civic_sense/
├── bot_server/                        # WhatsApp bot + AI pipeline
│   ├── server.js                      # Express webhook + REST API (all endpoints)
│   ├── package.json
│   ├── .env.example
│   ├── services/
│   │   ├── gemini.js                  # Gemini RAG via OpenRouter + KB lookup + cache
│   │   ├── search.js                  # Tavily web search
│   │   └── db.js                      # MongoDB connection + FactCheck + Report schemas
│   ├── data/
│   │   └── civic_kb.json              # 25 curated Nigerian civic facts
│   └── test/
│       └── testKratos.js              # 20-test claim harness
│
├── fc_dashboard/                      # Admin dashboard (React SPA)
│   ├── src/
│   │   ├── App.jsx                    # Router + layout + sidebar control
│   │   ├── config.js                  # API base URL from env
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Live feed, 7-day chart, stats, trend widgets
│   │   │   ├── Chat.jsx               # Interactive fact-check chat
│   │   │   ├── ConflictTracker.jsx    # RSS dummy feed with filter/delete/reset
│   │   │   └── Reports.jsx            # Admin panel with approve/reject workflow
│   │   ├── components/
│   │   │   ├── FactCheckCard.jsx      # Verdict card with source pills
│   │   │   ├── FactCheckModal.jsx     # Submit claim modal
│   │   │   ├── Sidebar.jsx            # Navigation + bot status widget
│   │   │   ├── SkeletonCard.jsx       # Loading shimmer
│   │   │   └── StatsRow.jsx           # 5 verdict stat counters
│   │   └── utils/
│   │       └── parseVerdict.js        # Regex verdict parser
│   ├── index.html
│   ├── vercel.json
│   └── vite.config.js
│
├── cs_website/                        # Public website (React SPA)
│   ├── src/
│   │   ├── App.jsx                    # BrowserRouter with Home / Report / Map routes
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Premium bento grid hero + features
│   │   │   ├── Report.jsx             # Anonymous report form with loading spinner
│   │   │   └── Map.jsx                # Leaflet map + incident card feed
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Fixed glassmorphism header
│   │   │   ├── Footer.jsx             # 3-column footer
│   │   │   └── IncidentCard.jsx       # Glassmorphism incident card
│   │   └── api/
│   │       └── client.js              # submitReport, fetchIncidents, fetchReports
│   ├── index.html
│   ├── index.css                      # Tailwind v4 theme (#050505, Inter, rounded-2xl)
│   └── vite.config.js
│
├── CONTEXT.md                         # Original project brief
└── README.md                          # This file
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/webhook` | Twilio WhatsApp webhook |
| `POST` | `/api/chat` | Submit a claim for fact-checking (JSON) |
| `GET` | `/api/factchecks` | Get recent fact-checks (20 items) |
| `GET` | `/api/fact-checks` | Get recent fact-checks (50 items) |
| `POST` | `/api/reports` | Submit an anonymous report |
| `GET` | `/api/reports` | Get all reports (admin) |
| `PATCH` | `/api/reports/:id/approve` | Approve a report |
| `PATCH` | `/api/reports/:id/reject` | Reject a report |
| `GET` | `/api/incidents` | Get approved reports + seed news |

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

### Example: POST /api/reports

```json
// Request
{
  "type": "misconduct",
  "description": "Police extortion at checkpoint",
  "state": "Lagos",
  "lga": "Ikeja",
  "evidence": "https://example.com/photo.jpg"
}

// Response
{
  "success": true,
  "data": {
    "_id": "...",
    "type": "misconduct",
    "status": "pending"
  }
}
```

---

## Verdict Format

Every response follows this exact structure:

```
*VERDICT: [VERIFIED / MISLEADING / FALSE / UNVERIFIED]*
*Confidence: [0-100]%*
*What we found:*
[2–4 plain English sentences explaining the evidence]
*Source:*
[List of live URLs from search results]
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB connection string (Atlas free tier)
- OpenRouter API key
- Tavily API key
- Twilio account with WhatsApp Sandbox enabled

### Bot Server Setup

```bash
# Clone the repo
git clone https://github.com/adriel-babalola/civic_sense.git
cd civic_sense/bot_server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in your keys (see .env.example)

# Start the server
npm start

# Run the test harness (20 claims)
npm test
```

### Dashboard Setup

```bash
cd civic_sense/fc_dashboard
npm install
npm run dev       # starts on localhost:5173
```

### Public Website Setup

```bash
cd civic_sense/cs_website
npm install
npm run dev       # starts on localhost:5173 (use different port)
```

### Environment Variables

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key for Gemini 2.5 Flash |
| `TAVILY_API_KEY` | Tavily search API key |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number |
| `PORT` | Server port (default: 3000) |
| `VITE_API_URL` | API base URL (for dashboard + website, default: http://localhost:3000) |

---

## The Demo

1. Hand a judge the phone
2. They type any Nigerian political claim into WhatsApp
3. Bot replies with a verdict in under 30 seconds
4. Type "What is happening in Kano?" — Conflict Tracker responds
5. Type "Report" — Anonymous Reporting flow starts
6. Close: *"Three civic tools. One WhatsApp number. No app. No sign-up. Any Nigerian can use this right now."*

---

## Roadmap

- [x] WhatsApp webhook with Twilio
- [x] Gemini RAG fact-check pipeline
- [x] 25-entry civic knowledge base
- [x] Live web search via Tavily
- [x] MongoDB persistence
- [x] Public fact-check dashboard (feed, chat, stats, chart)
- [x] Anonymous incident reporting (submit → admin approve → public map)
- [x] Interactive chat UI in dashboard
- [x] Public website (home, report form, incident map)
- [x] Conflict Tracker — Beta
- [ ] Grow knowledge base to 60–80 entries
- [ ] RSS news scraper for continuous news ingestion
- [ ] User authentication for dashboard admin
- [ ] Multi-language support (Pidgin, Yoruba, Hausa, Igbo)

---

## Team

| Role | Person |
|---|---|
| WhatsApp Webhook & Backend | adriel-babalola |
| AI Pipeline & Dashboard | debugAyo |
| Knowledge Base Curation | adriel-babalola |

---

## Acknowledgements

- **Gemini 2.5 Flash** via OpenRouter for AI reasoning
- **Tavily** for Nigerian news search
- **Twilio** for WhatsApp integration
- **MongoDB Atlas** for free-tier database hosting
- **Leaflet** for open-source maps
- **Premium Times, Punch, TheCable, Channels TV, Vanguard, Daily Post** for Nigerian journalism

---

*Built for the Nigerian Civic Tech space. Fighting misinformation one WhatsApp message at a time.*
