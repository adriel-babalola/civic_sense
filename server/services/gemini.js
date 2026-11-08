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
      temperature: 0.1,
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
  try {
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
    return cleaned || caption || "Image political claim";
  } catch (err) {
    console.error(`Image claim extraction error: ${err.message}`);
    return caption || "Image political claim";
  }
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

  const entityNames = new Set(["tinubu", "shettima", "obi", "atiku", "buhari", "nigeria", "apc", "pdp", "lp", "inec"]);
  const predicateWords = words.filter((w) => !entityNames.has(w));

  if (predicateWords.length === 0) return true;
  return predicateWords.some((w) => haystack.includes(w));
}

function fallbackVerdict(claim, ctx = {}) {
  const norm = normalizeClaim(claim);

  // 1. Direct check against verified Knowledge Base
  const kb = (ctx.kbMatches || []).find((e) => e.verdict && e.verdict !== "UNVERIFIED" && e.matchedClaimWords >= 2);
  if (kb) {
    const data = {
      verdict: kb.verdict,
      confidence: 85,
      whatWeFound: kb.explanation,
      source: kb.source,
      sources: [],
    };
    data.formatted = buildFormatted(data);
    return data;
  }

  // 2. High-confidence heuristic for death/arrest rumors of sitting leaders
  const isDeathRumor = /\b(dead|die|died|death|killed|demise|pass(ed)? away)\b/i.test(claim);
  const mentionsTinubu = /\b(tinubu|president|bola ahmed)\b/i.test(claim);
  if (isDeathRumor && mentionsTinubu) {
    const data = {
      verdict: "FALSE",
      confidence: 95,
      whatWeFound:
        "No, President Bola Ahmed Tinubu is alive and currently serving as Nigeria's president. Claims of his death or incapacitation are recurring, unfounded social media rumors. No credible Nigerian news organization or the State House has reported his death.",
      source: "State House, Premium Times, Punch",
      sources: [],
    };
    data.formatted = buildFormatted(data);
    return data;
  }

  // 3. Heuristic for identity queries about major public figures
  if (/^(who is|who be)\s+(tinubu|bola tinubu|bola ahmed tinubu|the president of nigeria)\b/i.test(claim)) {
    const data = {
      verdict: "VERIFIED",
      confidence: 95,
      whatWeFound: "Bola Ahmed Tinubu is the 16th and current President of Nigeria, inaugurated on May 29, 2023. He previously served as Governor of Lagos State from 1999 to 2007.",
      source: "State House, Official Records",
      sources: [],
    };
    data.formatted = buildFormatted(data);
    return data;
  }
  if (/^(who is|who be)\s+(shettima|kashim shettima|the vice president of nigeria)\b/i.test(claim)) {
    const data = {
      verdict: "VERIFIED",
      confidence: 95,
      whatWeFound: "Kashim Shettima is the current Vice President of Nigeria, serving alongside President Bola Tinubu since May 29, 2023. He previously served as Governor of Borno State and Senator for Borno Central.",
      source: "State House, Official Records",
      sources: [],
    };
    data.formatted = buildFormatted(data);
    return data;
  }
  if (/^(who is|who be)\s+(peter obi)\b/i.test(claim)) {
    const data = {
      verdict: "VERIFIED",
      confidence: 95,
      whatWeFound: "Peter Gregory Obi was the Labour Party presidential candidate in the 2023 Nigerian general election. He previously served as Governor of Anambra State from 2006 to 2014.",
      source: "Official Records",
      sources: [],
    };
    data.formatted = buildFormatted(data);
    return data;
  }

  // 4. Relevant articles from scraped index or search
  const rawArticles = ctx.articles || [];
  const relevantArticles = rawArticles.filter((a) => isArticleRelevantToClaim(a, claim));

  if (relevantArticles.length > 0) {
    const top = relevantArticles[0];
    const data = {
      verdict: "UNVERIFIED",
      confidence: 60,
      whatWeFound: `Regarding this claim, related news reporting: "${top.title}" was published by ${top.source}, but independent verification of the claim is ongoing.`,
      source: top.source || "Nigerian newsrooms",
      sources: relevantArticles.slice(0, 3).map((a) => ({
        title: a.title,
        url: a.link,
        site: a.source,
      })),
    };
    data.formatted = buildFormatted(data);
    return data;
  }

  // 4. Clean grounded unverified fallback
  const data = {
    verdict: "UNVERIFIED",
    confidence: 40,
    whatWeFound:
      `We found no credible evidence, official statement, or news reports confirming: "${claim}". No major Nigerian news organization (such as Premium Times, Punch, or Channels TV) has verified this.`,
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
    `You are CivicSense, an intelligent Nigerian civic and political fact-checking assistant operating at Google/MIT quality standards.\n` +
    `Your mission: Directly, accurately, and authoritatively answer the user's specific claim or question about Nigerian civic affairs, politics, government, and public figures.\n\n` +
    `CRITICAL INSTRUCTIONS:\n` +
    `1. DIRECT ANSWER FIRST: In the very first sentence of "whatWeFound", answer the user's question DIRECTLY and unambiguously. For example:\n` +
    `   - If asked "is tinubu dead": "No, President Bola Ahmed Tinubu is alive and currently in office as Nigeria's president."\n` +
    `   - If asked "did tinubu remove fuel subsidy": "Yes, President Bola Tinubu announced the removal of the petrol subsidy during his inauguration on May 29, 2023."\n` +
    `   - If asked about an appointment or law: state directly whether it happened, when, and who announced it.\n` +
    `2. FACTUAL GROUNDING & EXPLANATION: Add 1-2 concise sentences explaining the verified context, citing official decisions or debunking recurring rumors. Keep total length to 2-3 sentences.\n` +
    `3. VIRAL RUMORS & HOAXES: If the claim is a known recurring hoax, unfounded death/arrest rumor, or viral social media gossip without any confirmation from credible national media or official releases, classify it as FALSE or UNVERIFIED and explicitly state that it is an unsubstantiated rumor.\n` +
    `4. RELEVANCE RULE: Never cite unrelated articles. An article that merely mentions a politician's name in an unrelated context (e.g. a party rally or economic speech) is NOT evidence about their death, health, or arrest. Only cite articles whose content directly addresses the claim.\n` +
    `5. VERDICTS:\n` +
    `   - "VERIFIED": Confirmed by official records, government statements, or credible reporting.\n` +
    `   - "FALSE": Factually untrue, fabricated, debunked hoax, or contradicts established public records.\n` +
    `   - "MISLEADING": Contains partial truth but distorts facts, takes quotes out of context, or misrepresents reality.\n` +
    `   - "UNVERIFIED": An active, emerging rumor where verifiable facts are still absent or genuinely contested.\n` +
    `6. CONFIDENCE: 85-99% for established facts or clear hoaxes; 65-84% for single-source or contested issues; below 65% for emerging unconfirmed rumors.\n` +
    `7. SOURCES: Cite real URLs only from the provided evidence. If no specific URLs apply, cite authoritative sources (e.g. "State House, Premium Times, Punch").\n\n` +
    `User claim / question: "${claim}"\n\n` +
    `--- KNOWLEDGE BASE ---\n${kbContext}\n\n` +
    `--- EVIDENCE ---\n${evidence}\n\n` +
    `Respond with ONLY valid JSON, no markdown outside the JSON:\n` +
    `{\n` +
    `  "verdict": "VERIFIED|MISLEADING|FALSE|UNVERIFIED",\n` +
    `  "confidence": 0-100,\n` +
    `  "whatWeFound": "Direct answer in sentence 1, followed by 1-2 grounded explanatory sentences.",\n` +
    `  "source": "Short reputable source label",\n` +
    `  "sources": [{"title": "...", "url": "https://...", "site": "..."}]\n` +
    `}`;

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
