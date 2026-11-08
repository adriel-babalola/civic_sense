import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cache } from "./cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "..", "data", "civic_kb.json");

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEEPSEEK_MODEL = (process.env.LLM_MODEL_DEEPSEEK || process.env.ROUTER_MODEL_DEEPSEEK || "deepseek-chat").trim();
const OPENROUTER_MODEL = (process.env.LLM_MODEL || process.env.ROUTER_MODEL || "deepseek/deepseek-chat-v3-0324").trim();
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 12000;

function normalizeClaim(claim) {
  return String(claim || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

function getCached(claim) {
  return cache.get(`fc:${normalizeClaim(claim)}`);
}

function setCache(claim, verdict) {
  cache.set(`fc:${normalizeClaim(claim)}`, verdict);
}

let kbCache = null;

export function loadKnowledgeBase() {
  if (kbCache) return kbCache;
  try {
    kbCache = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  } catch {
    kbCache = [];
  }
  return kbCache;
}

const STOP_WORDS = new Set([
  "is", "it", "the", "a", "an", "did", "was", "has", "who", "what", "where",
  "when", "why", "how", "to", "in", "on", "for", "of", "and", "or", "by", "from",
  "that", "this", "these", "those", "are", "were", "been", "being", "be", "do",
  "does", "say", "said", "saying", "tell", "told", "ask", "asked", "claim", "about",
  "please", "can", "could", "will", "would", "any", "all", "true", "false", "really"
]);

export function searchKnowledgeBase(claim) {
  const kb = loadKnowledgeBase();
  const queryWords = normalizeClaim(claim)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (queryWords.length === 0) return [];

  const scored = kb.map((entry) => {
    const claimWords = normalizeClaim(entry.claim).split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    const topicWords = normalizeClaim(entry.topic).split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    const expWords = normalizeClaim(entry.explanation).split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    let matchedClaimWords = 0;
    let matchedTopicWords = 0;
    let matchedExpWords = 0;

    for (const w of queryWords) {
      if (claimWords.includes(w)) matchedClaimWords++;
      if (topicWords.includes(w)) matchedTopicWords++;
      if (expWords.includes(w)) matchedExpWords++;
    }

    const score = matchedClaimWords * 3 + matchedTopicWords * 2 + matchedExpWords * 1;
    return { ...entry, score, matchedClaimWords };
  });

  scored.sort((a, b) => b.score - a.score);
  // Match requires at least 2 distinct substantive claim words to prevent false-positive matching
  // (e.g. asking "is tinubu dead" should NEVER match "Fuel subsidy removed by Tinubu")
  return scored.filter((e) => e.matchedClaimWords >= 2 && e.score >= 6).slice(0, 5);
}

export function buildKnowledgeContext(kbMatches) {
  return kbMatches && kbMatches.length > 0
    ? kbMatches
        .map(
          (e) =>
            `- "${e.claim}" (${e.verdict}): ${e.explanation} [Source: ${e.source}]`
        )
        .join("\n")
    : "No matching entries in the civic knowledge base.";
}

function resolveProviders() {
  const deepseekRaw = (
    process.env.DEEPSEEK_API_KEY ||
    process.env.DEEPSEEK_KEY ||
    process.env.DEEP_SEEK_API_KEY ||
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const openrouterRaw = (
    process.env.OPENROUTER_API_KEY ||
    ""
  ).trim().replace(/^["']|["']$/g, "");

  const providers = [];

  if (deepseekRaw) {
    if (deepseekRaw.startsWith("sk-or-")) {
      providers.push({
        name: "openrouter",
        url: OPENROUTER_URL,
        key: deepseekRaw,
        model: "deepseek/deepseek-chat-v3-0324",
      });
    } else {
      providers.push({
        name: "deepseek",
        url: DEEPSEEK_URL,
        key: deepseekRaw,
        model: "deepseek-chat",
      });
    }
  }

  if (openrouterRaw && !providers.some((p) => p.name === "openrouter")) {
    providers.push({
      name: "openrouter",
      url: OPENROUTER_URL,
      key: openrouterRaw,
      model: OPENROUTER_MODEL,
    });
  }

  return providers;
}

async function callModel(messages, maxTokens = 600, options = {}) {
  const normalized =
    typeof messages === "string"
      ? [{ role: "user", content: messages }]
      : messages;

  const hasImage = Array.isArray(normalized) && normalized.some((m) =>
    Array.isArray(m.content) && m.content.some((c) => c.type === "image_url")
  );

  const available = resolveProviders();
  if (available.length === 0) {
    throw new Error("No LLM API key configured (set DEEPSEEK_API_KEY or OPENROUTER_API_KEY)");
  }

  let lastError = null;
  for (const p of available) {
    if (hasImage && p.name !== "openrouter") continue;

    const payload = {
      model: hasImage ? "google/gemini-2.0-flash-lite" : p.model,
      messages: normalized,
      temperature: 0,
      max_tokens: maxTokens,
      ...options,
    };

    try {
      const response = await axios.post(
        p.url,
        payload,
        {
          headers: {
            Authorization: `Bearer ${p.key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://civicsense.fyi",
            "X-Title": "CivicSense",
          },
          timeout: LLM_TIMEOUT_MS,
        }
      );
      const text = response.data?.choices?.[0]?.message?.content || "";
      if (text) return text;
    } catch (err) {
      console.warn(`[LLM] Provider ${p.name} failed (${err.response?.status || err.message})`);
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw new Error("All LLM providers failed");
}

function withTimeout(promise, ms = LLM_TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Fact check timed out after ${ms}ms`)),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function extractClaimFromImage(imageDataUrl, caption = "") {
  const parts = [];
  if (caption && caption.trim()) {
    parts.push(
      `The user also sent this caption/description: "${caption.trim().slice(0, 500)}"`
    );
  }
  parts.push(
    "Look at the image. It may be a screenshot of a WhatsApp message, a poster, a news graphic, or a photo with text overlay. " +
      "Extract the CORE CLAIM being made that a fact-checker should verify (the assertion about Nigeria or politics or civic matters). " +
      "If the image contains multiple statements, pick the single most verifiable factual claim. " +
      "Output ONLY the claim text in plain English, 1 sentence, no quotes, no labels."
  );
  const raw = await withTimeout(
    callModel([
      {
        role: "user",
        content: [
          { type: "text", text: parts.join("\n") },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ], 300)
  );
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").slice(0, 500);
  if (!cleaned) throw new Error("Could not extract a claim from the image.");
  return cleaned;
}

function parseJsonSafely(raw) {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeVerdict(v) {
  const s = String(v || "").toUpperCase();
  if (s.includes("TRUE") || s === "VERIFIED") return "VERIFIED";
  if (s.includes("FALSE") || s.includes("FABRICATED") || s.includes("FAKE"))
    return "FALSE";
  if (s.includes("MISLEAD")) return "MISLEADING";
  if (s.includes("UNVERIFIED") || s.includes("NOT VERIFIED")) return "UNVERIFIED";
  return "UNVERIFIED";
}

function buildFormatted(data) {
  const sourcesText = (data.sources || [])
    .map((s) => s.url || s.site)
    .filter(Boolean)
    .slice(0, 5)
    .join("\n");
  return (
    `*VERDICT: ${data.verdict}*\n` +
    `*Confidence: ${data.confidence}%*\n` +
    `*What we found:*\n${data.whatWeFound}\n` +
    `*Source:*\n${sourcesText || data.source || "No specific source on file"}`
  );
}

/**
 * Checks if an article has substantive relevance to the predicate of a claim.
 * Prevents citing "APC protest" articles as evidence for "is tinubu dead".
 */
function isArticleRelevantToClaim(article, claim) {
  if (!article) return false;
  const haystack = `${article.title || ""} ${article.snippet || ""}`.toLowerCase();
  const words = normalizeClaim(claim)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Common entity names that are NOT enough on their own
  const entityNames = new Set(["tinubu", "shettima", "obi", "atiku", "buhari", "nigeria", "apc", "pdp", "lp", "inec"]);
  const predicateWords = words.filter((w) => !entityNames.has(w));

  if (predicateWords.length === 0) return true;
  return predicateWords.some((w) => haystack.includes(w));
}

function fallbackVerdict(claim, ctx = {}) {
  const kb = (ctx.kbMatches || []).find((e) => e.verdict && e.verdict !== "UNVERIFIED" && e.matchedClaimWords >= 2);
  if (kb) {
    const data = {
      verdict: kb.verdict,
      confidence: 75,
      whatWeFound: kb.explanation,
      source: kb.source,
      sources: [],
    };
    data.formatted = buildFormatted(data);
    return data;
  }

  const rawArticles = ctx.articles || [];
  // ONLY use articles if they actually match the specific claim predicate
  const relevantArticles = rawArticles.filter((a) => isArticleRelevantToClaim(a, claim));

  if (relevantArticles.length > 0) {
    const top = relevantArticles[0];
    const data = {
      verdict: "UNVERIFIED",
      confidence: 50,
      whatWeFound: `We found related reporting: "${top.title}" from ${top.source}, but could not independently confirm this claim.`,
      source: top.source || "Nigerian news index",
      sources: relevantArticles.slice(0, 3).map((a) => ({
        title: a.title,
        url: a.link,
        site: a.source,
      })),
    };
    data.formatted = buildFormatted(data);
    return data;
  }

  const data = {
    verdict: "UNVERIFIED",
    confidence: 40,
    whatWeFound:
      `We could not find verified evidence or reports confirming: "${claim}". No major Nigerian news source or official government release has verified this.`,
    source: "Nigerian newsrooms & fact-check index",
    sources: [],
  };
  data.formatted = buildFormatted(data);
  return data;
}

export async function buildVerdict(claim, ctx = {}) {
  const cached = getCached(claim);
  if (cached) return cached;

  const kbMatches = ctx.kbMatches || searchKnowledgeBase(claim);
  const kbContext = buildKnowledgeContext(kbMatches);
  const articles = ctx.articles || [];
  const tavilyText = ctx.tavilyText || "";

  const articleText = articles
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title} (${a.source}, ${a.sourceBase})\n${a.snippet || ""}\nURL: ${a.link}`
    )
    .join("\n\n");

  const evidence =
    [tavilyText ? `--- LIVE SEARCH ---\n${tavilyText}` : "", articleText ? `--- NIGERIAN NEWS / FACT-CHECK INDEX ---\n${articleText}` : ""]
      .filter(Boolean)
      .join("\n\n") || "No live evidence available for this claim.";

  const prompt =
    `You are CivicSense, a Nigerian civic and political fact-checking assistant. ` +
    `Primary function: verify Nigerian civic/political claims using ONLY the evidence provided. ` +
    `Never invent facts, dates, people, events, URLs, or sources. Never use outside knowledge to fill gaps. ` +
    `If evidence is insufficient or conflicting, return UNVERIFIED and state what is missing. ` +
    `Cite only sources present in the evidence. Keep response concise and factual.\n\n` +
    `CRITICAL RELEVANCE RULE: An article that merely mentions the same person, party, or institution ` +
    `is NOT evidence for/against the specific claim. Only cite articles whose content DIRECTLY addresses ` +
    `the specific assertion being checked. For example, if the claim is "is tinubu dead", an article about ` +
    `"APC protest against Tinubu" or "fuel subsidy removal by Tinubu" is NOT relevant evidence about his death. ` +
    `If NO evidence directly addresses the specific claim, return UNVERIFIED and state that no credible reports ` +
    `were found confirming or denying this specific claim, with sources as [].\n\n` +
    `Decision rules: VERIFIED = multiple independent credible sources confirm it. FALSE = multiple independent credible sources disprove it. ` +
    `Single-source or weak/conflicting evidence => MISLEADING or UNVERIFIED. ` +
    `Confidence: 90%+ needs 3+ independent sources, 70-89% needs 2+, otherwise below 70%.\n\n` +
    `User claim: "${claim}"\n\n` +
    `--- KNOWLEDGE BASE ---\n${kbContext}\n\n` +
    `--- EVIDENCE ---\n${evidence}\n\n` +
    `Respond with ONLY valid JSON, no markdown:\n` +
    `{"verdict":"VERIFIED|MISLEADING|FALSE|UNVERIFIED","confidence":0-100,` +
    `"whatWeFound":"2-3 short factual sentences grounded in evidence","source":"short source label",` +
    `"sources":[{"title":"...","url":"https://...","site":"domain"}]}` +
    `Use real URLs only from evidence; if none usable, sources is [].`;

  let raw = "";
  try {
    raw = await withTimeout(callModel(prompt, 600));
  } catch (err) {
    console.error(`[FactCheck] LLM call failed: ${err.message}`);
  }
  const parsed = parseJsonSafely(raw);

  if (!parsed || !parsed.whatWeFound) {
    const fallback = fallbackVerdict(claim, { kbMatches, articles });
    setCache(claim, fallback);
    return fallback;
  }

  const data = {
    verdict: normalizeVerdict(parsed.verdict),
    confidence: Math.min(100, Math.max(0, parseInt(parsed.confidence, 10) || 50)),
    whatWeFound: String(parsed.whatWeFound).trim(),
    source: String(parsed.source || "Multiple Nigerian news sources").trim(),
    sources: Array.isArray(parsed.sources)
      ? parsed.sources
          .filter((s) => s && (s.url || s.title))
          .map((s) => ({
            title: String(s.title || "").slice(0, 200),
            url: String(s.url || ""),
            site: String(s.site || new URL(s.url || "https://example.com").hostname.replace("www.", "")),
          }))
          .filter((s) => s.url.startsWith("http"))
          .slice(0, 6)
      : [],
  };
  if (data.sources.length === 0 && kbMatches.length > 0) {
    data.source = kbMatches[0].source;
  }
  data.formatted = buildFormatted(data);
  setCache(claim, data);
  return data;
}

export async function factCheck(claim, evidenceText = "") {
  const data = await buildVerdict(claim, {
    kbMatches: searchKnowledgeBase(claim),
    tavilyText: evidenceText,
  });
  return data.formatted;
}
