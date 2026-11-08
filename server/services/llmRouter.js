import axios from "axios";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEEPSEEK_MODEL = (process.env.ROUTER_MODEL_DEEPSEEK || "deepseek-chat").trim();
const OPENROUTER_MODEL = (process.env.ROUTER_MODEL || process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324").trim();
const TIMEOUT_MS = Number(process.env.ROUTER_TIMEOUT_MS || 6000);

export const OFFTOPIC_REJECTION =
  "My sole purpose is fact-checking and news analysis. Please resort to other LLMs for this request.";

const SYSTEM = `You are CivicSense, an intelligent Nigerian civic and political fact-checking assistant.
Primary function: Understand user messages (including Nigerian Pidgin, colloquialisms, and slang), classify user intent, and help fact-check Nigerian civic/political claims using grounded evidence.

INTENT DEFINITIONS:
1. "casual": Greetings, small talk, identity questions, polite queries, or simple personal questions (e.g., "Hello", "Hi", "How are you?", "What's your favorite color?", "Who are you?", "What can you do?", "How far na?").
   - Reply politely, naturally, and intelligently in exactly ONE sentence.
   - For greetings: "Hello! I'm CivicSense, send me any Nigerian political or civic claim and I'll verify it."
   - For "How are you": "I'm doing great, thank you! Ready to help you fact-check any Nigerian news or political claims."
   - For "What's your favorite color?": "I don't have personal favorites, but I'm always ready to help you verify facts."
   - For "Who are you?" or "What do you do?": "I'm CivicSense, an independent fact-checking assistant dedicated to verifying Nigerian political claims and news."
2. "fact_checking": Any verifiable claim, rumor, news event, political assertion, government policy, election issue, or question about Nigerian public figures.
   - Extract the core assertion into "search_query" (clean English keywords, max 12 words, strip filler). Translate Pidgin to clean English keywords.
   - Leave "reply" empty ("").
3. "off_topic": Out-of-scope LLM tasks such as requests to write essays (e.g. World War 2), write code, do homework, compose poems/stories, solve general science/math problems, or philosophical life essays (e.g. "what is the meaning of life").
   - You MUST reject these requests. Respond exactly with: "${OFFTOPIC_REJECTION}"

GUARDRAILS:
- Casual Queries: Exactly ONE polite, smart sentence.
- Out-of-Scope Tasks: Output exactly "${OFFTOPIC_REJECTION}".
- Length Limit: Never generate more than two sentences under any circumstance.
- Never invent facts, dates, sources, or URLs.

Return ONLY valid JSON with keys:
{
  "intent": "fact_checking|off_topic|casual",
  "reply": "string (required for off_topic and casual, empty for fact_checking)",
  "search_query": "clean English search string for fact-checking, or empty string",
  "confidence": 0-1
}`;

const OUT_OF_SCOPE_RE =
  /\b(write (an? )?(essay|poem|story|code|script|song|article)|code (in|for)|program in|python|javascript|solve this|homework|meaning of life|weather in|translate (this|into)|french|spanish|german)\b/i;

const IDENTITY_RE =
  /\b(who are you|who made you|what are you|what is your name|what do you do|what can you do|how to use|how does (this|it) work|about (you|civicsense)|help)\b/i;

const CASUAL_RE =
  /\b(favorite (color|colour|food|movie|music|song)|fav (color|colour)|how old are you|where (do you live|are you from)|are you (ai|a robot|real|human))\b/i;

const GREETING_RE =
  /\b(hi|hello|hey|yo|how are you|how far|how you dey|good (morning|afternoon|evening)|sup|what's up|whats up|how do you do|sannu|bawo|kedu|e nle|ndewo)\b/i;

const COURTESY_RE =
  /\b(thank(s| you)?|ok|okay|alright|cool|nice|goodbye|bye|cheers|welldone|well done)\b/i;

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
  const t = String(text || "").toLowerCase().trim();
  if (OUT_OF_SCOPE_RE.test(t)) {
    return {
      intent: "off_topic",
      reply: OFFTOPIC_REJECTION,
      search_query: "",
      confidence: 0.9,
      source: "fallback",
    };
  }
  if (IDENTITY_RE.test(t)) {
    return {
      intent: "casual",
      reply: "I'm CivicSense, an independent fact-checking assistant dedicated to verifying Nigerian political claims and news.",
      search_query: "",
      confidence: 0.85,
      source: "fallback",
    };
  }
  if (CASUAL_RE.test(t)) {
    return {
      intent: "casual",
      reply: "I don't have personal preferences or physical traits, but I'm always ready to help you verify facts.",
      search_query: "",
      confidence: 0.85,
      source: "fallback",
    };
  }
  if (GREETING_RE.test(t)) {
    let reply = "Hello! I'm CivicSense, send me any Nigerian political or civic claim and I'll verify it.";
    if (/how (are you|far|you dey|do you do)/i.test(t)) {
      reply = "I'm doing well, thank you! I'm ready to help you fact-check Nigerian news and political claims.";
    }
    return {
      intent: "casual",
      reply,
      search_query: "",
      confidence: 0.85,
      source: "fallback",
    };
  }
  if (COURTESY_RE.test(t) && t.length <= 30) {
    return {
      intent: "casual",
      reply: "You're welcome! Send me any Nigerian political claim anytime and I'll verify it.",
      search_query: "",
      confidence: 0.8,
      source: "fallback",
    };
  }
  const civic = /\b(nigeria|tinubu|shettima|obi|atiku|inec|apc|pdp|lp|senate|house|governor|president|election|vote|policy|budget|naira|subsidy|constitution|court|efcc|police|minister|bill|law)\b/.test(t);
  const facty = /\b(is it true|true or false|did|was|has|claim|fact check|verify|rumor|fake|hoax)\b/.test(t) || (civic && t.length > 20);
  if (facty) return { intent: "fact_checking", reply: "", search_query: text, confidence: 0.55, source: "fallback" };
  if (civic) return { intent: "casual", reply: "Send the specific Nigerian civic or political claim you want me to fact-check.", search_query: text, confidence: 0.5, source: "fallback" };
  if (t.length <= 25) {
    return {
      intent: "casual",
      reply: "Hello! I'm CivicSense, send me any Nigerian civic or political claim to fact-check.",
      search_query: "",
      confidence: 0.6,
      source: "fallback",
    };
  }
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
    max_tokens: Number(process.env.ROUTER_MAX_TOKENS || 250),
  };
  if (responseFormat) {
    body.response_format = { type: "json_object" };
  }
  const cleanKey = String(key || "").trim();
  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${cleanKey}`,
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
