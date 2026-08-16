import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cache } from "./cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "..", "data", "civic_kb.json");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.LLM_MODEL || "google/gemini-2.5-flash";
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS) || 12000;

function normalizeClaim(claim) {
  return claim.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
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
  kbCache = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  return kbCache;
}

export function searchKnowledgeBase(claim) {
  const kb = loadKnowledgeBase();
  const query = normalizeClaim(claim).split(/\s+/).filter(Boolean);
  const scored = kb.map((entry) => {
    const text = `${entry.topic} ${entry.claim} ${entry.explanation}`.toLowerCase();
    const score = query.filter((word) => text.includes(word)).length;
    return { ...entry, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).filter((e) => e.score > 0);
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

async function callModel(messages, maxTokens = 600) {
  const normalized =
    typeof messages === "string"
      ? [{ role: "user", content: messages }]
      : messages;
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      messages: normalized,
      temperature: 0.1,
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://civicsense.ng",
        "X-Title": "CivicSense",
      },
      timeout: LLM_TIMEOUT_MS,
    }
  );
  return response.data.choices[0].message.content;
}

function withTimeout(promise, ms = LLM_TIMEOUT_MS) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`LLM timed out after ${ms}ms`)),
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

function fallbackVerdict(claim, ctx) {
  const kb = (ctx.kbMatches || []).find((e) => e.verdict !== "UNVERIFIED");
  const data = kb
    ? {
        verdict: kb.verdict,
        confidence: 70,
        whatWeFound: kb.explanation,
        source: kb.source,
        sources: [],
      }
    : {
        verdict: "UNVERIFIED",
        confidence: 40,
        whatWeFound:
          "We could not determine a clear answer based on the available evidence. Please send more details or check back later.",
        source: "No specific source on file",
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
    `You are Kratos, a Nigerian civic fact-checking AI. Fact-check the user's claim using ONLY the evidence below. ` +
    `Do not guess. Do not rely on your training data unless no evidence is provided. ` +
    `Write 2 to 3 plain English sentences any Nigerian can understand.\n\n` +
    `MULTI-SOURCE RULE: Return VERIFIED only if multiple independent sources confirm it. ` +
    `Return FALSE only if multiple independent sources confirm it is false. ` +
    `If only one source supports a verdict, lean toward MISLEADING or UNVERIFIED. ` +
    `Confidence: 90%+ needs 3+ independent sources, 70-89% needs 2+, otherwise stay below 70%.\n\n` +
    `User claim: "${claim}"\n\n` +
    `--- KNOWLEDGE BASE ---\n${kbContext}\n\n` +
    `--- EVIDENCE ---\n${evidence}\n\n` +
    `Respond with ONLY a single valid JSON object, no markdown, with exactly these keys:\n` +
    `{"verdict": "VERIFIED|MISLEADING|FALSE|UNVERIFIED", "confidence": 0-100, ` +
    `"whatWeFound": "2-3 plain sentences", "source": "short source label", ` +
    `"sources": [{"title": "...", "url": "full working URL from evidence", "site": "domain name"}], }` +
    `Use real URLs only from the evidence; if none are usable, sources is [].`;

  const raw = await withTimeout(callModel(prompt, 600));
  const parsed = parseJsonSafely(raw);

  if (!parsed || !parsed.whatWeFound) {
    const fallback = fallbackVerdict(claim, { kbMatches });
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
