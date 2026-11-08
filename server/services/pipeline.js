import { searchClaim } from "./search.js";
import { searchArticlesFromIndex } from "./scraper.js";
import {
  searchKnowledgeBase,
  extractClaimFromImage,
  buildVerdict,
} from "./gemini.js";

const DEADLINE_MS = Number(process.env.PIPELINE_DEADLINE_MS) || 25000;

/* ───────────────────────────────────────────────────────────
   Stop-words shared with gemini.js KB search – words that
   carry no *predicate* meaning for relevance scoring.
   ─────────────────────────────────────────────────────────── */
const STOP = new Set([
  "is","it","the","a","an","did","was","has","who","what","where",
  "when","why","how","to","in","on","for","of","and","or","by","from",
  "that","this","these","those","are","were","been","being","be","do",
  "does","say","said","saying","tell","told","ask","asked","claim","about",
  "please","can","could","will","would","any","all","true","false","really",
  "have","had","not","but","with","they","them","their","its","you","your",
  "our","just","very","also","than","then","now","there","here","some",
  "my","his","her","she","he","we","me","us","may","might","shall","should",
]);

/* Words that are Nigerian political entity names / proper nouns.
   Matching ONLY on an entity name (e.g. "tinubu") is not enough
   to declare an article relevant — the article must also match at
   least one predicate/action word from the claim. */
const ENTITY_NAMES = new Set([
  "tinubu","shettima","obi","atiku","buhari","wike","fubara","sanwo",
  "olu","emefiele","cardoso","dangote","adeboye","fashola","aregbesola",
  "osinbajo","jonathan","obj","obasanjo","ngige","amaechi","keyamo",
  "elrufai","ganduje","tambuwal","dino","melaye","sowore","ezekwesili",
  "nigeria","nigerian","naija","abuja","lagos","kano","kaduna",
  "inec","apc","pdp","lp","nnpc","cbn","efcc","icpc","dss",
]);

/**
 * Extract "predicate" words from a claim — the action/assertion words
 * that distinguish WHAT is being asked about a person/entity.
 * e.g. "is tinubu dead" → ["dead"]
 *      "did tinubu remove fuel subsidy" → ["remove","fuel","subsidy"]
 */
function extractPredicateWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w) && !ENTITY_NAMES.has(w));
}

/**
 * Score how relevant an article is to the specific claim.
 * Returns 0 if the article only matches entity names but not the predicate.
 */
function articleRelevanceScore(article, predicateWords, allClaimWords) {
  if (predicateWords.length === 0) {
    // No predicate words extracted (very short query) — accept anything matching claim words
    return allClaimWords.length;
  }

  const haystack = `${article.title || ""} ${article.snippet || ""} ${article.content || ""}`.toLowerCase();
  let predicateHits = 0;
  let entityHits = 0;

  for (const w of predicateWords) {
    if (haystack.includes(w)) predicateHits++;
  }
  for (const w of allClaimWords) {
    if (ENTITY_NAMES.has(w) && haystack.includes(w)) entityHits++;
  }

  // Must match at least ONE predicate word to be considered relevant
  if (predicateHits === 0) return 0;

  return predicateHits * 3 + entityHits;
}

/**
 * Filter articles to only those actually relevant to the specific claim.
 * Prevents "is tinubu dead" from returning APC protest or fuel subsidy articles
 * that merely mention "Tinubu".
 */
function filterRelevantArticles(articles, claim, limit = 6) {
  if (!articles || articles.length === 0) return [];

  const allClaimWords = claim
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

  const predicateWords = extractPredicateWords(claim);

  const scored = articles.map((a) => ({
    ...a,
    _relevance: articleRelevanceScore(a, predicateWords, allClaimWords),
  }));

  const relevant = scored
    .filter((a) => a._relevance > 0)
    .sort((a, b) => b._relevance - a._relevance)
    .slice(0, limit)
    .map(({ _relevance, ...rest }) => rest);

  console.log(
    `[Pipeline] Article relevance filter: ${articles.length} input → ${relevant.length} relevant (predicate words: [${predicateWords.join(", ")}])`
  );

  return relevant;
}

export async function runFactCheck({ claim, imageDataUrl, caption, searchQuery = "" }) {
  const started = Date.now();
  let extractedClaim = null;
  const cleanQuery = String(searchQuery || "").trim();

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

  const [kbMatches, rawArticles, tavilyText] = await Promise.allSettled([
    Promise.resolve(searchKnowledgeBase(cleanQuery || activeClaim)),
    searchArticlesFromIndex(cleanQuery || activeClaim, 12),
    searchClaim(activeClaim, cleanQuery),
  ]);

  // Apply relevance filtering — this is THE key fix.
  // Raw articles from the index/DB match on ANY keyword (including names).
  // We filter to only keep articles whose content addresses the specific claim.
  const unfilteredArticles = rawArticles.status === "fulfilled" ? rawArticles.value : [];
  const articles = filterRelevantArticles(unfilteredArticles, activeClaim, 6);

  const ctx = {
    kbMatches: kbMatches.status === "fulfilled" ? kbMatches.value : [],
    articles,
    tavilyText: tavilyText.status === "fulfilled" ? tavilyText.value : "",
  };

  const verdict = await buildVerdict(activeClaim, ctx);

  const latencyMs = Date.now() - started;
  return {
    claim: claim || extractedClaim,
    extractedClaim,
    searchQuery: cleanQuery,
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
