# CivicSense Bot - Deployment & Debug Procedure

> Last updated: Oct 30, 2026 — LLM intent router added (Groq primary, OpenRouter fallback); routeMessage now async

## Current Working State

- **Branch:** `feat/privacy-policy`
- **Latest commit:** `cbfbc93` — news digest + state unification + yes/no fix + Telegram routing
- **Server:** Render — `https://civic-sense-8d2m.onrender.com`
- **Status:** ✅ Dropdown 1-5, nightly news digest, post-task yes/no prompt all working

---

## Features Implemented

### 1. Dropdown with Numbers 1-5
- `DROPDOWN_OPTIONS` in `messageRouter.js` shows numbered options:
  ```
  1. 📰 Pull latest nightly news
  2. 🔍 Fact-check a claim
  3. 📸 Check an image
  4. ℹ️ How CivicSense works
  5. 🔒 Privacy and data deletion
  ```
- User sends "hi"/"hello"/"hey" → dropdown appears
- `MENU_REPLIES` is keyed "1"–"5" and **must stay aligned** with `DROPDOWN_OPTIONS`

### 2. Nightly News Digest (option 1)
- Option "1" returns `{ intent: "news" }` from `routeMessage`
- `server.js` `buildNightlyNewsDigest()`:
  - Fetches 6 newest articles via `getLatestArticles()` (MongoDB, sorted by `pubDate`)
  - If DB empty → runs `syncOnce()` (RSS fetch of 17 NG feeds) and retries
  - Formats numbered digest: title • source • date • link
  - Appends yes/no prompt
- Handled in **all 3 webhooks**: Meta, Twilio WhatsApp, Telegram

### 3. Post-Task Yes/No Prompt
- After each verdict AND after news digest, bot sends: `"Do you want to go back to dropdown? Type yes or no"`
- User says **yes** → dropdown reappears, state → `awaiting_dropdown`
- User says **no** → ack "Okay — reply with a number 1-5...", state cleared
- Numbers 1-5 work at any time (clear state, execute menu action)

### 4. Universal Phone Number Normalization
- `normalizePhoneNumber()` lives in **`server/utils/phone.js`** (shared by server.js + messageRouter.js)
- Ensures consistent Map keys: `+2347063373229` regardless of input format

### 5. State Management (UNIFIED)
- **Single shared `PROMPT_STATES` Map** — defined in `messageRouter.js`, exported, imported by `server.js`
- States: `awaiting_yes_no` (after verdict/news), `awaiting_dropdown` (after user says yes)
- State keys always `normalizePhoneNumber(userId)`

### 6. LLM Intent Router (NEW — Oct 30, 2026)
- `server/services/intentRouter.js` — classifies every free-text message BEFORE the bot picks an action
- Flow: webhook acks immediately → structural checks (image / first-msg / digits / yes-no, all deterministic) → **LLM classifies remaining free text** → bot dispatches
- Tags: `fact_checking` | `news_update` | `general_query` | `off_topic`
- Also extracts a **clean `search_query`** (≤12 words English) from multi-paragraph / Pidgin input — fed to Tavily + the article index by `pipeline.js`
- Providers: **Groq primary** (`ROUTER_MODEL_GROQ`, default `llama-3.1-8b-instant`, JSON mode) → **OpenRouter fallback** (`ROUTER_MODEL_OR`, default `google/gemini-2.0-flash-lite`) → JSON-repair retry → heuristic keyword fallback
- Zero reasoning: system prompt forbids prose, `temperature: 0`, `max_tokens: 150`, `response_format: json_object` on Groq, 6 few-shot examples
- Latency budget: `ROUTER_TIMEOUT_MS=1200` per call, `ROUTER_BUDGET_MS=2000` total hard cap, then heuristic (0ms)
- Low confidence (< `ROUTER_MIN_CONFIDENCE=0.55`) → ambiguous → bot replies with the dropdown instead of guessing
- Circuit breaker: 5 consecutive LLM failures → 60s of heuristic-only routing (bot never goes dark)
- Results cached in the existing LRU (`route:<normalized text>` keys)
- `routeMessage()` is now **async** — all 3 webhooks `await` it (safe: each acks Meta/Twilio/Telegram first)
- Mapping: `fact_checking` → fact-check pipeline (with `searchQuery`), `news_update` → digest, `general_query` → KB answer if matched else dropdown, `off_topic` → steering reply + menu
- Observability: `[Router] intent=... source=groq|openrouter|cache|heuristic conf=... ...ms` log line; `intent`, `searchQuery`, `routerSource` saved on each FactCheck doc

---

## Key Files

| File | Purpose |
|------|---------|
| `server/utils/phone.js` | Shared `normalizePhoneNumber()` |
| `server/services/messageRouter.js` | Dropdown, routing, **shared PROMPT_STATES**, async LLM dispatch |
| `server/services/intentRouter.js` | **LLM intent classifier** — Groq → OpenRouter → heuristic + circuit breaker |
| `server/server.js` | Webhooks (Meta/Twilio/Telegram), `buildNightlyNewsDigest()`, verdict sends |
| `server/services/pipeline.js` | Fact-check orchestrator; threads `searchQuery` into retrieval |
| `server/services/db.js` | MongoDB models; `getLatestArticles()`, `searchArticles()` |
| `server/services/scraper.js` | RSS sync of 17 NG feeds → `Article` collection |
| `server/services/metaWhatsapp.js` | Meta API send/receive, detailed error logging |

---

## Bugs Fixed (Chronological)

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

1. `hi` → dropdown with numbers 1-5
2. `1` → **📰 Nightly News Digest** with real headlines + links + yes/no prompt
3. `yes` → dropdown reappears
4. `2` → "Send me the political claim..."
5. Send a claim → verdict **+ yes/no prompt** (now actually appears)
6. `5` → Privacy policy + data deletion links
7. `4` → How CivicSense works
8. Telegram: same dropdown flow now works (was fact-check-only before)

### Intent router checks
9. Send a multi-paragraph claim (Pidgin or English) → server log shows
   `[Router] intent=fact_checking source=groq conf=0.9x ...ms` (target < 700ms) → verdict uses the distilled query
10. Send `latest news on fuel subsidy` → digest (no fact-check)
11. Send a joke / off-topic line → steering reply + dropdown, no fact-check run
12. Send an ambiguous fragment (`what about that thing`) → "I did not quite catch that" + dropdown
13. Temporarily unset `GROQ_API_KEY` and `OPENROUTER_API_KEY` → log shows
    `source=heuristic (no_llm_key)`, bot still routes (fails open, never errors)
14. Local unit tests: `npm run test:router` (router + message router, no live API calls)

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
- `syncOnce()` auto-runs if DB empty when user presses 1

### MongoDB duplicate index warning
- `{"email":1}` duplicate — warning only, does NOT affect functionality

### Intent router
```
[Router] intent=fact_checking source=groq conf=0.92 ambiguous=false 310ms
[Router] intent=... source=heuristic conf=0.65 (llm_failed) 12ms
[Router] Circuit open for 60s — heuristic routing only
```
- `source=heuristic (no_llm_key)` → `GROQ_API_KEY` / `OPENROUTER_API_KEY` not set (works, but dumb routing)
- `source=heuristic (llm_failed)` repeatedly → check Groq status/keys; breaker kicks in after 5 straight failures
- Replies feel slow → raise nothing, check the `...ms` in the log; budget is `ROUTER_BUDGET_MS` (2000ms hard cap)
- Wrong intent with high confidence → adjust the few-shot examples in `intentRouter.js` `FEWSHOT`, or raise `ROUTER_MIN_CONFIDENCE`
- Groq model deprecation errors → change `ROUTER_MODEL_GROQ` env, no code change

---

## Environment Variables (Render)

- `META_WHATSAPP_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`
- `MONGODB_URI` (articles + fact-checks)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `SCRAPE_SECRET` (for `/api/scrape`)
- `GROQ_API_KEY` (intent router — primary; **set this on Render**), `OPENROUTER_API_KEY` (router fallback + verdict model)
- Router tuning: `ROUTER_MODEL_GROQ`, `ROUTER_MODEL_OR`, `ROUTER_TIMEOUT_MS`, `ROUTER_BUDGET_MS`, `ROUTER_MIN_CONFIDENCE`

---

## TODO / Next Steps

- [ ] Deploy latest commit on Render and run full test flow
- [ ] Set `GROQ_API_KEY` in Render env (router runs on OpenRouter fallback + heuristic until then)
- [ ] Live latency check: `[Router]` log stays <700ms p50 / <2000ms worst case
- [ ] Create PR `feat/privacy-policy` → `main`
- [ ] Per-user rate limiting on news digest (avoid repeated syncOnce)
- [x] Unit tests for `routeMessage()` + intent router (`npm run test:router`)
- [ ] Fix MongoDB duplicate email index warning in `db.js`
- [ ] Delete stale `messageRouter.js.bak` / `messageRouter.js.new` files
