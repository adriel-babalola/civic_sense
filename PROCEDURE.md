# CivicSense Bot - Deployment & Debug Procedure

> Last updated: Oct 30, 2026 — Menu 1-5 removed; bot is fully conversational (LLM intent router + static-reply templates, AI replies behind `ROUTER_STATIC_REPLIES=false`)

## Current Working State

- **Branch:** `feat/privacy-policy`
- **Latest commit:** `2bd0957` — LLM intent router added (Groq primary, OpenRouter fallback); routeMessage now async
- **Server:** Render — `https://civic-sense-8d2m.onrender.com`
- **Status:** ✅ Conversational routing live-ready — free text in, intent-routed action out; no menus, no numbered options, no conversation state

---

## Features Implemented

### 1. Conversational routing (menu 1-5 REMOVED)
- There is **no dropdown, no numbers, no yes/no loop**. `MENU`, `DROPDOWN_OPTIONS`, `MENU_REPLIES`, `PROMPT_STATES`, `normalizePhoneNumber` and first-message tracking are gone from `messageRouter.js` / `server.js`
- Every incoming message goes: webhook acks instantly → structural guards (image → fact-check, empty → clarify, pure digits/phone → clarify without any LLM call) → **LLM classifies free text** → bot acts
- A user who sends `hi` gets a conversational greeting template, not a menu. A user who sends `5` gets "Say that again for me..."
- `utils/phone.js` (`normalizePhoneNumber`) is now **unused** by the bot (kept only for the audit trail)

### 2. Nightly News Digest
- `news_update` intent (e.g. "latest news on fuel subsidy") returns `{ intent: "news" }` from `routeMessage`
- `server.js` `buildNightlyNewsDigest()`:
  - Fetches 6 newest articles via `getLatestArticles()` (MongoDB, sorted by `pubDate`)
  - If DB empty → runs `syncOnce()` (RSS fetch of 17 NG feeds) and retries
  - Formats numbered digest: title • source • date • link
  - Appends "Want any of these checked? Just send the claim."
- Handled in **all 3 webhooks**: Meta, Twilio WhatsApp, Telegram

### 3. Post-verdict closer
- After each verdict the bot sends: `"...verdict...\n\nSend me another claim anytime."`
- Nothing is remembered between messages (stateless by design) — the next message is classified fresh

### 4. LLM Intent Router
- `server/services/intentRouter.js` — classifies every free-text message BEFORE the bot picks an action
- Flow: webhook acks immediately → structural checks → **LLM classifies remaining free text** → bot dispatches
- Tags: `fact_checking` | `news_update` | `general_query` | `off_topic`
- Also extracts a **clean `search_query`** (≤12 words English) from multi-paragraph / Pidgin input — fed to Tavily + the article index by `pipeline.js`
- Providers: **Groq primary** (`ROUTER_MODEL_GROQ`, default `llama-3.1-8b-instant`, JSON mode) → **OpenRouter fallback** (`ROUTER_MODEL_OR`, default `google/gemini-2.0-flash-lite`) → JSON-repair retry → heuristic keyword fallback
- Zero reasoning: system prompt forbids prose, `temperature: 0`, `max_tokens: 150`, `response_format: json_object` on Groq, 7 few-shot examples
- Latency budget: `ROUTER_TIMEOUT_MS=1200` per call, `ROUTER_BUDGET_MS=2000` total hard cap, then heuristic (0ms)
- Low confidence (< `ROUTER_MIN_CONFIDENCE=0.55`) → ambiguous → bot asks the user to clarify instead of guessing. **Exception: `fact_checking` always executes**, even at low confidence (a weak claim is still better checked than dropped)
- Circuit breaker: 5 consecutive LLM failures → 60s of heuristic-only routing (bot never goes dark)
- Results cached in the existing LRU (`route:<normalized text>` keys); cache stores the raw LLM reply and the reply is re-composed on hit
- `routeMessage()` is **async** — all 3 webhooks `await` it (safe: each acks Meta/Twilio/Telegram first)
- Mapping: `fact_checking` → fact-check pipeline (with `searchQuery`), `news_update` → digest, `general_query` → KB answer if matched else conversational reply, `off_topic` → steering reply
- Observability: `[Router] intent=... source=groq|openrouter|cache|heuristic conf=... mode=ai|static reply="..."` log line; `intent`, `searchQuery`, `routerSource` saved on each FactCheck doc

### 5. Reply modes — static templates now, AI replies later (Option B)
- `ROUTER_STATIC_REPLIES` (Render env var, **no code deploy needed to flip**):
  - `"true"` (default / launch): user-facing replies for `general_query` / `off_topic` come from hand-written `STATIC_REPLIES` templates in `intentRouter.js` (greeting / thanks / how / offTopic / clarify). LLM output `reply` is **discarded** — only intent + search_query are used. Prompt sent to the LLM omits all reply rules (faster, cheaper)
  - `"false"`: the LLM writes the conversational replies (prompt includes reply rules + reply field in schema and few-shots). LLM reply is whitespace-collapsed and capped at 600 chars
- `fact_checking` and `news_update` replies are always deterministic (pipeline verdict / digest) in both modes
- **Flip procedure:** review `[Router]` logs + saved FactCheck docs for a few days → Render Dashboard → Environment → set `ROUTER_STATIC_REPLIES=false` → **Save** (Render restarts automatically, no deploy)

---

## Key Files

| File | Purpose |
|------|---------|
| `server/services/messageRouter.js` | Async routing: image/empty guards → classifyIntent → intent mapping. No menu, no state |
| `server/services/intentRouter.js` | **LLM intent classifier** — Groq → OpenRouter → heuristic + circuit breaker + `STATIC_REPLIES` templates + `ROUTER_STATIC_REPLIES` mode switch |
| `server/server.js` | Webhooks (Meta/Twilio/Telegram), `buildNightlyNewsDigest()`, verdict sends ("Send me another claim anytime.") |
| `server/services/pipeline.js` | Fact-check orchestrator; threads `searchQuery` into retrieval |
| `server/services/db.js` | MongoDB models; `getLatestArticles()`, `searchArticles()` |
| `server/services/scraper.js` | RSS sync of 17 NG feeds → `Article` collection |
| `server/services/metaWhatsapp.js` | Meta API send/receive, detailed error logging |
| `server/utils/phone.js` | `normalizePhoneNumber()` — **unused** since the menu removal |

---

## Bugs Fixed (Chronological)

> Bugs 1-5 are **pre-router history** — they were menu/state-machine bugs and no longer apply to the current conversational code. Kept for the audit trail.

### Bug 1: ReferenceError: state is not defined
- **Fix (`2c0b1cd`):** Define state once at top of menuReply block

### Bug 2: EMPTY reply → Meta 400 "missing body"
- **Cause:** `MENU_REPLIES[normalized]` — bracket notation on a `Map` returns `undefined`
- **Fix (`61ff72d`):** Use `menuReply` variable (fetched via `.get()`)

### Bug 3: MENU_REPLIES mapping mismatched with DROPDOWN_OPTIONS
- **Symptom:** Option 5 ("Privacy") returned "Pull latest nightly news"
- **Fix (`b86b2b4`):** Remapped MENU_REPLIES keys 1-5 to match dropdown labels

### Bug 4: Option 1 echoed label instead of pulling news
- **Cause:** No code fetched/sent actual news
- **Fix:** New `intent: "news"` + `buildNightlyNewsDigest()` + `getLatestArticles()`

### Bug 5: Yes/no flow completely dead (silent)
- **Causes (all fixed together):**
  - Two separate state Maps (`server.js` private `promptStates` vs router `PROMPT_STATES`) — server-set state invisible to router
  - Server set `awaiting_numbers` but read `awaiting_yes_no` — prompt never appeared
  - Yes/no checks were *inside* `if (menuReply)` — but "yes"/"no" aren't MENU_REPLIES keys, so branch unreachable
  - Gets used raw `userId`, sets used `normalizePhoneNumber(...)` — key mismatch
- **Fix:** Single shared `PROMPT_STATES`; yes/no handled *before* menuReply; verdict sends append prompt directly; state name unified to `awaiting_yes_no`

---

## Commit History (feat/privacy-policy branch)

```
(b0454f5) Add PROCEDURE.md
61ff72d Fix EMPTY reply: use menuReply instead of MENU_REPLIES[normalized]
d0758d5 Add detailed Meta API error logging
3f07d6b Add universal phone number normalization
2c0b1cd Fix state scoping
54d5204 Fix number handling — numbers checked first
910190c Add numbers 1-5 to dropdown with custom post-task messages
79f1d7c Add dropdown prompt: yes/no
```
*(Latest commits: MENU_REPLIES remap `b86b2b4`, news digest + state unification — check `git log`)*

---

## Deployment Process (Render)

1. Push to `feat/privacy-policy`:
   ```bash
   git add <files>
   git commit -m "description"
   git push
   ```
2. **Render Dashboard** → service → **Manual Deploy** → pull latest from `feat/privacy-policy` → **Deploy Server**
3. Wait for: `Server running on port 10000`

---

## Test Flow (post-deploy)

1. `hi` → conversational greeting template (no menu)
2. `latest news on fuel subsidy` → **📰 Nightly News Digest** with real headlines + links + "Want any of these checked? Just send the claim."
3. Send a claim (e.g. "Did the president visit Lagos yesterday?") → verdict + "Send me another claim anytime."
4. Send a multi-paragraph / Pidgin claim → server log shows
   `[Router] intent=fact_checking source=groq conf=0.9x mode=static ...ms` (target < 700ms) → verdict uses the distilled `searchQuery`
5. Send a joke / off-topic line → steering template ("I only handle Nigerian civic and political claims..."), no fact-check run
6. Send `5` or `0803 111 2233` → clarify template, **no LLM call** (digit guard, instant)
7. Send an ambiguous fragment (`what about that thing`) → clarify template ("Say that again for me...")
8. Send an image (any caption) → straight to fact-check (vision pipeline)
9. Telegram: same conversational flow
10. Temporarily unset `GROQ_API_KEY` and `OPENROUTER_API_KEY` → log shows
    `source=heuristic (no_llm_key)`, bot still routes (fails open, never errors)
11. Local unit tests: `npm run test:router` (router + message router, no live API calls)

### After a few days of logs (Option B flip)
12. Skim `[Router]` logs — confirm intents look right and replies read naturally
13. Render Dashboard → Environment → `ROUTER_STATIC_REPLIES=false` → Save (auto-restart)
14. Repeat steps 1-5 — `mode=ai` in logs, replies now written by the LLM (varied phrasing, same intent routing)

---

## Debugging Tips

### Meta API errors
```
[Meta] Sending to=... body="..."
[Meta] Send OK / FAILED status=...
[Meta] Error details: { "error": { "message": "...", "code": ... } }
```
- **400 + "missing body"** → `route.reply` undefined (check messageRouter returns)
- **400 + OAuthException** → invalid/expired `META_WHATSAPP_TOKEN`
- **429** → rate limited

### News digest empty
- Check scraper: `GET /api/health` → `articles` count, `scraper.lastSyncAt`
- Trigger manual sync: `POST /api/scrape?secret=$SCRAPE_SECRET`
- `syncOnce()` auto-runs if DB empty when a news request comes in

### MongoDB duplicate index warning
- `{"email":1}` duplicate — warning only, does NOT affect functionality

### Intent router
```
[Router] intent=fact_checking source=groq conf=0.92 ambiguous=false mode=static 310ms reply=""
[Router] intent=general_query source=groq conf=0.97 ambiguous=false mode=static 260ms reply="Hey — I'm CivicSense..."
[Router] intent=... source=heuristic conf=0.65 (llm_failed) 12ms
[Router] Circuit open for 60s — heuristic routing only
```
- `mode=static` → templates (launch default). `mode=ai` → LLM-written replies (`ROUTER_STATIC_REPLIES=false`)
- `reply=""` on general/off-topic in static mode would be a bug — templates should always fill something
- `source=heuristic (no_llm_key)` → `GROQ_API_KEY` / `OPENROUTER_API_KEY` not set (works, but dumb routing)
- `source=heuristic (llm_failed)` repeatedly → check Groq status/keys; breaker kicks in after 5 straight failures
- Replies feel slow → check the `...ms` in the log; budget is `ROUTER_BUDGET_MS` (2000ms hard cap)
- Wrong intent with high confidence → adjust the few-shot examples in `intentRouter.js` `FEWSHOT`, or raise `ROUTER_MIN_CONFIDENCE`. `fact_checking` at low confidence still runs (by design)
- Groq model deprecation errors → change `ROUTER_MODEL_GROQ` env, no code change
- AI replies feel robotic after the flip → tune the "reply rules" block in `systemPrompt()` in `intentRouter.js`

---

## Environment Variables (Render)

- `META_WHATSAPP_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`
- `MONGODB_URI` (articles + fact-checks)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `SCRAPE_SECRET` (for `/api/scrape`)
- `GROQ_API_KEY` (intent router — primary; **set this on Render**), `OPENROUTER_API_KEY` (router fallback + verdict model)
- Router tuning: `ROUTER_MODEL_GROQ`, `ROUTER_MODEL_OR`, `ROUTER_TIMEOUT_MS`, `ROUTER_BUDGET_MS`, `ROUTER_MIN_CONFIDENCE`
- `ROUTER_STATIC_REPLIES` (`"true"` = template replies [launch], `"false"` = LLM-written replies — flip via env only, no deploy)

---

## TODO / Next Steps

- [ ] Deploy latest commit on Render and run full test flow (conversational, no menu)
- [ ] Set `GROQ_API_KEY` in Render env (router runs on OpenRouter fallback + heuristic until then)
- [ ] Live latency check: `[Router]` log stays <700ms p50 / <2000ms worst case
- [ ] After a few days of logs: flip `ROUTER_STATIC_REPLIES=false` (AI replies), keep watching logs
- [ ] Create PR `feat/privacy-policy` → `main`
- [ ] Per-user rate limiting on news digest (avoid repeated syncOnce)
- [x] Unit tests for `routeMessage()` + intent router (`npm run test:router`)
- [ ] Fix MongoDB duplicate email index warning in `db.js`
- [ ] Delete stale `messageRouter.js.bak` / `messageRouter.js.new` files and now-unused `utils/phone.js`
