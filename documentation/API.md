# CivicSense Kratos — Bot Server API

REST + webhook API for the Kratos civic fact-checking bot.
Source: `bot_server/server.js` (Express 4, ESM, Node).

- **Base URL (local):** `http://localhost:3000`
- **Content type:** all endpoints accept `application/json` and `application/x-www-form-urlencoded` (`express.json` limit `10mb`, `express.urlencoded` extended).
- **CORS:** wide open (`app.use(cors())`).
- **Compression:** enabled on all responses.
- **No global auth.** Only `/api/scrape` (shared secret) and `/webhook/telegram` (secret header) are protected. `/webhook` is unauthenticated.

## Endpoint index

| # | Method | Path | Auth | Rate limited |
|---|--------|------|------|--------------|
| 1 | GET | `/` | none | no |
| 2 | GET | `/api/health` | none | no |
| 3 | POST | `/api/scrape` | `?secret=` | no |
| 4 | GET | `/api/factchecks` | none | no |
| 5 | POST | `/api/factcheck` | none | **yes** |
| 6 | POST | `/api/chat` | none | **yes** |
| 7 | POST | `/webhook` | none (Twilio) | no |
| 8 | POST | `/webhook/telegram` | `X-Telegram-Bot-Api-Secret-Token` | no |
| 9 | POST | `/api/reports` | none | no |
| 10 | GET | `/api/reports` | none | no |
| 11 | PATCH | `/api/reports/:id/approve` | none | no |
| 12 | PATCH | `/api/reports/:id/reject` | none | no |
| 13 | GET | `/api/incidents` | none | no |
| 14 | GET | `/api/sources` | none | no |

### Standard JSON envelope

Success:

```json
{ "success": true, "data": { } }
```

Error:

```json
{ "success": false, "error": "message" }
```

Rate limited (HTTP 429):

```json
{ "success": false, "error": "Too many requests. Please try again later." }
```

---

## 1. `GET /`

Liveness banner. Served as `text/html`.

**Response 200**

```
Kratos — CivicSense fact-checking bot is running.
```

---

## 2. `GET /api/health`

Runs `connectDB()` first, then reports runtime, DB and scraper state.

**Response 200**

```json
{
  "success": true,
  "uptime": 12345.67,
  "db": true,
  "articles": 4820,
  "scraper": {
    "sources": 24,
    "healthy": 22,
    "degraded": 2,
    "lastSyncAt": "2026-09-26T14:00:00.000Z",
    "lastSyncError": null,
    "memoryArticles": 912,
    "sourceHealth": [
      { "name": "Premium Times", "lastStatus": "ok", "lastFetchAt": "2026-09-26T14:00:00.000Z", "lastError": null, "consecutiveFailures": 0 }
    ],
    "dbConnected": true
  }
}
```

- `db` — `mongoose.connection.readyState === 1`.
- `articles` — `Article.estimatedDocumentCount()`; `0` if DB is not connected.
- `lastSyncAt` / `lastSyncError` are `null` before the first successful sync.

---

## 3. `POST /api/scrape`

Triggers one RSS→MongoDB sync pass across all sources.

**Query params**

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `secret` | string | **yes** | Must equal `SCRAPE_SECRET` env var |

**Responses**

- `401` — `{ "success": false, "error": "Unauthorized" }`
- `200` — `{ "success": true, "data": <sync result> }`
- `500` — `{ "success": false, "error": "<message>" }`

Sync result shape:

```json
{ "sources": 24, "collected": 310, "stored": 305, "elapsedMs": 4120 }
```

Re-entrancy: if a sync is already running, returns `{ "success": true, "data": { "skipped": true } }`.

```bash
curl -X POST "http://localhost:3000/api/scrape?secret=$SCRAPE_SECRET"
```

---

## 4. `GET /api/factchecks`

Most recent 50 fact-check records, newest first.

**Response 200** — `data` is an array (empty array when DB is unavailable; DB errors are swallowed, never 500):

```json
{
  "success": true,
  "data": [
    {
      "_id": "66f0c1a2b3c4d5e6f7a8b9c0",
      "claim": "The Federal Government has banned currency notes below ₦200",
      "verdict": "FALSE — ...",
      "channel": "whatsapp",
      "hashedFrom": "+2348012345678",
      "timestamp": "2026-09-26T12:00:00.000Z"
    }
  ]
}
```

`channel` values in use: `api`, `dashboard`, `whatsapp`, `telegram`, `test`.

---

## 5. `POST /api/factcheck`

Full fact-check pipeline. Accepts text, an uploaded image, base64, or a remote image URL. **Rate limited.**

### Input modes (mutually exclusive image sources; text is optional if an image is present)

| Mode | Fields |
|------|--------|
| Text only | `claim` |
| Multipart upload | `image` (file) + optional `claim`, `caption` |
| JSON base64 | `imageBase64` + optional `claim`, `caption` |
| JSON remote | `imageUrl` + optional `claim`, `caption` |

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `claim` | string | conditional | Also readable from `?claim=` query. Trimmed. |
| `caption` | string | no | Text hint used when extracting the claim from an image. Not read from query. |
| `image` | file | conditional | Field name must be `image`. `multipart/form-data` only. |
| `imageBase64` | string | conditional | Raw base64 or a full `data:image/...;base64,` URL. |
| `imageUrl` | string | conditional | Server fetches it (10s timeout, browser UA). |

At least one of `claim` / `image` (or `imageBase64` / `imageUrl`) must resolve to content, otherwise `400`.

### Image limits

- Max size `MEDIA_MAX_MB` (default **5 MB**) — enforced by multer on upload, by `validateImageBuffer` on base64, and by axios `maxContentLength` on remote fetch.
- Allowed formats by magic bytes: **JPEG, PNG, WebP, GIF**. Declared MIME on upload is also checked against the same list.
- Images are analysed only — never persisted, never served.
- JSON body limit is `10mb`, so a 5 MB image fits as base64 (~6.7 MB encoded).

### Response 200

```json
{
  "success": true,
  "data": {
    "claim": "original claim text",
    "extractedClaim": "claim text read out of the image, or null",
    "verdict": "FALSE — 2-3 plain sentences for WhatsApp ...",
    "structured": {
      "verdict": "FALSE",
      "confidence": 92,
      "whatWeFound": "2-3 plain sentences",
      "source": "Premium Times, The Punch",
      "sources": [
        { "title": "...", "url": "https://...", "site": "premiumtimesng.com" }
      ]
    },
    "latencyMs": 6120
  }
}
```

- `structured.verdict` ∈ `VERIFIED` | `MISLEADING` | `FALSE` | `UNVERIFIED`.
- `structured.confidence` — 0-100. The prompt requires 3+ independent sources for 90%+, 2+ for 70-89%.
- `verdict` is the pre-formatted human-readable message; this is what WhatsApp/Telegram send verbatim.
- `claim` echoes your input; when the input was an image, `claim` is the extracted claim.

Each success is saved to MongoDB as `{ claim, verdict, channel: "api", timestamp }`. A DB write failure is logged and does **not** fail the request.

### Errors

| Status | When |
|--------|------|
| `400` | Missing claim and image; invalid image (`"Unsupported image format. Send JPEG, PNG, WebP or GIF."`, `"Image too large. Max 5MB."`, `"No image data provided"`, `"Only JPEG, PNG, WebP and GIF images are supported"`) |
| `429` | Rate limit exceeded |
| `500` | Pipeline/LLM failure — `error` is the raw exception message |

### Examples

```bash
# text
curl -X POST http://localhost:3000/api/factcheck \
  -H 'Content-Type: application/json' \
  -d '{"claim":"INEC has cancelled the 2027 elections"}'

# image upload
curl -X POST http://localhost:3000/api/factcheck \
  -F 'image=@poster.png' -F 'caption="forwarded whatsapp image"'

# base64
curl -X POST http://localhost:3000/api/factcheck \
  -H 'Content-Type: application/json' \
  -d '{"imageBase64":"iVBORw0KGgo...","caption":"campaign poster"}'

# remote url
curl -X POST http://localhost:3000/api/factcheck \
  -H 'Content-Type: application/json' \
  -d '{"imageUrl":"https://example.com/poster.jpg"}'
```

---

## 6. `POST /api/chat`

Minimal text-only endpoint for the dashboard. **Rate limited.** Returns only the verdict string, not the structured payload.

**Body**

| Field | Type | Required |
|-------|------|----------|
| `claim` | string | **yes** (must be non-empty after trim) |

**Response 200**

```json
{ "success": true, "data": { "claim": "the claim", "verdict": "FALSE — ..." } }
```

**Errors:** `400` `"No claim provided"`, `429`, `500`.

Saved with `channel: "dashboard"`.

---

## 7. `POST /webhook` (Twilio WhatsApp)

Inbound WhatsApp messages.

### Request body (Twilio form-encoded)

| Field | Notes |
|-------|-------|
| `Body` | Message text, trimmed |
| `From` | Sender E.164, e.g. `whatsapp:+2348012345678` — used as reply destination and stored in `hashedFrom` |
| `To` | Your Twilio number — used as reply origin |
| `NumMedia` | Media count; `parseInt`'d, defaults to 0 |
| `MediaUrl0` | First media URL (fetched when `NumMedia > 0`) |

### Behaviour — async reply pattern

1. Validates that `Body` or `MediaUrl0` exists; otherwise `400` with plain text `No message`.
2. **Immediately** returns `200` with `Content-Type: text/xml` and an **empty** `MessagingResponse` — this is deliberate, to avoid Twilio error 11200 (15s webhook timeout).
3. Work continues in `setImmediate`: download media → `runFactCheck` → save to MongoDB (`channel: "whatsapp"`) → reply via `twilio.messages.create({ from: To, to: From, body: result.verdict })`.

```xml
<?xml version="1.0" encoding="UTF-8"?><Response></Response>
```

**Error reply:** if anything throws, the user receives
`"Sorry, I couldn't process that. Please try again with a text claim."`

> No Twilio `X-Twilio-Signature` validation is implemented on this route.

**Telegram/WhatsApp setup:** `npm run setup:telegram` (Telegram webhook), and point the Twilio WhatsApp sandbox sender at `https://<host>/webhook` for `POST`.

---

## 8. `POST /webhook/telegram`

Telegram Bot API webhook. Always responds fast so Telegram doesn't retry.

**Auth:** header `X-Telegram-Bot-Api-Secret-Token` must equal `TELEGRAM_WEBHOOK_SECRET` (falls back to `TELEGRAM_BOT_TOKEN`). Mismatch or missing → `401 Unauthorized` (plain text).

**Body:** raw Telegram Update object. Only `message` and `edited_message` are read.

**Behaviour**

1. Extracts `chat.id`, `text` or `caption`, and the largest `photo` `file_id`.
2. Responds `200 ok` (plain text) immediately. Non-message updates get `ok` with no further work.
3. Sends `sendChatAction(chatId, "typing")`, resolves the photo via `getFile` → fetches the image → `runFactCheck` → saves with `channel: "telegram"`, `hashedFrom = String(chatId)` → `sendMessage(chatId, result.verdict)`.
4. On failure the chat receives `"Sorry, I couldn't process that. Please try again with a text claim."`

```bash
curl -X POST https://<host>/webhook/telegram \
  -H "X-Telegram-Bot-Api-Secret-Token: $TELEGRAM_WEBHOOK_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"update_id":1,"message":{"chat":{"id":123},"text":"EFCC arrested the CBN governor"}}'
```

---

## 9. `POST /api/reports`

Submit a civic-incident report. New reports start as `pending`.

**Body (all required unless noted)**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `type` | string | **yes** | enum: `violence`, `misconduct`, `unrest` |
| `description` | string | **yes** | free text |
| `state` | string | **yes** | Nigerian state |
| `lga` | string | **yes** | Local government area |
| `evidence` | string | no | URL or text |

**Response 200**

```json
{
  "success": true,
  "data": {
    "_id": "66f0c1a2b3c4d5e6f7a8b9c0",
    "type": "violence",
    "description": "Party supporters clashed at the venue...",
    "state": "Kaduna",
    "lga": "Igabi",
    "evidence": "https://...",
    "status": "pending",
    "timestamp": "2026-09-26T12:00:00.000Z",
    "__v": 0
  }
}
```

**Errors:** `400` `"Missing required fields: type, description, state, lga"`, `400` for a Mongoose enum violation (validation message), `500` if the document cannot be created (e.g. DB down → `error: "Failed to save report"`).

---

## 10. `GET /api/reports`

**Query params**

| Name | Type | Notes |
|------|------|-------|
| `status` | string | Optional filter: `pending` \| `approved` \| `rejected`. Omit for all. |

**Response 200** — `data` is an array of report documents, newest first (empty array if DB is down).

```json
{ "success": true, "data": [ { "_id": "...", "type": "unrest", "status": "approved" } ] }
```

---

## 11. `PATCH /api/reports/:id/approve`

Sets `status: "approved"`. No request body.

**Response 200** — the updated report.
**Response 404** — `{ "success": false, "error": "Report not found" }` (also returned for a malformed ObjectId, since Mongoose throws and the handler maps a null result to 404).

```bash
curl -X PATCH http://localhost:3000/api/reports/66f0c1a2b3c4d5e6f7a8b9c0/approve
```

---

## 12. `PATCH /api/reports/:id/reject`

Identical to approve but sets `status: "rejected"`.

---

## 13. `GET /api/incidents`

Public incident feed = 10 hard-coded seed incidents (server.js:280-291) merged with every **approved** report, sorted by `timestamp` descending.

Seed entries are dated 2026-01-15 → 2026-06-25 and cover Kaduna, Ekiti, Kano, Borno, Osun, Enugu, Kebbi, Nasarawa, Kwara. They are not in the database and are always returned even if MongoDB is unavailable (the approved list degrades to `[]`).

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "type": "violence",
      "description": "APC primary election clash in Igabi LGA, Kaduna State...",
      "state": "Kaduna",
      "lga": "Igabi",
      "timestamp": "2026-05-16T00:00:00.000Z"
    }
  ]
}
```

`evidence` is present only for database-backed incidents (`null` otherwise). No pagination, no filters.

---

## 14. `GET /api/sources`

Static list of the RSS feeds the scraper ingests. No params, no DB access.

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "name": "Premium Times",
      "baseUrl": "https://www.premiumtimesng.com",
      "feed": "https://www.premiumtimesng.com/feed",
      "category": "news",
      "region": "National"
    }
  ]
}
```

---

## Rate limiting

`express-rate-limit` v8, applied only to `/api/factcheck` and `/api/chat`.

| Setting | Value |
|---------|-------|
| Window | 15 minutes |
| Max requests | `RATE_LIMIT_MAX`, default **60** |
| Key | client IP (`req.ip`) |
| Headers | `standardHeaders: true`, `legacyHeaders: false` (`RateLimit` / `RateLimit-Policy`) |
| Exceeded | HTTP **429**, `{ "success": false, "error": "Too many requests. Please try again later." }` |

**Caveat:** the default in-memory store is per-process — limits reset on restart and are not shared across instances. Whitelist `/webhook` (Twilio) and `/webhook/telegram` if you need headroom, or raise `RATE_LIMIT_MAX`.

## Error handling

A single terminal error middleware (server.js:358-364):

- `multer.MulterError` **or** any error whose message contains the substring `image` → `400` with that message.
- Anything else → logged as `Unhandled error: ...` and `500` `{ "success": false, "error": err.message || "Internal server error" }`.
- No 404 handler: unknown paths fall through to Express's default HTML `Cannot GET /...`.

## Startup, pipeline internals, environment

**Boot** (`server.js:366-370`): `app.listen(PORT || 3000)` then `startScraper()` — an interval loop every `SCRAPE_INTERVAL_MIN` (default 30) minutes. Graceful shutdown on `SIGINT`/`SIGTERM`: close server → `mongoose.disconnect()` → exit, with a 10s forced-exit timer.

**Fact-check pipeline** (`services/pipeline.js`):
1. If an image is present, `extractClaimFromImage(imageDataUrl, caption)` runs first; it wins over the typed claim.
2. Three retrievals run concurrently under `Promise.allSettled` — a static knowledge base, the local article index (top 6, MongoDB `$text` search), and Tavily live search. **Failures are tolerated**; each falls back to `[]` / `""`.
3. `buildVerdict` calls the LLM (`LLM_MODEL`, default `google/gemini-2.5-flash`) with a multi-source prompt, and returns the verdict plus a formatted WhatsApp-ready string. Results are cached by claim for `CACHE_TTL_SEC`.
4. If the model returns unusable JSON, a deterministic `fallbackVerdict` is returned instead of an error.
5. If no active claim survives, the pipeline throws `"No claim provided — send a text claim or an image."` → `500`.
6. `PIPELINE_DEADLINE_MS` (default 25000) is the intended ceiling; the LLM call itself uses a 600s timeout, so a hung upstream can exceed the nominal deadline.

**Environment variables**

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | Listen port |
| `MONGODB_URI` | — | Mongo connection string. **Unset = persistence silently disabled**, all list endpoints return `[]` and writes become no-ops. |
| `SCRAPE_SECRET` | — | Shared secret for `POST /api/scrape` |
| `SCRAPE_INTERVAL_MIN` | `30` | Scraper interval (minutes) |
| `SCRAPE_MEMORY_MAX` | `3000` | In-memory article cap |
| `ARTICLE_TTL_DAYS` | `14` | MongoDB TTL on the article collection |
| `MEDIA_MAX_MB` | `5` | Image size cap (multer + validator) |
| `RATE_LIMIT_MAX` | `60` | Requests per 15 min on the two rate-limited routes |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | — | Used to build the async WhatsApp reply client |
| `TWILIO_WHATSAPP_NUMBER` | — | Configured number (not read by `server.js`) |
| `TELEGRAM_BOT_TOKEN` | — | Bot API token; also the fallback webhook secret |
| `TELEGRAM_WEBHOOK_SECRET` | — | `X-Telegram-Bot-Api-Secret-Token` value |
| `TELEGRAM_TIMEOUT_MS` | `10000` | Telegram API timeout |
| `OPENROUTER_API_KEY` | — | LLM + embedding access |
| `LLM_MODEL` | `google/gemini-2.5-flash` | Verdict model |
| `LLM_TIMEOUT_MS` | `25000` | Model call timeout |
| `PIPELINE_DEADLINE_MS` | `25000` | Nominal end-to-end budget |
| `TAVILY_API_KEY` | — | Live web search |
| `CACHE_TTL_SEC` | `3600` | Verdict cache TTL |
| `CACHE_MAX_ENTRIES` | `300` | Verdict cache size |

**Dependencies** (`bot_server/package.json`, v1.0.0, `"type": "module"`): `express ^4.21.0`, `mongoose ^8.0.0`, `twilio ^5.4.0`, `multer ^2.2.0`, `express-rate-limit ^8.6.2`, `cors ^2.8.5`, `compression ^1.8.1`, `dotenv ^16.0.0`, `axios ^1.6.0`, `rss-parser ^3.13.0`. No `engines` field declared.

**Scripts:** `npm start` (`node server.js`), `npm test`, `npm run test:pipeline`, `npm run verify:feeds`, `npm run setup:telegram`.

## Data models

- **FactCheck** — `claim`, `verdict`, `channel` (default `test`), `timestamp` (default now), `hashedFrom`. Indexes: `timestamp` desc, `claim` text.
- **Article** — `title` (required), `link` (unique), `snippet`, `content`, `imageUrl`, `source`, `sourceBase`, `category` (default `news`), `region`, `pubDate`, `createdAt` (TTL: `ARTICLE_TTL_DAYS`). Text index on `title`/`snippet`/`content`/`source`, `pubDate` desc.
- **Report** — `type` (enum, required), `description` (required), `state` (required), `lga` (required), `evidence`, `status` (enum `pending`/`approved`/`rejected`, default `pending`), `timestamp`.

## Known gaps

1. `/webhook` has no Twilio signature validation — anyone who learns the URL can send messages as a user and consume LLM quota.
2. `/api/reports*` (create/approve/reject) has no auth, so anyone can approve their own report into the public incident feed.
3. `/api/factchecks` and `/api/incidents` are unauthenticated and unbounded-URL; only the fact-check feed has a hard `limit(50)`.
4. `express.json({ limit: "10mb" })` accepts oversized bodies before image validation runs; base64 uploads can reach ~2x their intended cap in transit.
5. `getRecentFactChecks` / `getReports` / `saveReport` swallow DB errors, so "empty list" and "database is down" are indistinguishable to clients.
6. The in-memory rate limiter doesn't hold across restarts or multiple instances.
7. `/api/incidents` always prepends 10 seed records dated 2026, which will drift out of date.
