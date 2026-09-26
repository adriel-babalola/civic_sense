# CivicSense — Project Context (v2)

> **Companion to [`CONTEXT.md`](./CONTEXT.md).** That file documents the original hackathon build. This one documents where CivicSense is going: the three-feature platform, the 4-month sprint, and the `website/` app that fronts it. Read both.

## What is CivicSense?

CivicSense is a WhatsApp-based civic engagement platform built to combat misinformation and restore accountability in Nigeria. Citizens forward political claims to a WhatsApp bot, get verified verdicts in seconds, report election misconduct anonymously, and access politician profiles with track records and scandals — all without downloading an app or signing up.

**Core Problem:** Misinformation spreads fast on WhatsApp and Facebook. Political news disappears after a few days. Misconduct gets buried. Citizens can't verify claims or remember politician promises. Accountability vanishes.

**Core Solution:** Keep verified truth accessible and searchable in one place so citizens can vote informed and hold leaders accountable.

## Three Core Features

1. **Fact-Checking Bot** — Forward a political claim to WhatsApp. Bot searches verified Nigerian news sources (Premium Times, Punch, TheCable) and returns verdict: VERIFIED / FALSE / MISLEADING / UNVERIFIED. Under 30 seconds. No app.

2. **Anonymous Reporting** — Citizens report election misconduct, violence, or civil unrest. Reports get verified and stamped (Corroborated or Journalistic). Approved reports appear on public incident map by state/LGA.

3. **Politician Profiles** — Searchable database of 50+ politicians with bios, policies, scandals, links to videos/tweets/manifestos. Easy to share. Prevents records from disappearing.

## Repository Layout

| Folder | Role | Stack | Deploy |
|---|---|---|---|
| `bot_server/` | Fact-check pipeline, WhatsApp + Telegram webhooks, RSS scraper, reporting API | Node + Express 4 | Railway |
| `website/` | **Public marketing + product site.** All site pages and new feature pages live here | Next.js 15 (App Router, TS, Tailwind v4) | Vercel |
| `fc_dashboard/` | Internal ops dashboard: live feed, chat UI, conflict tracker, report moderation | React 19 + Vite 6 | Vercel |
| `cs_website/` | Legacy Vite public site (report form + incident map). Being consolidated into `website/` | React 19 + Vite 6 | Vercel |
| `documentation/` | This folder — context, API reference, demo script | Markdown | — |

`website/` is the canonical front door. New product surfaces (politician profiles, public search, multilingual, creator hub) get built there first, then linked from the nav.

### `website/` page plan

| Route | Purpose | Status |
|---|---|---|
| `/` | Hero, how-it-works, sources ticker, sample verdicts, team, CTA | Existing |
| `/fact-check` | Public web fact-check UI (mirrors the WhatsApp bot) | New |
| `/politicians` | Searchable index of 50+ politician profiles | Month 1 |
| `/politicians/[slug]` | Profile: bio, policies, scandals, promises, media links | Month 1 |
| `/report` | Anonymous incident report form | Exists in `cs_website/`, port here |
| `/map` | Public incident map by state/LGA, Leaflet | Exists in `cs_website/`, port here |
| `/live` | Live fact-check feed | New |
| `/about`, `/team`, `/sources`, `/privacy` | Trust + transparency | Partial |

## 4-Month Sprint Plan (Sept 30 - Dec 31, 2026)

**Month 1 (Sept 30):**
- Politician profiles database (50+ politicians) live
- WhatsApp bot can query politician profiles
- Public website search feature

**Month 2 (Oct 31):**
- Facebook bot (target: parents & millennials)
- UI/UX overhaul for accessibility
- Multilingual support (Yoruba, Igbo, Hausa)

**Month 3 (Nov 30):**
- Content creator partnerships (50+ influencers)
- AI-generated short-form videos ("Get your PVC", "Power belongs to you")
- Social media presence (TikTok, Instagram, Twitter)

**Month 4 (Dec 31):**
- Mass sensitization campaign launch
- Analytics dashboard
- Media coverage push
- Post-4-month strategy review

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React 19 + Tailwind v4
- **Database:** MongoDB Atlas
- **AI:** Gemini 1.5 Flash via OpenRouter
- **Search:** Tavily API (Nigerian news outlets)
- **WhatsApp/Facebook:** Twilio + Meta Developer
- **Deployment:** Vercel (web) + Railway (bot)
- **Code:** Private GitHub repository

## Team & Roles

- **Adriel Babalola:** Product Lead + Team Lead + Architecture
- **Ayomide Olajide:** Backend Development + Outreach
- **David Adeola:** Backend + Research + Development
- **Promise Abiodun:** QA Testing + UI/UX Design + Accessibility
- **Oreoluwa Ala:** Visionary Manager + Funding + Strategy (tiebreaker on major decisions)

## Success Metrics (4 Months)

Pick 1-2 primary:
- 1M+ users reached across platforms
- 500k+ bot queries/politician profile views
- 50+ content creator partnerships
- 10+ media features/coverage
- 5M+ cumulative impressions

## Key Files & Links

- **Live Website:** https://civic-sense-website.vercel.app/
- **GitHub Repo:** https://github.com/adriel-babalola/civic_sense
- **Demo Video:** https://youtu.be/nhasRYxrBNc
- **API Reference:** [`API.md`](./API.md)
- **Founders' Agreement:** [To be finalized by Saturday]
