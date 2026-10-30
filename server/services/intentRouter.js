import axios from "axios";
import { cache } from "./cache.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OR_URL = "https://openrouter.ai/api/v1/chat/completions";

const INTENTS = new Set([
  "fact_checking",
  "news_update",
  "general_query",
  "off_topic",
]);

const SYSTEM_PROMPT = [
  "You are an intent router for a Nigerian civic WhatsApp bot. You never chat, explain, think out loud, or greet.",
  "Output ONLY one minified JSON object. No markdown, no code fences, no text before or after.",
  'Schema: {"intent":"fact_checking|news_update|general_query|off_topic","search_query":"","confidence":0.0}',
  "Intent definitions:",
  "- fact_checking: a specific verifiable claim about a politician, government, election, policy, security, economy, or other civic fact.",
  "- news_update: wants recent news, headlines, updates, or a digest (latest, today, breaking, what is happening).",
  "- general_query: greeting, thanks, how-to, or a general question that is not a verifiable factual claim.",
  "- off_topic: unrelated to Nigerian civic or political matters, or a request to chat about something else.",
  "search_query rules:",
  "- English only, maximum 12 words, no filler, no greetings, no leading phrases like 'is it true that'.",
  "- Keep only names, places, numbers, dates and the core assertion.",
  "- Multi-paragraph input: condense everything into ONE precise query.",
  "- Non-English input: translate to English.",
  '- For news_update, name the topic; for general_query and off_topic output "".',
  "- confidence is 0.0 to 1.0; use 0.5 only when genuinely torn between two intents.",
].join("\n");

const FEWSHOT = [
  [
    "hi",
    { intent: "general_query", search_query: "", confidence: 0.99 },
  ],
  [
    "Abeg check whether Tinubu don sign the fuel subsidy bill today, my uncle dey talk am since morning and e dey vex me",
    { intent: "fact_checking", search_query: "Tinubu fuel subsidy bill signed", confidence: 0.9 },
  ],
  [
    "latest news on fuel subsidy and ASUU strike",
    { intent: "news_update", search_query: "fuel subsidy ASUU strike", confidence: 0.94 },
  ],
  [
    "Good morning sir, I hope you are well.\n\nMy colleague at work shared a post on Facebook that says the federal government has already increased the salary of all workers by 40 percent. Some people are saying it is true and others say it is a lie.\n\nPlease is this true? I need to know before I go and celebrate.",
    { intent: "fact_checking", search_query: "federal government 40 percent salary increase workers", confidence: 0.92 },
  ],
  [
    "lol you dey too funny 😂",
    { intent: "off_topic", search_query: "", confidence: 0.93 },
  ],
  [
    "how do I register to vote in Nigeria",
    { intent: "general_query", search_query: "", confidence: 0.86 },
  ],
];

export function buildMessages(text) {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];
  for (const [input, output] of FEWSHOT) {
    messages.push({ role: "user", content: input });
    messages.push({ role: "assistant", content: JSON.stringify(output) });
  }
  messages.push({ role: "user", content: text });
  return messages;
}

function buildRepairMessages(text, raw) {
  const messages = buildMessages(text);
  messages.push({ role: "assistant", content: String(raw).slice(0, 600) });
  messages.push({
    role: "user",
    content: "That output was invalid. Output ONLY the corrected minified JSON object matching the schema.",
  });
  return messages;
}

export function parseJsonSafely(raw) {
  try {
    const start = String(raw).indexOf("{");
    const end = String(raw).lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) return null;
    return JSON.parse(String(raw).slice(start, end + 1));
  } catch {
    return null;
  }
}

export function validateRoute(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  if (!INTENTS.has(parsed.intent)) return null;
  const conf = Number(parsed.confidence);
  if (!Number.isFinite(conf)) return null;
  const q =
    typeof parsed.search_query === "string"
      ? parsed.search_query.trim().replace(/\s+/g, " ").slice(0, 120)
      : "";
  return {
    intent: parsed.intent,
    search_query: q,
    confidence: Math.min(1, Math.max(0, conf)),
  };
}

const NEWS_RE =
  /\b(latest|today|todays|news|headline[s]?|update[s]?|digest|breaking|recent|what'?s happening|what is happening)\b/i;
const GREETING_RE =
  /\b(hi|hello|hey|yo|good (morning|afternoon|evening)|thanks|thank you|menu|help|what can you do)\b/i;

export function heuristicRoute(text) {
  const t = String(text || "")
    .trim()
    .replace(/\s+/g, " ");
  const lower = t.toLowerCase();
  const base = {
    source: "heuristic",
    ambiguous: false,
    latencyMs: 0,
  };
  if (!lower) {
    return { ...base, intent: "general_query", search_query: "", confidence: 0.6 };
  }
  if (NEWS_RE.test(lower)) {
    return {
      ...base,
      intent: "news_update",
      search_query: lower.slice(0, 120),
      confidence: 0.7,
    };
  }
  if (GREETING_RE.test(lower) && lower.split(" ").length <= 6) {
    return { ...base, intent: "general_query", search_query: "", confidence: 0.7 };
  }
  return {
    ...base,
    intent: "fact_checking",
    search_query: t.slice(0, 120),
    confidence: 0.65,
  };
}

let failures = 0;
let openUntil = 0;

function breakerOpen() {
  return Date.now() < openUntil;
}

function recordFailure() {
  failures += 1;
  if (failures >= 5) {
    failures = 0;
    openUntil = Date.now() + 60000;
    console.warn("[Router] Circuit open for 60s — heuristic routing only");
  }
}

function recordSuccess() {
  failures = 0;
  openUntil = 0;
}

export function resetRouterState() {
  failures = 0;
  openUntil = 0;
  cache.clear();
}

async function callProvider({ url, key, model, messages, timeout, responseFormat }, post) {
  const body = { model, messages, temperature: 0, max_tokens: 150 };
  if (responseFormat) body.response_format = { type: "json_object" };
  const res = await post(url, body, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://civicsense.fyi",
      "X-Title": "CivicSense",
    },
    timeout,
  });
  return res?.data?.choices?.[0]?.message?.content ?? null;
}

export async function classifyIntent(text, opts = {}) {
  const post = opts.post || axios.post;
  const started = Date.now();
  const trimmed = String(text || "")
    .trim()
    .slice(0, 1500);

  if (!trimmed) {
    return {
      intent: "general_query",
      search_query: "",
      confidence: 0,
      source: "heuristic",
      ambiguous: true,
      latencyMs: 0,
    };
  }

  const minConf = Number(process.env.ROUTER_MIN_CONFIDENCE) || 0.55;
  const budget = Number(process.env.ROUTER_BUDGET_MS) || 2000;
  const timeoutMs = Number(process.env.ROUTER_TIMEOUT_MS) || 1200;
  const cacheKey = `route:${trimmed.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      ...cached,
      source: "cache",
      ambiguous: cached.confidence < minConf,
      latencyMs: Date.now() - started,
    };
  }

  if (breakerOpen()) {
    return { ...heuristicRoute(trimmed), latencyMs: Date.now() - started };
  }

  const providers = [
    {
      name: "groq",
      url: GROQ_URL,
      key: process.env.GROQ_API_KEY,
      model: process.env.ROUTER_MODEL_GROQ || "llama-3.1-8b-instant",
      responseFormat: true,
    },
    {
      name: "openrouter",
      url: OR_URL,
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.ROUTER_MODEL_OR || "google/gemini-2.0-flash-lite",
      responseFormat: false,
    },
  ];

  let parsed = null;
  let attempted = false;

  for (const p of providers) {
    if (!p.key) continue;
    const remaining = budget - (Date.now() - started);
    if (remaining < 250) break;
    attempted = true;

    let raw = await callProvider(
      { ...p, messages: buildMessages(trimmed), timeout: Math.min(timeoutMs, remaining) },
      post
    ).catch(() => null);

    if (raw) parsed = validateRoute(parseJsonSafely(raw));

    if (!parsed && raw && budget - (Date.now() - started) > 500) {
      const raw2 = await callProvider(
        {
          ...p,
          messages: buildRepairMessages(trimmed, raw),
          timeout: Math.min(timeoutMs, budget - (Date.now() - started)),
        },
        post
      ).catch(() => null);
      if (raw2) parsed = validateRoute(parseJsonSafely(raw2));
    }

    if (parsed) {
      const ambiguous = parsed.confidence < minConf;
      const result = {
        ...parsed,
        source: p.name,
        ambiguous,
        latencyMs: Date.now() - started,
      };
      cache.set(cacheKey, {
        intent: parsed.intent,
        search_query: parsed.search_query,
        confidence: parsed.confidence,
      });
      recordSuccess();
      console.log(
        `[Router] intent=${result.intent} source=${result.source} conf=${result.confidence} ambiguous=${ambiguous} ${result.latencyMs}ms`
      );
      return result;
    }
  }

  if (attempted) recordFailure();
  const result = { ...heuristicRoute(trimmed), latencyMs: Date.now() - started };
  console.log(
    `[Router] intent=${result.intent} source=heuristic conf=${result.confidence} (${attempted ? "llm_failed" : "no_llm_key"}) ${result.latencyMs}ms`
  );
  return result;
}
