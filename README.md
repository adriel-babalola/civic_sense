# CivicSense — WhatsApp AI Fact-Checking Bot for Nigerians

> **Send a rumour to WhatsApp. Get the truth back.**

CivicSense is a real-time fact-checking bot that lives inside WhatsApp. No app download. No sign-up. Any Nigerian can forward a political rumour, claim, or headline to our WhatsApp number and receive a structured, sourced verdict within 20 seconds.

**Live:** WhatsApp via Twilio Sandbox | **Dashboard:** [civicsense.vercel.app](https://civicsense.vercel.app)

---

## The Problem

Nigerian political discourse is flooded with misinformation — fake news about elections, fuel prices, government policies, security incidents, and economic data spreads faster than corrections. Most fact-checking tools require visiting a website, which is a non-starter for the 60%+ of Nigerians who experience the internet primarily through WhatsApp.

## The Solution

Meet CivicSense — "Kratos." A WhatsApp bot powered by AI that:
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
                     Twilio Reply   MongoDB     Dashboard
                     (WhatsApp)   (persistence) (React SPA)
```

### Data Flow

1. **User** sends a WhatsApp message with a claim
2. **Twilio** fires a POST to `/webhook` on the Express server
3. **Tavily Search API** fetches 5 relevant live results from Nigerian news domains (Premium Times, Punch, TheCable, Channels TV, Vanguard, Daily Post)
4. **Knowledge Base** (civic_kb.json, 25 curated entries) is searched for keyword matches
5. **Gemini 2.5 Flash** via OpenRouter receives the claim + KB context + live search results and returns a structured verdict
6. **Verdict** is formatted, sent back to the user via Twilio, and logged to MongoDB for the public dashboard

---

## Features

| Feature | Status | Details |
|---|---|---|
| **WhatsApp Fact-Checking** | ✅ **Live** | Twilio webhook → AI pipeline → instant reply |
| **Live News Search** | ✅ **Live** | Tavily API queries 6 major Nigerian news domains |
| **Civic Knowledge Base** | ✅ **Live** | 25 curated entries covering fuel subsidy, elections, CBN policy, security, education |
| **Fact-Check Dashboard** | ✅ **Live** | React SPA with real-time feed, stats, trends, export |
| **Interactive Chat UI** | ✅ **Live** | Web interface for fact-checking without WhatsApp |
| **MongoDB Persistence** | ✅ **Live** | All verdicts logged with timestamps and channel metadata |
| **Conflict Tracker** | 🔄 **Beta** | Real-time conflict monitoring by state and LGA — in active development |
| **Anonymous Reporting** | 🔄 **Beta** | Submit misconduct reports with identity protection — in active development |
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
| **Web Dashboard** | React 19 + React Router 7 |
| **Styling** | Tailwind CSS v4 |
| **Dashboard Build** | Vite 6 |
| **Dashboard Deploy** | Vercel |
| **Bot Deploy** | Railway |

---

## Project Structure

```
civic_sense/
├── bot_server/                        # WhatsApp bot + AI pipeline
│   ├── server.js                      # Express webhook + REST API
│   ├── package.json
│   ├── .env.example
│   ├── services/
│   │   ├── gemini.js                  # Gemini RAG via OpenRouter
│   │   ├── search.js                  # Tavily web search
│   │   └── db.js                      # MongoDB connection + schema
│   ├── data/
│   │   └── civic_kb.json              # 25 curated Nigerian civic facts
│   └── test/
│       └── testKratos.js              # 20-test claim harness
│
├── fc_dashboard/                      # Public web dashboard
│   ├── src/
│   │   ├── App.jsx                    # Router + layout
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Live feed, stats, widgets
│   │   │   ├── Chat.jsx               # Interactive fact-check chat
│   │   │   ├── ConflictTracker.jsx    # Beta — placeholder
│   │   │   └── Reports.jsx            # Beta — placeholder
│   │   ├── components/
│   │   │   ├── FactCheckCard.jsx      # Verdict card with source pills
│   │   │   ├── FactCheckModal.jsx     # Submit claim modal
│   │   │   ├── Feed.jsx              # Auto-refreshing feed
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── SkeletonCard.jsx      # Loading shimmer
│   │   │   └── StatsRow.jsx          # Verdict stat counters
│   │   └── utils/
│   │       └── parseVerdict.js        # Regex verdict parser
│   ├── index.html
│   ├── vercel.json
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

### Example: POST /api/chat

```json
// Request
{ "claim": "Did Tinubu remove the fuel subsidy?" }

// Response
{
  "success": true,
  "data": {
    "claim": "Did Tinubu remove the fuel subsidy?",
    "verdict": "*VERDICT: VERIFIED*\n*Confidence: 95%*\n*What we found:*\nPresident Tinubu announced the removal of the petrol subsidy during his inauguration speech on May 29 2023. Fuel prices rose from 185 naira per litre to over 500 naira. The policy has been confirmed by NNPC and major media outlets.\n*Source:*\nhttps://www.premiumtimesng.com/..."
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

### Setup

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

---

## The Demo

1. Hand a judge the phone
2. They type any Nigerian political claim into WhatsApp
3. Bot replies with a verdict in under 30 seconds
4. Type "What is happening in Kano?" — Conflict Tracker responds (Beta)
5. Type "Report" — Anonymous Reporting flow starts (Beta)
6. Close: *"Three civic tools. One WhatsApp number. No app. No sign-up. Any Nigerian can use this right now."*

---

## Roadmap

- [x] WhatsApp webhook with Twilio
- [x] Gemini RAG fact-check pipeline
- [x] 25-entry civic knowledge base
- [x] Live web search via Tavily
- [x] MongoDB persistence
- [x] Public fact-check dashboard
- [x] Interactive chat UI
- [ ] Grow knowledge base to 60–80 entries
- [x] **Conflict Tracker** — Beta (in development)
- [x] **Anonymous Reporting** — Beta (in development)
- [ ] RSS news scraper for continuous news ingestion
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
- **Premium Times, Punch, TheCable, Channels TV, Vanguard, Daily Post** for Nigerian journalism

---

*Built for the Nigerian Civic Tech space. Fighting misinformation one WhatsApp message at a time.*
