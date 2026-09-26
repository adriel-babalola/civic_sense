import dotenv from "dotenv";
dotenv.config();

import { spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.TEST_PORT || 3100;
const BASE = `http://localhost:${PORT}`;
const FIXTURE_DIR = path.join(__dirname, "fixtures");
const FIXTURE_PATH = path.join(FIXTURE_DIR, "claim.png");

function ensureFixture() {
  if (fs.existsSync(FIXTURE_PATH)) return true;
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  const script = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(900, 260)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font('Arial', 32, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$g.DrawString('CBN printed money to cause inflation', $font, $brush, 20, 100)
$g.Dispose()
$bmp.Save('${FIXTURE_PATH.replace(/\\/g, "/")}', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output 'fixture-ok'
`;
  const res = spawnSync("pwsh", ["-NoProfile", "-Command", script], {
    encoding: "utf8",
    timeout: 30000,
  });
  return res.status === 0 && fs.existsSync(FIXTURE_PATH);
}

async function waitForServer(child, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  PIPELINE END-TO-END TEST");
  console.log("=".repeat(60) + "\n");

  const child = spawn("node", ["server.js"], {
    env: {
      ...process.env,
      PORT: String(PORT),
      SCRAPE_INTERVAL_MIN: "0",
      SCRAPE_SECRET: "test-secret",
    },
    stdio: "inherit",
  });

  const ready = await waitForServer(child);
  if (!ready) {
    console.error("  Server did not become ready.");
    child.kill();
    process.exit(1);
  }
  console.log("  Server ready.\n");

  const results = [];
  const run = async (name, fn) => {
    const start = Date.now();
    try {
      const info = await fn();
      const ms = Date.now() - start;
      console.log(`  [PASS] ${name} (${ms}ms)${info ? " — " + info : ""}`);
      results.push(true);
    } catch (err) {
      console.error(`  [FAIL] ${name} — ${err.message}`);
      results.push(false);
    }
  };

  await run("health", async () => {
    const r = await fetch(`${BASE}/api/health`);
    if (!r.ok) throw new Error("health not ok");
    const d = await r.json();
    return `db=${d.db} articles=${d.articles}`;
  });

  await run("text factcheck (JSON)", async () => {
    const r = await fetch(`${BASE}/api/factcheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: "Did Tinubu remove the fuel subsidy?" }),
    });
    const d = await r.json();
    if (!d.success) throw new Error(JSON.stringify(d));
    if (!d.data.structured || !d.data.structured.verdict) throw new Error("no structured verdict");
    return `${d.data.structured.verdict} in ${d.data.latencyMs}ms`;
  });

  await run("invalid claim (400)", async () => {
    const r = await fetch(`${BASE}/api/factcheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
    return "ok";
  });

  const hasFixture = ensureFixture();
  if (hasFixture) {
    const png = fs.readFileSync(FIXTURE_PATH);

    await run("multipart with image", async () => {
      const form = new FormData();
      form.append("image", new Blob([png], { type: "image/png" }), "claim.png");
      const r = await fetch(`${BASE}/api/factcheck`, { method: "POST", body: form });
      const d = await r.json();
      if (!d.success) throw new Error(JSON.stringify(d));
      if (!d.data.extractedClaim) throw new Error("no extracted claim from image");
      return `"${d.data.extractedClaim}" -> ${d.data.structured.verdict}`;
    });

    await run("base64 image", async () => {
      const r = await fetch(`${BASE}/api/factcheck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: png.toString("base64") }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(JSON.stringify(d));
      if (!d.data.extractedClaim) throw new Error("no extracted claim");
      return `"${d.data.extractedClaim}" -> ${d.data.structured.verdict}`;
    });
  } else {
    console.log("  [SKIP] image tests — could not generate fixture PNG");
  }

  await run("scraper syncOnce", async () => {
    let d;
    for (let attempt = 0; attempt < 5; attempt++) {
      const r = await fetch(`${BASE}/api/scrape?secret=test-secret`, { method: "POST" });
      d = await r.json();
      if (d.success && !d.data.skipped) break;
      await new Promise((r) => setTimeout(r, 4000));
    }
    if (!d.success) throw new Error(JSON.stringify(d));
    return `collected=${d.data.collected} stored=${d.data.stored}`;
  });

  child.kill();
  const passed = results.filter(Boolean).length;
  console.log(`\n  ${passed}/${results.length} passed`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
