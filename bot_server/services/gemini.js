import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "..", "data", "civic_kb.json");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map();

function normalizeClaim(claim) {
  return claim.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function getCached(claim) {
  const key = normalizeClaim(claim);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    console.log("  Cache hit");
    return entry.verdict;
  }
  return null;
}

function setCache(claim, verdict) {
  const key = normalizeClaim(claim);
  cache.set(key, { verdict, timestamp: Date.now() });
}

let kbCache = null;

function loadKnowledgeBase() {
  if (kbCache) return kbCache;
  kbCache = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  return kbCache;
}

function searchKnowledgeBase(claim) {
  const kb = loadKnowledgeBase();
  const query = normalizeClaim(claim).split(/\s+/);
  const scored = kb.map((entry) => {
    const text = `${entry.topic} ${entry.claim}`.toLowerCase();
    const score = query.filter((word) => text.includes(word)).length;
    return { ...entry, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).filter((e) => e.score > 0);
}

function enforceVerdictFormat(raw) {
  const verdictMatch = raw.match(/VERIFIED|MISLEADING|FALSE|UNVERIFIED/);
  const confidenceMatch = raw.match(/Confidence:\s*(\d{1,3})/);
  const whatWeFoundMatch = raw.match(
    /What we found:\*?\n?([\s\S]*?)(?:\*Source|$)/
  );
  const sourceMatch = raw.match(/Source:\*?\n?([\s\S]+)/);

  const verdict = verdictMatch ? verdictMatch[0] : "UNVERIFIED";
  const confidence = confidenceMatch
    ? Math.min(100, parseInt(confidenceMatch[1]))
    : 50;
  const whatWeFound = whatWeFoundMatch
    ? whatWeFoundMatch[1].trim()
    : "We could not determine a clear answer based on the available evidence.";
  const source = sourceMatch
    ? sourceMatch[1].trim()
    : "No specific source on file";

  return (
    `*VERDICT: ${verdict}*\n` +
    `*Confidence: ${confidence}%*\n` +
    `*What we found:*\n${whatWeFound}\n` +
    `*Source:*\n${source}`
  );
}

export async function factCheck(claim, tavilyResults = "") {
  const cached = getCached(claim);
  if (cached) return cached;

  const kbMatches = searchKnowledgeBase(claim);

  const kbContext =
    kbMatches.length > 0
      ? kbMatches
          .map(
            (e) =>
              `- "${e.claim}" (${e.verdict}): ${e.explanation} [Source: ${e.source}]`
          )
          .join("\n")
      : "No matching entries in the civic knowledge base.";

  const prompt =
    `You are Kratos, a Nigerian civic fact-checking AI. ` +
    `Fact-check the user's claim using only the evidence below. ` +
    `Do not guess. Do not rely on your training data unless no evidence is provided. ` +
    `Be conversational but factual — write 3 to 4 plain sentences that any Nigerian can understand. ` +
    `Explain what happened, who was involved, and where the information comes from.\n\n` +
    `User claim: "${claim}"\n\n` +
    `--- KNOWLEDGE BASE ---\n${kbContext}\n\n` +
    `--- LIVE SEARCH RESULTS ---\n${
      tavilyResults || "No live search results available."
    }\n\n` +
    `Respond in EXACTLY this format (no deviation):\n` +
    `*VERDICT: [VERIFIED / MISLEADING / FALSE / UNVERIFIED]*\n` +
    `*Confidence: [0-100]%*\n` +
    `*What we found:*\n` +
    `[3 to 4 plain English sentences. Conversational tone. Direct. No jargon.]\n` +
    `*Source:*\n` +
    `[List the full working URLs of the sources you used, one per line. ` +
    `Extract them from the live search results. Do not make up URLs.]`;

  const start = Date.now();

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 250,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://civicsense.ng",
          "X-Title": "CivicSense",
        },
        timeout: 30000,
      }
    );

    const elapsed = Date.now() - start;
    console.log(`  Gemini response time: ${elapsed}ms`);

    const raw = response.data.choices[0].message.content;
    const formatted = enforceVerdictFormat(raw);

    setCache(claim, formatted);

    return formatted;
  } catch (err) {
    console.error(`  OpenRouter error: ${err.message}`);
    return (
      `*VERDICT: UNVERIFIED*\n` +
      `*Confidence: 0%*\n` +
      `*What we found:*\n` +
      `Sorry, we ran into a technical issue while checking this claim. Please try again in a moment.\n` +
      `*Source:*\nSystem`
    );
  }
}
