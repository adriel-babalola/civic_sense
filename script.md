# CivicSense — Judge Demo Script

**Total time:** ~4 minutes  
**Narrator tone:** Confident, conversational, mission-driven

---

## Part 1 — The Public Website (1 min)

**Narrator hands judge the phone, opens cs_website on browser.**

> "This is CivicSense. One WhatsApp number. Three civic tools. No app. No sign-up."

**Scrolls through the Home page bento grid.**

> "The average Nigerian doesn't visit fact-check websites. They live on WhatsApp. So we built the product directly inside WhatsApp — then wrapped it with a public website and an admin dashboard."

**Clicks to `/report` — the anonymous report form.**

> **THE REPORT FORM**
> "Anyone can submit an anonymous incident report — violence, electoral misconduct, civil unrest. No identity collected. No sign-up. Choose type, describe what happened, pick the state and LGA. Evidence URL optional. Hit submit — it goes straight to our admin team for verification."

**Clicks to `/map` — the incident map.**

> **THE INCIDENT MAP**
> "Every approved report appears here on a live map of Nigeria — color-coded by type. Red for violence. Amber for misconduct. Orange for unrest. The feed below shows each incident with its status and location. Auto-refreshes every 30 seconds. This is real-time civic awareness for everyone."

---

## Part 2 — The WhatsApp Bot (1 min)

> "Now let's see the core engine — the WhatsApp fact-checker."

**Opens WhatsApp, shows the sandbox chat.**

> "We're using Twilio's WhatsApp Sandbox. Send 'join angle-building' to +1 415 523 8886 — that connects you to our bot."

**Types a claim into WhatsApp, e.g. "Did Tinubu remove the fuel subsidy?"**

> "Type any political claim — elections, CBN policy, security, budget figures. Hit send."

**Wait for response (~12-20 seconds). Show the verdict bubble.**

> "The bot replies with a structured verdict: VERIFIED, MISLEADING, FALSE, or UNVERIFIED. Every response includes the evidence in plain English and a source you can check."

**Show the verdict on screen.**

> "Behind the scenes: the claim hits our Express server, which fires two queries in parallel — one to Tavily for live Nigerian news, another to our curated knowledge base of 25 verified civic facts. Both results go to Gemini 2.5 Flash via OpenRouter. Temperature 0.1 — very deterministic. The verdict is formatted, sent back to WhatsApp, and logged to MongoDB for the dashboard. End to end in under 20 seconds."

---

## Part 3 — The Admin Dashboard (1.5 min)

**Open fc_dashboard on laptop/projector.**

> "This is the admin side. Everything the bot does is visible here in real time."

**Dashboard page.**

> **DASHBOARD**
> "Top row: Verdict distribution — total checks, how many were verified, misleading, false, unverified. Quick actions: run a manual fact-check, send to WhatsApp, or export everything to CSV."
>
> "Left column: live feed of every fact-check the bot has ever run, newest first. Each card shows the verdict badge, the claim, the evidence, and clickable source URLs."
>
> "Right column: system status, 7-day activity bar chart — shows the volume trend — trending claims by frequency, and top source domains by percentage. Everything auto-refreshes."

**Chat page.**

> **CHAT**
> "The interactive chat replicates the WhatsApp bot in-browser. Type any claim, get the same verdict format with colored badges, evidence section, and source pills that show the hostname. Useful for admins who want to test claims without picking up their phone."

**Reports page.**

> **REPORTS**
> "This is where the anonymous reports from the website land. Tab filters: All, Pending, Approved, Rejected — each with a count badge."
>
> "Stats bar at the top: total reports, pending review in amber, approved in green, rejected in red."
>
> "Each pending report shows: type badge, status badge, timestamp, full description, state and LGA, and an evidence link if the user submitted one. Two buttons — Approve or Reject."
>
> "Approve a report and it appears on the public incident map within seconds. Reject it and it stays hidden. One-click moderation."

**Conflict Tracker page.**

> **CONFLICT TRACKER (Beta)**
> "Bonus tool: a real-time feed of verified incidents across Nigeria. Filter by type — All, Violence, Misconduct, Unrest. Each entry shows source, date, and type badge. Remove individual items or reset the whole feed. This is our Beta — we're integrating live RSS next."

---

## Part 4 — The Closer (30 sec)

> **One platform. Three tools.**
>
> "One WhatsApp number. No app download. No sign-up. Any Nigerian can use this right now."
>
> "- Send a rumour to WhatsApp. Get the truth back in 20 seconds."
> "- See every verified incident on a live map of Nigeria."
> "- Report something anonymously. It gets reviewed and published if verified."
>
> "CivicSense meets Nigerians where they already are — WhatsApp, the most-used app in the country — and gives them the tools to fight misinformation together."

---

## Appendix — What to Tap

| Moment | Action |
|---|---|
| Open cs_website | Phone or browser ready |
| Home page scroll | Let the bento grid speak |
| Tap Report | Walk through form fields once |
| Tap Map | Point out color coding + auto-refresh |
| Open WhatsApp | Show sandbox join flow |
| Type a claim | Use "Did Tinubu remove fuel subsidy?" (guaranteed VERIFIED from KB) |
| Wait for response | ~15s — narrate the pipeline |
| Show verdict | Point out the format |
| Dashboard overview | Scroll feed, hover source pills |
| Chat tab | Type same claim, show match |
| Reports tab | Approve a pending report, show it appear on map |
| Conflict Tracker | Tap filter tabs |
| Closing line | Deliver it looking at the judges |

---

## Guaranteed KB Matches for Live Demo

These claims will always return VERIFIED from the knowledge base (no network dependency):

> "Did Tinubu remove the fuel subsidy?" → VERIFIED (entry 001)
> "Did INEC declare Tinubu winner of 2023 election?" → VERIFIED (entry 004)
> "Is minimum wage now 70k?" → VERIFIED (entry 008)
> "Did Nigeria's debt exceed 100 trillion?" → VERIFIED (entry 020)
> "Is petrol 200 naira per litre?" → FALSE (entry 012)
