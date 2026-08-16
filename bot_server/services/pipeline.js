import { searchClaim } from "./search.js";
import { searchArticlesFromIndex } from "./scraper.js";
import {
  searchKnowledgeBase,
  extractClaimFromImage,
  buildVerdict,
} from "./gemini.js";

const DEADLINE_MS = Number(process.env.PIPELINE_DEADLINE_MS) || 14000;

export async function runFactCheck({ claim, imageDataUrl, caption }) {
  const started = Date.now();
  let extractedClaim = null;

  if (imageDataUrl) {
    try {
      extractedClaim = await extractClaimFromImage(imageDataUrl, caption);
    } catch (err) {
      console.error(`Image claim extraction failed: ${err.message}`);
    }
  }

  const activeClaim = extractedClaim || claim;
  if (!activeClaim || !activeClaim.trim()) {
    throw new Error("No claim provided — send a text claim or an image.");
  }

  const deadline = started + DEADLINE_MS;

  const [kbMatches, articles, tavilyText] = await Promise.allSettled([
    Promise.resolve(searchKnowledgeBase(activeClaim)),
    searchArticlesFromIndex(activeClaim, 6),
    searchClaim(activeClaim),
  ]);

  const ctx = {
    kbMatches: kbMatches.status === "fulfilled" ? kbMatches.value : [],
    articles: articles.status === "fulfilled" ? articles.value : [],
    tavilyText: tavilyText.status === "fulfilled" ? tavilyText.value : "",
  };

  const verdict = await buildVerdict(activeClaim, ctx);

  const latencyMs = Date.now() - started;
  return {
    claim: claim || extractedClaim,
    extractedClaim,
    verdict: verdict.formatted,
    structured: {
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      whatWeFound: verdict.whatWeFound,
      source: verdict.source,
      sources: verdict.sources,
    },
    latencyMs,
  };
}
