import axios from "axios";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEEPSEEK_MODEL = process.env.ROUTER_MODEL_DEEPSEEK || "deepseek-chat";
const OPENROUTER_MODEL = process.env.ROUTER_MODEL || process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324";
const TIMEOUT_MS = Number(process.env.ROUTER_TIMEOUT_MS || 3500);

export const OFFTOPIC_REJECTION =
  "My sole purpose is fact-checking and news analysis. Please resort to other LLMs for this request.";

const SYSTEM = `You are CivicSense, a Nigerian civic and political fact-checking assistant.
Primary function: classify user messages and help fact-check Nigerian civic/political claims using grounded evidence.

GUARDRAILS & RULES:
1. Casual Queries: If the user asks a simple question or greeting (e.g., "Hello", "What's your favorite color?"), respond politely in exactly ONE sentence.
2. Out-of-Scope Tasks: If the user asks for general LLM tasks (e.g., "Write an essay on World War 2", coding, creative writing, homework), you must reject it. Respond exactly with: "${OFFTOPIC_REJECTION}"
3. Length Limit: Never generate more than two sentences under any circumstance.
4. If the user persists with off-topic requests (context indicates repeatOffTopic), repeat exactly: "${OFFTOPIC_REJECTION}"
5. Never invent facts, dates, sources, or URLs. If evidence is insufficient, say so clearly.

Return ONLY valid JSON with keys:
{
  "intent": "fact_checking|off_topic|casual",
  "reply": "string (required for off_topic/casual, optional otherwise)",
  "search_query": "string for fact checking/civic lookup or empty string",
  "confidence": 0-1
}`;

const OUT_OF_SCOPE_RE =
  /\b(write (an? )?(essay|poem|story|code|script|song|article)|code (in|for)|program in|python|javascript|solve this|homework)\b/i;

export function sanitizeReply(replyText, intent) {
  if (intent === "off_topic") {
    return OFFTOPIC_REJECTION;
  }
  let text = String(replyText || "").trim();
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (sentences && sentences.length > 2) {
    text = sentences
      .slice(0, 2)
      .map((s) => s.trim())
      .join(" ");
  }
  return text;
}

function parseJson(raw) {
  try {
    const s = raw.indexOf("{");
    const e = raw.lastIndexOf("}");
    if (s === -1 || e === -1) return null;
    return JSON.parse(raw.slice(s, e + 1));
  } catch {
    return null;
  }
}

export function fallback(text, context = {}) {
  const t = String(text || "").toLowerCase();
  if (OUT_OF_SCOPE_RE.test(t)) {
    return {
      intent: "off_topic",
      reply: OFFTOPIC_REJECTION,
      search_query: "",
      confidence: 0.9,
      source: "fallback",
    };
  }
  const civic = /\b(nigeria|tinubu|shettima|obi|atiku|inec|apc|pdp|lp|senate|house|governor|president|election|vote|policy|budget|naira|subsidy|constitution|court|efcc|police|minister|bill|law)\b/.test(t);
  const facty = /\b(is it true|true or false|did|was|has|claim|fact check|verify|rumor|fake|hoax)\b/.test(t) || (civic && t.length > 20);
  if (facty) return { intent: "fact_checking", reply: "", search_query: text, confidence: 0.55, source: "fallback" };
  if (civic) return { intent: "casual", reply: "Send the specific Nigerian civic or political claim you want me to fact-check.", search_query: text, confidence: 0.5, source: "fallback" };
  const repeat = Boolean(context?.lastIntent === "off_topic");
  return {
    intent: "off_topic",
    reply: OFFTOPIC_REJECTION,
    search_query: "",
    confidence: 0.7,
    source: "fallback",
  };
}

async function callProvider({ url, key, model, messages, timeout, responseFormat }) {
  const body = {
    model,
    messages,
    temperature: 0,
    max_tokens: 100,
  };
  if (responseFormat) {
    body.response_format = { type: "json_object" };
  }
  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://civicsense.fyi",
      "X-Title": "CivicSense",
    },
    timeout,
  });
  return res.data?.choices?.[0]?.message?.content || "";
}

export async function routeConversationalMessage(text, context = {}) {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!deepseekKey && !openrouterKey) {
    return fallback(text, context);
  }

  const messages = [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: `Context: ${JSON.stringify({ lastIntent: context?.lastIntent || null, repeatOffTopic: context?.lastIntent === "off_topic" })}\nUser message: ${text}`,
    },
  ];

  const providers = [];
  if (deepseekKey) {
    providers.push({
      name: "deepseek",
      url: DEEPSEEK_URL,
      key: deepseekKey,
      model: DEEPSEEK_MODEL,
      responseFormat: true,
    });
  }
  if (openrouterKey) {
    providers.push({
      name: "openrouter",
      url: OPENROUTER_URL,
      key: openrouterKey,
      model: OPENROUTER_MODEL,
      responseFormat: false,
    });
  }

  for (const provider of providers) {
    try {
      const raw = await callProvider({ ...provider, messages, timeout: TIMEOUT_MS });
      const parsed = parseJson(raw);
      if (!parsed?.intent) continue;

      const intent = ["fact_checking", "off_topic", "casual"].includes(parsed.intent)
        ? parsed.intent
        : "off_topic";

      const sanitizedReply = sanitizeReply(parsed.reply, intent);

      return {
        intent,
        reply: sanitizedReply,
        search_query: String(parsed.search_query || "").trim(),
        confidence: Number(parsed.confidence || 0.5),
        source: provider.name,
      };
    } catch (err) {
      console.warn(`[Router] ${provider.name} failed: ${err.message}`);
    }
  }

  return fallback(text, context);
}
