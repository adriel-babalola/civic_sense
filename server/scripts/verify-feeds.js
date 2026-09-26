import dotenv from "dotenv";
dotenv.config();

import Parser from "rss-parser";
import { NEWS_SOURCES } from "../services/newsSources.js";

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
  },
});

async function verify(source) {
  const start = Date.now();
  try {
    const feed = await parser.parseURL(source.feed);
    const title = feed.items?.[0]?.title || "no items";
    return {
      name: source.name,
      feed: source.feed,
      status: "OK",
      items: feed.items?.length || 0,
      firstTitle: title.slice(0, 90),
      ms: Date.now() - start,
    };
  } catch (err) {
    return {
      name: source.name,
      feed: source.feed,
      status: "FAIL",
      error: err.message.slice(0, 120),
      ms: Date.now() - start,
    };
  }
}

const results = await Promise.all(NEWS_SOURCES.map(verify));

const ok = results.filter((r) => r.status === "OK");
const fail = results.filter((r) => r.status === "FAIL");

console.log("");
console.log("  SOURCE".padEnd(22) + "STATUS".padEnd(8) + "ITEMS".padEnd(7) + "MS".padEnd(7) + "FIRST TITLE");
console.log("-".repeat(110));
for (const r of results) {
  const firstTitle = r.status === "OK" ? r.firstTitle : r.error;
  console.log(
    r.name.padEnd(22) +
      r.status.padEnd(8) +
      String(r.items ?? "-").padEnd(7) +
      String(r.ms).padEnd(7) +
      firstTitle
  );
}
console.log("-".repeat(110));
console.log(`  OK: ${ok.length}/${results.length}   FAIL: ${fail.length}`);

process.exit(fail.length > 3 ? 1 : 0);
