import Parser from "rss-parser";
import { NEWS_SOURCES } from "./newsSources.js";
import { saveArticles, searchArticles as dbSearchArticles, isDbConnected } from "./db.js";

const INTERVAL_MS = (Number(process.env.SCRAPE_INTERVAL_MIN) || 30) * 60 * 1000;
const MAX_MEMORY_ARTICLES = Number(process.env.SCRAPE_MEMORY_MAX) || 3000;

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
});

const memoryArticles = [];
const sourceHealth = new Map();
let lastSyncAt = null;
let lastSyncError = null;
let syncing = false;

function extractImageUrl(item) {
  if (item.mediaContent && item.mediaContent.length) {
    const withImage = item.mediaContent.find((m) => m.$ && m.$.url && m.$.medium !== "video");
    if (withImage && withImage.$.url) return withImage.$.url;
  }
  if (item.mediaThumbnail && item.mediaThumbnail.length) {
    const t = item.mediaThumbnail[0];
    if (t && t.$ && t.$.url) return t.$.url;
  }
  const html = item.content || item["content:encoded"] || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];
  return null;
}

function normalizeItem(item, source) {
  return {
    title: (item.title || "").trim().slice(0, 500),
    link: item.link || item.guid,
    snippet: (item.contentSnippet || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 800),
    content: (item.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 4000),
    imageUrl: extractImageUrl(item),
    source: source.name,
    sourceBase: source.baseUrl,
    category: source.category,
    region: source.region,
    pubDate: item.isoDate ? new Date(item.isoDate) : new Date(),
  };
}

async function fetchFeed(source) {
  try {
    const feed = await parser.parseURL(source.feed);
    const items = (feed.items || [])
      .filter((i) => i.link)
      .map((i) => normalizeItem(i, source));
    const health = sourceHealth.get(source.name) || {};
    health.lastStatus = "ok";
    health.lastFetched = new Date();
    health.lastError = null;
    health.articleCount = items.length;
    sourceHealth.set(source.name, health);
    return items;
  } catch (err) {
    const health = sourceHealth.get(source.name) || {};
    health.lastStatus = "error";
    health.lastError = err.message;
    health.lastFetched = new Date();
    sourceHealth.set(source.name, health);
    return [];
  }
}

export async function syncOnce() {
  if (syncing) return { skipped: true };
  syncing = true;
  const started = Date.now();
  let collected = 0;
  let stored = 0;

  const batches = await Promise.all(NEWS_SOURCES.map(fetchFeed));
  const seen = new Set();
  for (const batch of batches) {
    for (const article of batch) {
      if (article.link && !seen.has(article.link)) {
        seen.add(article.link);
        collected++;
        memoryArticles.unshift(article);
      }
    }
  }

  if (memoryArticles.length > MAX_MEMORY_ARTICLES) {
    memoryArticles.length = MAX_MEMORY_ARTICLES;
  }

  stored = await saveArticles(memoryArticles.slice(0, 300));

  lastSyncAt = new Date();
  lastSyncError = null;
  syncing = false;
  const elapsed = Date.now() - started;
  console.log(
    `[Scraper] Synced ${NEWS_SOURCES.length} sources, collected ${collected}, stored ${stored} in ${elapsed}ms`
  );
  return { collected, stored, elapsed };
}

function tokenize(claim) {
  return claim
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function memorySearch(claim, limit = 8) {
  const terms = tokenize(claim);
  if (terms.length === 0) return [];
  const scored = memoryArticles.map((a) => {
    const text = `${a.title} ${a.snippet} ${a.content} ${a.source}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      const idx = text.indexOf(t);
      if (idx >= 0) score += 1 + Math.max(0, 100 - idx / 10) / 1000;
    }
    return { ...a, score };
  });
  return scored
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}

export async function searchArticlesFromIndex(claim, limit = 8) {
  const dbResults = await dbSearchArticles(claim, limit);
  const memResults = memorySearch(claim, limit);
  const seen = new Set();
  const merged = [];
  for (const a of [...dbResults, ...memResults]) {
    if (a.link && !seen.has(a.link)) {
      seen.add(a.link);
      merged.push(a);
    }
    if (merged.length >= limit) break;
  }
  return merged;
}

export function getScraperStats() {
  return {
    sources: NEWS_SOURCES.length,
    healthy: Array.from(sourceHealth.values()).filter((h) => h.lastStatus === "ok").length,
    degraded: Array.from(sourceHealth.values()).filter((h) => h.lastStatus === "error").length,
    lastSyncAt,
    lastSyncError,
    memoryArticles: memoryArticles.length,
    sourceHealth: Array.from(sourceHealth.entries()).map(([name, h]) => ({ name, ...h })),
    dbConnected: isDbConnected(),
  };
}

let timer = null;

export function startScraper() {
  if (timer) return;
  syncOnce().catch((err) => {
    lastSyncError = err.message;
    console.error(`[Scraper] initial sync failed: ${err.message}`);
  });
  timer = setInterval(() => {
    syncOnce().catch((err) => {
      lastSyncError = err.message;
      console.error(`[Scraper] sync failed: ${err.message}`);
    });
  }, INTERVAL_MS);
  timer.unref?.();
  console.log(`[Scraper] Running every ${INTERVAL_MS / 60000} minutes`);
}
