# CivicSense procedure notes

> Updated after DeepSeek/OpenRouter migration and Render reconciliation.

## Current production shape
- Render API (new): `https://civic-sense-8d2m.onrender.com/`
- Primary channels: Meta WhatsApp (`/webhook/meta`) and Telegram (`/webhook/telegram`)
- Fact-check pipeline: `server/services/pipeline.js` + `server/services/gemini.js` (OpenRouter/DeepSeek)
- Conversational routing: `server/services/messageRouter.js` + `server/services/llmRouter.js` (OpenRouter/DeepSeek, reasoning off)
- Admin API/UI: JWT auth via `/api/admin/*`, admin UI served under `/_admin`

## Required env (Render / server)
- `OPENROUTER_API_KEY`
- `TAVILY_API_KEY`
- `MONGODB_URI`
- `JWT_SECRET`
- `LLM_MODEL=deepseek/deepseek-chat-v3-0324`
- `ROUTER_MODEL=deepseek/deepseek-chat-v3-0324`
- `META_WHATSAPP_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_WEBHOOK_VERIFY_TOKEN`, `META_APP_SECRET` (if Meta WhatsApp enabled)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` (if Telegram enabled)

## Behavior requirements
- CivicSense identity: Nigerian civic/political fact-checking assistant.
- Do not invent facts, dates, URLs, or sources. If evidence is insufficient, return UNVERIFIED/insufficient evidence grounded in retrieved context.
- Off-topic requests: reply in one sentence.
- If off-topic persists: ask user to use another chatbot because this is not CivicSense's primary function.

## Frontend (Vercel)
- Set `VITE_API_URL=https://civic-sense-8d2m.onrender.com`
- Set `VITE_WHATSAPP_NUMBER` as needed.
- `website/src/config/config.js` defaults to the new Render URL if `VITE_API_URL` is unset.

## Test checklist
- `POST /api/factcheck` with text claim
- `POST /api/factcheck` with image
- `POST /api/reports` anonymous report
- `POST /api/feedback` (email optional)
- Admin login, reports, claims, suggestions, feedback
- Meta/Telegram webhook verification paths and basic message flow
