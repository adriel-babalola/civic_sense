import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.ROUTER_MODEL || process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324";
const TIMEOUT_MS = Number(process.env.ROUTER_TIMEOUT_MS || 3500);

const SYSTEM = `You are CivicSense, a Nigerian civic and political fact-checking assistant.
Primary function: classify user messages and help fact-check Nigerian civic/political claims using grounded evidence.

Rules:
- Never invent facts, dates, sources, or URLs.
- If evidence is insufficient, say so clearly.
- For off-topic or non-civic requests, reply in exactly ONE short sentence and stay polite.
- If user persists with off-topic requests (context will indicate repeat), reply in exactly ONE sentence asking them to use another chatbot because this is not CivicSense's primary function.
- Keep replies concise and fast.

Return ONLY valid JSON with keys:
{
  "intent": "fact_checking|off_topic|casual",
  "reply": "string (required for off_topic/casual, optional otherwise)",
  "search_query": "string for fact checking/civic lookup or empty string",
  "confidence": 0-1
}`;

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

function fallback(text, context = {}) {
  const t = String(text || "").toLowerCase();
  const civic = /\b(nigeria|tinubu|shettima|obi|atiku|inec|apc|pdp|lp|senate|house|governor|president|election|vote|policy|budget|naira|subsidy|constitution|court|efcc|police|minister|bill|law)\b/.test(t);
  const facty = /\b(is it true|true or false|did|was|has|claim|fact check|verify|rumor|fake|hoax)\b/.test(t) || (civic && t.length > 20);
  if (facty) return { intent: "fact_checking", reply: "", search_query: text, confidence: 0.55, source: "fallback" };
  if (civic) return { intent: "casual", reply: "Send the specific Nigerian civic or political claim you want me to fact-check.", search_query: text, confidence: 0.5, source: "fallback" };
  const repeat = Boolean(context?.lastIntent === "off_topic");
  return {
    intent: "off_topic",
    reply: repeat
      ? "Please use another chatbot for that request; CivicSense is focused on Nigerian civic and political fact-checking."
      : "I can only help with Nigerian civic and political fact-checking claims.",
    search_query: "",
    confidence: 0.7,
    source: "fallback",
  };
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
            content: `Context: ${JSON.stringify({ lastIntent: context?.lastIntent || null, repeatOffTopic: context?.lastIntent === "off_topic" })}\nUser message: ${text}`,
          },
        ],
        temperature: 0,
        max_tokens: 180,
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
    const intent = ["fact_checking", "off_topic", "casual"].includes(parsed.intent) ? parsed.intent : "off_topic";
    return {
      intent,
      reply: String(parsed.reply || "").trim(),
      search_query: String(parsed.search_query || "").trim(),
      confidence: Number(parsed.confidence || 0.5),
      source: "openrouter",
    };
  } catch (err) {
    console.error(`[Router] OpenRouter/DeepSeek failed: ${err.message}`);
    return fallback(text, context);
  }
}
