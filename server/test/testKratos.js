import dotenv from "dotenv";
dotenv.config();

import { runFactCheck } from "../services/pipeline.js";
import { saveFactCheck } from "../services/db.js";

const TEST_CLAIMS = [
  "Did Tinubu remove the fuel subsidy?",
  "Is it true the naira is now stronger than the dollar?",
  "Did Nigeria ban crypto completely?",
  "Was SARS disbanded after EndSARS?",
  "Did Nigeria increase minimum wage to 70000 naira?",
  "Did Peter Obi win the 2023 election?",
  "Is there a student loan scheme in Nigeria?",
  "Is fuel now 200 naira per litre in Nigeria?",
  "Did the Supreme Court uphold Tinubu's election victory?",
  "Did Nigeria join BRICS in 2024?",
  "Is it true Nigeria's debt has exceeded 100 trillion naira?",
  "Did the government pay all ASUU strike arrears?",
];

function extractVerdict(text) {
  const m = text.match(/\*VERDICT:\s*(\w+)/);
  return m ? m[1] : "ERROR";
}

async function worker(claim) {
  const start = Date.now();
  try {
    const result = await runFactCheck({ claim });
    const time = Date.now() - start;
    const v = extractVerdict(result.verdict);
    console.log(`  [${v.padEnd(11)}] ${String(time).padStart(6)}ms  "${claim}"`);
    await saveFactCheck({
      claim,
      verdict: result.verdict,
      channel: "test",
      timestamp: new Date(),
    });
    return { ok: true, v, time, claim };
  } catch (err) {
    const time = Date.now() - start;
    console.error(`  [ERROR       ] ${String(time).padStart(6)}ms  "${claim}" — ${err.message}`);
    return { ok: false, v: "ERROR", time, claim };
  }
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  KRATOS — PARALLEL LIVE FACT-CHECK TEST");
  console.log("=".repeat(60) + "\n");

  const verdictCounts = { VERIFIED: 0, MISLEADING: 0, FALSE: 0, UNVERIFIED: 0, ERROR: 0 };
  const times = [];

  const CONCURRENCY = 4;
  let idx = 0;
  async function runBatch(batch) {
    const results = await Promise.all(batch.map(worker));
    for (const r of results) {
      verdictCounts[r.v]++;
      times.push(r.time);
    }
  }

  for (let i = 0; i < TEST_CLAIMS.length; i += CONCURRENCY) {
    await runBatch(TEST_CLAIMS.slice(i, i + CONCURRENCY));
  }

  times.sort((a, b) => a - b);
  const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
  const p95 = times[Math.floor(times.length * 0.95)] || 0;

  console.log("\n" + "=".repeat(60));
  console.log("  SUMMARY");
  console.log("=".repeat(60));
  console.log(`  Total:     ${TEST_CLAIMS.length}`);
  console.log(`  Avg:       ${avg}ms`);
  console.log(`  p95:       ${p95}ms`);
  console.log(`  Fastest:   ${times[0]}ms`);
  console.log(`  Slowest:   ${times[times.length - 1]}ms`);
  console.log(`  VERIFIED:  ${verdictCounts.VERIFIED}`);
  console.log(`  MISLEADING:${verdictCounts.MISLEADING}`);
  console.log(`  FALSE:     ${verdictCounts.FALSE}`);
  console.log(`  UNVERIFIED:${verdictCounts.UNVERIFIED}`);
  console.log(`  ERROR:     ${verdictCounts.ERROR}`);
  console.log("=".repeat(60) + "\n");

  process.exit(0);
}

main();
