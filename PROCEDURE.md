# CivicSense Bot - Deployment & Debug Procedure

> Last updated: Oct 24, 2026 — Bot confirmed working with dropdown numbers + post-task messages

## Current Working State

- **Branch:** `feat/privacy-policy`
- **Latest commit:** `61ff72d` — Fix EMPTY reply
- **Server:** Render — `https://civic-sense-8d2m.onrender.com`
- **Status:** ✅ Working — dropdown shows numbers 1-5, post-task yes/no prompt works

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

### 2. Post-Task Yes/No Prompt
- After each verdict, bot sends: `"Do you want to go back to dropdown? Type yes or no"`
- User says **yes** → dropdown reappears
- User says **no** → continue with number-based flow (next input = menu choice 1-5)

### 3. Universal Phone Number Normalization
- `normalizePhoneNumber()` in `server.js` ensures consistent `promptStates` Map keys
- Works with any format: `+8801700000000`, `2347063373229`, `01700000000`
- Applied to Meta, WhatsApp, and Telegram webhooks

### 4. State Management
- `promptStates` Map tracks user states: `awaiting_numbers`, `awaiting_dropdown`
- `state` variable defined ONCE at top of `if (menuReply)` block in `messageRouter.js`

---

## Key Files

| File | Purpose |
|------|---------|
| `civic_sense/server/services/messageRouter.js` | Dropdown options, message routing, state handling |
| `civic_sense/server/server.js` | Webhook handlers (Meta/WhatsApp/Telegram), promptStates |
| `civic_sense/server/services/metaWhatsapp.js` | Meta API send/receive, error logging |
| `civic_sense/server/services/db.js` | MongoDB models, indexes |

---

## Bugs Fixed (Chronological)

### Bug 1: ReferenceError: state is not defined
- **Cause:** `state` referenced outside the scope where it was declared
- **Fix (commit `2c0b1cd`):** Define `const state = PROMPT_STATES.get(userId) || ""` once at top of `if (menuReply)` block

### Bug 2: Numbers 1-5 not returning output
- **Cause:** `MENU_REPLIES[normalized]` on a JavaScript `Map` returns `undefined` (bracket notation doesn't work on Maps)
- **Fix (commit `61ff72d`):** Use `menuReply` variable (already fetched via `.get()`) instead of `MENU_REPLIES[normalized]`
- **This was the main bug causing the 400 error from Meta** — empty body sent to API

### Bug 3: Phone number format mismatch
- **Cause:** Raw `2347063373229` vs normalized `+2347063373229` as different Map keys
- **Fix (commit `3f07d6b`):** Added `normalizePhoneNumber()` and applied to all `promptStates.set()` calls

### Bug 4: Meta API 400 — "missing body"
- **Cause:** `route.reply` was `undefined` due to Bug 2
- **Fix:** Resolved by Bug 2 fix. Added error logging (commit `d0758d5`) to diagnose.

---

## Commit History (feat/privacy-policy branch)

```
61ff72d Fix EMPTY reply: use menuReply instead of MENU_REPLIES[normalized] on Map
d0758d5 Add detailed Meta API error logging to diagnose 400 error
3f07d6b Add universal phone number normalization for promptStates
2c0b1cd Fix state scoping - define state once at top of menuReply block
54d5204 Fix number handling in dropdown - numbers 1-5 checked first
910190c Add numbers 1-5 to dropdown with custom post-task messages
79f1d7c Add dropdown prompt: 'Do you want to go back to dropdown? Type yes or no'
```

---

## Deployment Process (Render)

1. Push changes to `feat/privacy-policy` branch:
   ```bash
   git add <files>
   git commit -m "description"
   git push
   ```
2. Go to **Render Dashboard** → your service → **Settings** → **Manual Deploy**
3. Select **Pull latest commit** from `feat/privacy-policy`
4. Click **Deploy Server**
5. Wait for logs to show: `Server running on port 10000`

---

## Debugging Tips

### Check Meta API errors
Error logging is built into `metaWhatsapp.js`. Look for:
```
[Meta] Sending to=... body="..."
[Meta] Send OK to=...  OR  [Meta] Send FAILED status=... 
[Meta] Error details: { "error": { "message": "...", "code": ... } }
```

### Common Meta API errors
- **Status 400 + "missing body"** → `route.reply` is undefined (check messageRouter.js returns)
- **Status 400 + "OAuthException"** → Invalid/expired `META_WHATSAPP_TOKEN`
- **Status 429** → Rate limited, wait and retry

### Test flow
1. Send "hi" → expect dropdown with numbers 1-5
2. Send "1" → expect "Send me the political claim..."
3. Send a claim → expect verdict
4. Expect prompt: "Do you want to go back to dropdown? Type yes or no"
5. Send "yes" → dropdown reappears
6. Send "no" → continue with number selection

### MongoDB duplicate index warning
```
Warning: Duplicate schema index on {"email":1} found
```
- **Cause:** `email` field has both `index: true` in schema AND `schema.index({ email: 1 })`
- **Fix:** Remove one of them in `civic_sense/server/services/db.js`
- **Impact:** Warning only, does NOT affect functionality

---

## Environment Variables (Render)

Required on Render:
- `META_WHATSAPP_TOKEN` — Meta WhatsApp API token
- `META_WHATSAPP_PHONE_NUMBER_ID` — Meta phone number ID
- `META_APP_SECRET` — For signature verification
- `META_WEBHOOK_VERIFY_TOKEN` — For webhook verification
- `MONGODB_URI` — MongoDB connection string
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — For WhatsApp via Twilio
- `TELEGRAM_BOT_TOKEN` — For Telegram bot

---

## Next Steps / TODO

- [ ] Fix MongoDB duplicate index warning in `db.js`
- [ ] Create PR from `feat/privacy-policy` → `main`
- [ ] Consider adding message rate limiting per user
- [ ] Add unit tests for `routeMessage()` function
