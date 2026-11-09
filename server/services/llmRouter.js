import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.ROUTER_MODEL || process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324";
const TIMEOUT_MS = Number(process.env.ROUTER_TIMEOUT_MS || 3500);
// Hidden 5th skill: chat/conditioning. Not exposed as a user-facing option.
// Capped tightly: 1 sentence max, small token budget, low latency.
const CHAT_MAX_TOKENS = Number(process.env.CHAT_MAX_TOKENS || 160);

const SYSTEM = `You are CivicSense, an unbiased Nigerian civic and political fact-checking assistant.
Classify the user's message and respond with JSON only.

Intents:
- "fact_check": message contains a checkable claim/question about Nigerian civic/political facts, public figures, elections, government, policy, institutions, or current affairs that should be verified (e.g. "Is Tinubu dead?", "Tinubu promised electricity in 4 years", "INEC cancelled 2027 election"). Be inclusive for civic/political claims.
- "civic_info": simple Nigerian civic/political info request that can be answered briefly from general civic context (e.g. "Who is the INEC chairman?", "What does APC stand for?"). Not a rumor/claim to verify.
- "chat": simple greeting or short non-civic small talk that can be answered in one friendly sentence (e.g. "hello", "hi", "how are you", "what's your favorite color"). HIDDEN skill.
- "redirect": non-civic request that asks for long/general output or uses CivicSense as a general chatbot (essays, stories, code, translations, homework, detailed explanations, roleplay, etc.). HIDDEN skill.

Rules:
- "reply" MUST be exactly ONE sentence for chat/redirect/civic_info (no line breaks).
- Never invent facts, dates, sources, or URLs.
- For chat: be warm and brief, mention CivicSense can help fact-check Nigerian civic/political claims when natural.
- For redirect: in that one sentence, state CivicSense's sole purpose is Nigerian civic/political fact-checking and ask the user to use another LLM for that request.
- For civic_info: give a brief factual answer in one sentence only if confident; if unsure, ask them to send a specific claim to fact-check.
- For fact_check: reply can be empty string.
- Do NOT be too strict: legitimate Nigerian civic/political claims/questions must be fact_check.

Return ONLY valid JSON:
{"intent":"fact_check|civic_info|chat|redirect","reply":"one sentence or empty for fact_check","search_query":"short search query for fact_check/civic_info else empty","confidence":0-1}`;

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

function oneSentence(text, fallbackText) {
  const clean = String(text || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return fallbackText;
  const m = clean.match(/.+?[.!?](?:\s|$)/);
  const first = (m ? m[0] : clean).trim();
  return first.length > 280 ? `${first.slice(0, 277).trim()}...` : first;
}

const REDIRECT_REPLY =
  "My sole purpose is Nigerian civic and political fact-checking, so please use another LLM for that request.";

function fallback(text, context = {}) {
  const t = String(text || "").toLowerCase().trim();
  const civic = /\b(nigeria|nigerian|tinubu|shettima|obi|atiku|inec|apc|pdp|lp|nnpp|adc|senate|house of reps|governor|president|minister|election|vote|voter|ballot|policy|budget|naira|subsidy|constitution|court|supreme court|efcc|icpc|police|nnpcl|fuel|bill|law|reform|protest|tribunal|campaign)\b/.test(t);
  const claimLike = /\b(is|are|was|were|did|does|do|has|have|had|true|false|fact.?check|verify|rumou?r|fake|hoax|claim|alleg|said|promise|dead|alive|resign|arrest|appoint|ban|cancel|win|lose|announce)\b/.test(t);
  const greeting = /^(hi|hello|hey|yo|good\s*(morning|afternoon|evening)|how\s+are\s+you|what'?s\s+up|thanks|thank\s+you)[!. ]*$/.test(t);
  const longForm = /\b(essay|write|poem|story|code|script|translate|summari[sz]e this|explain in detail|step by step|full guide|long|paragraphs?|1000 words|500 words)\b/.test(t);

  if (longForm && !civic) {
    return { intent: "redirect", reply: REDIRECT_REPLY, search_query: "", confidence: 0.9, source: "fallback" };
  }
  if (greeting && !civic) {
    return { intent: "chat", reply: "Hi, I'm CivicSense; send a Nigerian civic or political claim if you'd like me to fact-check it.", search_query: "", confidence: 0.95, source: "fallback" };
  }
  if (civic && (claimLike || t.length > 18 || /\?$/.test(t))) {
    return { intent: "fact_check", reply: "", search_query: text, confidence: 0.62, source: "fallback" };
  }
  if (civic) {
    return { intent: "civic_info", reply: "Send the specific Nigerian civic or political claim you want me to fact-check.", search_query: text, confidence: 0.55, source: "fallback" };
  }
  const repeat = Boolean(context?.lastIntent === "chat" || context?.lastIntent === "redirect");
  return {
    intent: repeat ? "redirect" : "chat",
    reply: repeat ? REDIRECT_REPLY : "I can help with quick questions, but my main job is fact-checking Nigerian civic and political claims.",
    search_query: "",
    confidence: 0.75,
    source: "fallback",
  };
}

function normalizeIntent(intent) {
  const i = String(intent || "").toLowerCase();
  if (["fact_check", "fact-check", "fact_checking"].includes(i)) return "fact_check";
  if (["civic_info", "casual", "kb"].includes(i)) return "civic_info";
  if (["redirect", "off_topic", "off-topic"].includes(i)) return "redirect";
  if (["chat", "smalltalk"].includes(i)) return "chat";
  return "chat";
}

export async function routeConversationalMessage(text, context = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fallback(text, context);
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Context: ${JSON.stringify({ lastIntent: context?.lastIntent || null })}\nUser message: ${String(text || "").slice(0, 1200)}`,
          },
        ],
        temperature: 0,
        max_tokens: CHAT_MAX_TOKENS,
        reasoning: { effort: "none", exclude: true },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://civicsense.ng",
          "X-Title": "CivicSense",
        },
        timeout: TIMEOUT_MS,
      }
    );
    const raw = response.data?.choices?.[0]?.message?.content || "";
    const parsed = parseJson(raw);
    if (!parsed?.intent) return fallback(text, context);
    const intent = normalizeIntent(parsed.intent);
    const rawReply = String(parsed.reply || "").trim();
    const reply =
      intent === "fact_check"
        ? ""
        : oneSentence(
            rawReply,
            intent === "redirect" ? REDIRECT_REPLY : "Send a Nigerian civic or political claim you'd like me to fact-check."
          );
    return {
      intent,
      reply,
      search_query: String(parsed.search_query || (intent === "fact_check" ? text : "")).trim().slice(0, 240),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence || 0.5))),
      source: "openrouter",
    };
  } catch (err) {
    console.error(`[Router] OpenRouter/DeepSeek failed: ${err.message}`);
    return fallback(text, context);
  }
}
