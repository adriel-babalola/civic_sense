# CivicSense — Project Context

## What We Are Building
CivicSense is a WhatsApp AI fact-checking bot for Nigerians.
A user forwards any political rumour or claim to our WhatsApp number.
Our bot extracts the claim, queries a Nigerian civic knowledge base,
calls Gemini, and returns a verdict in under 30 seconds.

No app. No sign-up. Just send a message and get the truth back.

## The One Line
"Send a rumour to WhatsApp. Get the truth back."

## Why This Wins
Every other team will demo a website form on a laptop.
We hand a judge a phone. They type a real Nigerian claim into WhatsApp.
The bot replies with a verdict in 20 seconds. That is the product working
in real life, in the judges hands.

---

## Folder Structure

civicsense/
├── CONTEXT.md            (This file — read before touching anything)
├── bot_server/           (PRIMARY — the WhatsApp bot and AI pipeline)
│   ├── server.js         (Express webhook entry point)
│   ├── scraper.js        (Background RSS scraper, runs every 30 mins)
│   ├── services/
│   │   ├── gemini.js     (Gemini RAG fact-check logic)
│   │   └── db.js         (MongoDB connection, read and write)
│   ├── data/
│   │   └── civic_kb.json (Manually curated Nigerian civic knowledge base)
│   ├── .env.example      (Copy to .env and fill in your keys)
│   └── package.json
│
└── fc_dashboard/         (SECONDARY — public web feed, build after bot works)
    ├── App.jsx           (React page pulling recent fact-checks from MongoDB)
    ├── index.html
    └── vercel.json

---

## How the Bot Works (Data Flow)

1. User sends WhatsApp message to our Twilio number
2. Twilio fires a POST request to bot_server/server.js
3. server.js reads the message and checks what command it is:
   - Default: run fact-check pipeline
   - "What is happening in [State]": run conflict tracker (stretch goal)
   - "Report": start anonymous reporting flow (stretch goal)
4. Fact-check pipeline:
   a. gemini.js embeds the user claim
   b. Searches civic_kb.json + scraped news in MongoDB
   c. Passes retrieved context + claim to Gemini API
   d. Gemini returns structured verdict
5. server.js sends verdict back to user via Twilio
6. Fact-check is logged to MongoDB (fc_dashboard reads from here)

---

## Verdict Format (What Gemini Returns)

Every response must follow this structure exactly:

*VERDICT: [VERIFIED / MISLEADING / FALSE / UNVERIFIED]*

*What we found:*
2 to 3 sentences of plain English explaining the evidence.

*Source:* [Name of source from knowledge base or scraped news]

---

## The Knowledge Base (civic_kb.json)

Located at bot_server/data/civic_kb.json
This is a manually curated array of Nigerian civic facts.
Format:

[
  {
    "id": "001",
    "topic": "fuel subsidy",
    "claim": "The fuel subsidy was removed in May 2023",
    "verdict": "VERIFIED",
    "explanation": "President Tinubu announced the removal during his inauguration speech on May 29 2023",
    "source": "Premium Times"
  }
]

Add facts here. Accuracy beats quantity. Target 60 to 80 entries.
Topics to cover: fuel subsidy, NASS bills, INEC election results,
federal budget figures, CBN policies, security incidents.

---

## Environment Variables

Copy .env.example to .env and fill in:

GEMINI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
MONGODB_URI=
PORT=3000

Never commit .env to GitHub.

---

## Tech Stack

- Runtime: Node.js
- Framework: Express
- AI: Gemini 2.5 Flash via Google AI SDK
- Database: MongoDB Atlas (free tier)
- WhatsApp Gateway: Twilio WhatsApp Sandbox
- Scraper: axios + cheerio targeting RSS feeds
- Dashboard: React + Tailwind deployed on Vercel
- Bot Deployment: Railway

---

## Feature Ownership

| Feature | Folder | Owner | Priority |
|---|---|---|---|
| WhatsApp webhook | bot_server/server.js | adriel-babalola | MUST SHIP |
| Gemini RAG pipeline | bot_server/services/gemini.js | debugAyo | MUST SHIP |
| MongoDB connection | bot_server/services/db.js | debugAyo | MUST SHIP |
| Civic knowledge base | bot_server/data/civic_kb.json | adriel-babalola | MUST SHIP |
| RSS scraper | bot_server/scraper.js | adriel-babalola | HIGH |
| Public dashboard | fc_dashboard/ | debugAyo | MEDIUM |
| Conflict tracker | bot_server/server.js (new branch) | — | STRETCH |
| Anonymous reporting | bot_server/server.js (new branch) | — | STRETCH |

---

## Submission Requirements (Friday 2PM Deadline)

- [ ] Deployed bot URL on Railway (not ngrok)
- [ ] WhatsApp bot responds to at least 10 test claims correctly
- [ ] GitHub repo with meaningful commit history and clear README
- [ ] fc_dashboard deployed on Vercel with live fact-check feed
- [ ] Pitch deck ready (5 slides max)

---

## The Demo Script (Saturday 3PM)

1. Hand judge the phone
2. They type any Nigerian political claim into WhatsApp
3. Bot replies with verdict in under 30 seconds
4. Type "What is happening in Kano?" — conflict tracker responds
5. Close: "Three civic tools. One WhatsApp number.
   No app. No sign-up. Any Nigerian can use this right now."

---

## Ground Rules

- Do not add new features until the fact-checker works end to end
- Do not merge to main unless your feature is tested and working
- Commit often with meaningful messages ("add gemini RAG pipeline" not "update")
- If something breaks, check .env keys first, then check MongoDB connection
- The bot must work on Saturday. Everything else is secondary.
