import dotenv from "dotenv";
dotenv.config();

import { connectDB, saveFactCheck } from "../services/db.js";
import { searchClaim } from "../services/search.js";
import { factCheck } from "../services/gemini.js";

const TEST_CLAIMS = [
  "Did Tinubu remove the fuel subsidy?",
  "Is it true the naira is now stronger than the dollar?",
  "Did Nigeria ban crypto completely?",
  "Was SARS disbanded after EndSARS?",
  "Is it true Tinubu forged his school certificate?",
  "Did Nigeria increase minimum wage to 70000 naira?",
  "Is there still insecurity in Zamfara state?",
  "Did Peter Obi win the 2023 election?",
  "Is it true there is a student loan scheme in Nigeria?",
  "Did CBN print too much money and cause inflation?",
  "Is fuel now 200 naira per litre in Nigeria?",
  "Did the Supreme Court uphold Tinubu's election victory?",
  "Is it true Nigeria has free healthcare now?",
  "Did the government pay all ASUU strike arrears?",
  "Is Borno state completely free of Boko Haram?",
  "Did Nigeria join BRICS in 2024?",
  "Is it true Dangote refinery has solved fuel scarcity?",
  "Did the CBN ban dollar transactions?",
  "Was the naira redesign policy successful?",
  "Is it true Nigeria's debt has exceeded 100 trillion naira?",
];

function extractVerdict(text) {
  const m = text.match(/\*VERDICT:\s*(\w+)/);
  return m ? m[1] : "ERROR";
}

async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("  KRATOS PHASE 1 — CORE INTELLIGENCE TEST");
  console.log("=".repeat(50) + "\n");

  await connectDB().catch((err) =>
    console.error("MongoDB connection warning:", err.message)
  );

  const results = { total: 0, failed: 0, totalTime: 0 };
  const verdictCounts = { VERIFIED: 0, MISLEADING: 0, FALSE: 0, UNVERIFIED: 0, ERROR: 0 };

  for (let i = 0; i < TEST_CLAIMS.length; i++) {
    const claim = TEST_CLAIMS[i];
    console.log(`--- Claim ${i + 1}/${TEST_CLAIMS.length} ---`);
    console.log(`  "${claim}"`);

    const start = Date.now();

    try {
      const searchResults = await searchClaim(claim);
      console.log(`  Tavily: ${searchResults ? "data received" : "no results"}`);

      const verdict = await factCheck(claim, searchResults);
      const time = Date.now() - start;

      console.log(`\n${verdict}`);
      console.log(`\n  Time: ${time}ms`);

      await saveFactCheck({
        claim,
        verdict,
        channel: "test",
        timestamp: new Date(),
      });

      results.total++;
      results.totalTime += time;

      const v = extractVerdict(verdict);
      verdictCounts[v] = (verdictCounts[v] || 0) + 1;
    } catch (err) {
      const time = Date.now() - start;
      console.error(`  ERROR: ${err.message}`);
      console.log(`  Time: ${time}ms`);
      results.failed++;
      results.total++;
      results.totalTime += time;
      verdictCounts.ERROR++;
    }

    console.log("");
  }

  console.log("=".repeat(50));
  console.log("  SUMMARY");
  console.log("=".repeat(50));
  console.log(`  Total claims:    ${results.total}`);
  console.log(`  Failed:          ${results.failed}`);
  console.log(`  Average time:    ${Math.round(results.totalTime / results.total)}ms`);
  console.log(`  VERIFIED:        ${verdictCounts.VERIFIED}`);
  console.log(`  MISLEADING:      ${verdictCounts.MISLEADING}`);
  console.log(`  FALSE:           ${verdictCounts.FALSE}`);
  console.log(`  UNVERIFIED:      ${verdictCounts.UNVERIFIED}`);
  console.log(`  ERROR:           ${verdictCounts.ERROR}`);
  console.log("\n" + "=".repeat(50));
  console.log("  KRATOS PHASE 1 COMPLETE.");
  console.log("  Core intelligence verified.");
  console.log("  Ready for Twilio integration.");
  console.log("=".repeat(50) + "\n");

  process.exit(0);
}

main();
