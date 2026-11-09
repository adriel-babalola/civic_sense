import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.ROUTER_MODEL || process.env.LLM_MODEL || "deepseek/deepseek-chat-v3-0324";
const TIMEOUT_MS = Number(process.env.ROUTER_TIMEOUT_MS || 3500);
// Hidden 5th skill: chat/conditioning. Not exposed as a user-facing option.
// Capped tightly: 1 sentence max, small token budget, low latency.
const CHAT_MAX_TOKENS = Number(process.env.CHAT_MAX_TOKENS || 160);

const SYSTEM = `You are CivicSense, an unbiased, human, context-aware Nigerian civic and political fact-checking assistant.
Your job: understand what the user means (including follow-ups, typos, Nigerian slang, and short messages) and respond naturally. Return JSON only.

Intents:
- "fact_check": any message that is or implies a verifiable claim/question about Nigeria's public life — politics, government, elections, public officials, policies, laws, courts, security, agencies (INEC, EFCC, NNPC etc.), economy/cost-of-living claims tied to government/policy (fuel/petrol/diesel prices, subsidy, inflation figures, minimum wage, budgets), public statements, protests, or viral civic rumors. Examples: "Is Tinubu dead?", "fuel price is 30000 naira", "what is the price of fuel in Nigeria?", "did government remove subsidy?", "Tinubu promised electricity in 4 years". When in doubt for Nigerian civic/public-interest claims, choose fact_check.
- "civic_info": simple civic question where a brief, careful answer is fine (not a rumor to debunk), e.g. "who is the INEC chairman?", "what does APC stand for?". If it could be time-sensitive or disputed, prefer fact_check.
- "chat": ONLY simple human small talk/greetings/identity questions with no civic claim — "hello", "how are you?", "who are you?", "what can you do?", "thanks". Reply warmly and naturally in ONE sentence (you can briefly say you help fact-check Nigerian civic/political claims, but don't be robotic or repeat the same canned line every time). Use context: if user asked "how are you and who are you", answer both briefly.
- "redirect": clearly non-civic and requests substantial/general output — essays, poems, stories, code, translations, homework, step-by-step tutorials, roleplay, or "act as my general chatbot" for unrelated topics. Reply in ONE sentence: state CivicSense focuses on Nigerian civic/political fact-checking and suggest using another LLM for that. Do NOT redirect Nigerian civic topics (fuel prices, government policy, elections) as "general chatbot" requests.

Rules:
- "reply" must be exactly ONE sentence for chat/redirect/civic_info (no line breaks). Be human, not stiff.
- Never invent facts, dates, sources, or URLs. If unsure in civic_info, ask them to send the specific claim to fact-check.
- For fact_check, reply is empty string and search_query should capture the claim clearly (fix obvious typos like "fule"->"fuel" in search_query).
- Context matters: follow-up messages like "no like how are you?" are chat, not redirect.

Return ONLY valid JSON:
{"intent":"fact_check|civic_info|chat|redirect","reply":"one sentence or empty for fact_check","search_query":"search query for fact_check/civic_info else empty","confidence":0-1}`;

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
  const raw = String(text || "").trim();
  const t = raw.toLowerCase();
  const civic = /\b(nigeria|nigerian|tinubu|shettima|obi|atiku|inec|apc|pdp|lp|nnpp|adc|senate|house of reps|governor|president|minister|election|vote|voter|ballot|policy|budget|naira|subsidy|constitution|court|supreme court|efcc|icpc|police|nnpcl|nnpc|fuel|petrol|pms|diesel|kerosene|price|prices|inflation|economy|tax|levy|tariff|bill|law|reform|protest|tribunal|campaign|cabinet|ministerial|judiciary|corruption|bribe)\b/.test(t)
    || /\b(fule|petrl|petro)\b/.test(t); // common typos
  const claimLike = /\b(is|are|was|were|did|does|do|has|have|had|true|false|fact.?check|verify|rumou?r|fake|hoax|claim|alleg|said|says|promise|dead|alive|resign|arrest|appoint|ban|cancel|win|lose|announce|increase|reduce|hit|hits|cost|costs|worth|pay|paid|now|current|today|latest)\b/.test(t)
    || /\d/.test(t) || /\?/.test(t);
  const identityChat = /\b(who are you|what are you|what can you do|what do you do|your name)\b/.test(t);
  const howAreYou = /\b(how are you|how r u|how far|how you dey|how's it going|hope you.*(good|well|fine))\b/.test(t);
  const greeting = /^(hi|hello|hey|yo|hiya|good\s*(morning|afternoon|evening|day)|what'?s\s+up|sup|thanks|thank\s+you|ok|okay|cool|alright)[!. ?]*$/i.test(t);
  const longForm = /\b(essay|write\s+(me\s+)?(a|an|the)?\s*(poem|story|script|letter|article|blog|report)|code|program|python|javascript|html|css|sql|translate|summari[sz]e\s+(this|the\s+following|it)\b|explain\s+.{0,30}\s+in detail|step by step|tutorial|teach me|full guide|lesson plan|1000 words|500 words|paragraphs?)\b/.test(t)
    && !/\b(law|bill|policy|constitution|election|budget)\b/.test(t);

  if (longForm) {
    return { intent: "redirect", reply: REDIRECT_REPLY, search_query: "", confidence: 0.88, source: "fallback" };
  }
  // context-aware chat: follow-ups to chat like "no like how are you? and who are you"
  const chatFollowUp = (context?.lastIntent === "chat" || context?.lastIntent === "civic_info") && /\b(how are you|who are you|what are you|no like|i mean|i meant)\b/.test(t) && !claimLike;
  if (identityChat || howAreYou || chatFollowUp) {
    const reply = identityChat && howAreYou
      ? "I'm doing well, thanks — I'm CivicSense, and I help fact-check Nigerian civic and political claims."
      : identityChat
        ? "I'm CivicSense, a Nigerian civic and political fact-checking assistant."
        : "I'm doing well, thanks for asking — if you have a Nigerian civic or political claim, I can help check it.";
    return { intent: "chat", reply, search_query: "", confidence: 0.9, source: "fallback" };
  }
  if (greeting && !civic) {
    return { intent: "chat", reply: "Hi! I'm CivicSense — I can help fact-check Nigerian civic and political claims.", search_query: "", confidence: 0.95, source: "fallback" };
  }
  if (civic) {
    // fuel/price/government-impact claims are civic fact-check territory
    const sq = raw.replace(/\bfule\b/gi, "fuel").replace(/\bpetrl\b/gi, "petrol");
    if (claimLike || /\b(price|cost|how much|current|today|now|rate|hit|increase|decrease)\b/.test(t) || raw.length > 18) {
      return { intent: "fact_check", reply: "", search_query: sq, confidence: 0.64, source: "fallback" };
    }
    return { intent: "civic_info", reply: "Could you share the specific Nigerian civic claim or question you want me to check?", search_query: sq, confidence: 0.55, source: "fallback" };
  }
  const repeat = Boolean(context?.lastIntent === "chat" || context?.lastIntent === "redirect");
  return {
    intent: repeat ? "redirect" : "chat",
    reply: repeat ? REDIRECT_REPLY : "I can chat briefly, but I'm best at fact-checking Nigerian civic and political claims — what would you like checked?",
    search_query: "",
    confidence: 0.72,
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
    const recent = Array.isArray(context?.recent) ? context.recent.slice(-4) : [];
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Context: ${JSON.stringify({ lastIntent: context?.lastIntent || null, recent })}\nUser message: ${String(text || "").slice(0, 1200)}`,
          },
        ],
        temperature: 0.2,
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
            intent === "redirect" ? REDIRECT_REPLY : "I'm here to help — share a Nigerian civic or political claim if you'd like me to check it."
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
