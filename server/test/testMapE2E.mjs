/**
 * End-to-end test for the incident map and the CIVIC tag.
 *
 * Boots a throwaway in-memory MongoDB, seeds articles with known state tags and
 * fact-checks with both civic values, starts the real server against that
 * database, and drives the HTTP API the website uses.
 *
 * The test is skipped cleanly when mongodb-memory-server is not installed, so
 * `npm test` never fails for a missing optional dependency. Run it explicitly
 * with: npm run test:e2e
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.E2E_PORT) || 3211;
const BASE = `http://localhost:${PORT}`;

let MongoMemoryServer;
try {
  ({ MongoMemoryServer } = await import("mongodb-memory-server"));
} catch {
  console.log("SKIP: mongodb-memory-server is not installed (npm run test:e2e needs it).");
  process.exit(0);
}

let passed = 0;
let failed = 0;
async function run(name, fn) {
  const started = Date.now();
  try {
    const info = await fn();
    passed += 1;
    console.log(`  [PASS] ${name} (${Date.now() - started}ms)${info ? ` — ${info}` : ""}`);
  } catch (err) {
    failed += 1;
    console.error(`  [FAIL] ${name} — ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri("civicsense_e2e");

// Seed through the real data layer, in this process, against the same database.
process.env.MONGODB_URI = uri;
process.env.SCRAPE_INTERVAL_MIN = "9999";
const db = await import("../services/db.js");

const child = spawn("node", ["server.js"], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    PORT: String(PORT),
    MONGODB_URI: uri,
    SCRAPE_INTERVAL_MIN: "9999",
    OPENROUTER_API_KEY: "",
    DEEPSEEK_API_KEY: "",
  },
  stdio: ["ignore", "ignore", "inherit"],
});

async function waitForServer(tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) {
        const d = await r.json();
        if (d.db) return true;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

try {
  const ready = await waitForServer();
  assert(ready, "server did not connect to the in-memory database");

  // Deterministic seed. One story names two states (Lagos, Ogun); one names
  // none; the rest are single-state.
  const seeded = await db.saveArticles([
    { title: "Bandits attack a school in Kaduna State", link: "https://e2e.test/1", source: "Premium Times", states: ["Kaduna"], primaryState: "Kaduna", pubDate: new Date() },
    { title: "Port Harcourt refinery resumes operations", link: "https://e2e.test/2", source: "Channels TV", states: ["Rivers"], primaryState: "Rivers", pubDate: new Date() },
    { title: "Flood warnings for Lagos and Ogun", link: "https://e2e.test/3", source: "Punch", states: ["Lagos", "Ogun"], primaryState: "Lagos", pubDate: new Date() },
    { title: "Miners killed in Niger State", link: "https://e2e.test/4", source: "Daily Trust", states: ["Niger"], primaryState: "Niger", pubDate: new Date() },
    { title: "A story with no location at all", link: "https://e2e.test/5", source: "TheCable", states: [], primaryState: null, pubDate: new Date() },
  ]);

  await run("seed writes articles", () => {
    assert(seeded >= 5, `expected >=5 upserted, got ${seeded}`);
    return `${seeded} written`;
  });

  // Civic + non-civic fact-checks.
  await db.saveFactCheck({ claim: "Did Tinubu remove the fuel subsidy?", response: "Yes, on 29 May 2023.", verdict: "VERIFIED", civic: true, channel: "api", timestamp: new Date() });
  await db.saveFactCheck({ claim: "write an essay on Rome", response: "I only do Nigerian civic fact-checking.", verdict: "I only do Nigerian civic fact-checking.", civic: false, channel: "api", timestamp: new Date() });

  await run("GET /api/incidents/map returns states with articles", async () => {
    const r = await fetch(`${BASE}/api/incidents/map?perState=5`);
    const d = await r.json();
    assert(d.success, "not successful");
    const names = d.data.states.map((s) => s.state);
    for (const expected of ["Kaduna", "Rivers", "Lagos", "Niger", "Ogun"]) {
      assert(names.includes(expected), `missing state ${expected}: [${names.join(", ")}]`);
    }
    // Lagos carries at least the story that names it, which also names Ogun.
    const lagos = d.data.states.find((s) => s.state === "Lagos");
    assert(lagos.articles.length >= 1, "Lagos has no articles");
    return `${names.length} states`;
  });

  await run("GET /api/news?state= filters by state", async () => {
    const r = await fetch(`${BASE}/api/news?state=Kaduna`);
    const d = await r.json();
    assert(d.success, "not successful");
    assert(d.data.length === 1, `expected 1 Kaduna story, got ${d.data.length}`);
    assert(/Kaduna/.test(d.data[0].title), "wrong story returned");
    return d.data[0].title;
  });

  await run("GET /api/news without state is a 400", async () => {
    const r = await fetch(`${BASE}/api/news`);
    assert(r.status === 400, `expected 400, got ${r.status}`);
    return "ok";
  });

  await run("GET /api/factchecks is civic-only", async () => {
    const r = await fetch(`${BASE}/api/factchecks`);
    const d = await r.json();
    assert(d.success, "not successful");
    const offTopic = d.data.find((x) => /essay on Rome/i.test(x.claim || ""));
    assert(!offTopic, "a non-civic record leaked onto the public feed");
    const civic = d.data.find((x) => /fuel subsidy/i.test(x.claim || ""));
    assert(civic, "the civic record is missing");
    assert(civic.response && civic.response.length > 0, "response text was not stored");
    return `${d.data.length} civic records`;
  });

  await run("POST /api/factcheck tags an off-topic request as non-civic", async () => {
    const r = await fetch(`${BASE}/api/factcheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: "write an essay on the history of Rome" }),
    });
    const d = await r.json();
    assert(d.success, "not successful");
    assert(d.data.mode && d.data.mode !== "fact-check", `expected a non-fact-check mode, got ${d.data.mode}`);
    // And it must not appear on the public feed.
    const feed = await (await fetch(`${BASE}/api/factchecks`)).json();
    const leaked = feed.data.find((x) => /essay on the history of Rome/i.test(x.claim || ""));
    assert(!leaked, "the off-topic request leaked onto the public feed");
    return `mode=${d.data.mode}`;
  });
} finally {
  child.kill();
  await mongod.stop();
}

console.log(`\n  ${passed}/${passed + failed} e2e tests passed`);
process.exit(failed === 0 ? 0 : 1);
