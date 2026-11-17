/**
 * Unit tests for the two features built on top of the scraper and the router:
 *   1. State tagging of news (services/geo.js)
 *   2. The CIVIC tag on LLM responses (llmRouter.js / messageRouter.js)
 *
 * These run with the LLM keys cleared, which forces the deterministic fallback
 * router, so the CIVIC classification is asserted without a network call.
 */
import assert from "node:assert/strict";

import { detectStates, detectPrimaryState } from "../services/geo.js";
import { isCivicIntent } from "../services/llmRouter.js";
import { routeMessage } from "../services/messageRouter.js";

let passed = 0;
const cases = [];

function check(name, fn) {
  try {
    fn();
    passed += 1;
    cases.push(`  [PASS] ${name}`);
  } catch (err) {
    cases.push(`  [FAIL] ${name} — ${err.message}`);
    process.exitCode = 1;
  }
}

/* ── geo.js ─────────────────────────────────────────────────────────── */

check("detects a state named directly", () => {
  assert.deepEqual(detectStates("Bandits attack a school in Kaduna State"), ["Kaduna"]);
});

check("detects a state from a city alias", () => {
  assert.deepEqual(detectStates("Port Harcourt refinery resumes operations"), ["Rivers"]);
  assert.deepEqual(detectStates("Gunmen storm a market in Jos"), ["Plateau"]);
});

check("maps Abuja to the capital territory", () => {
  assert.deepEqual(detectStates("President arrives in Abuja for talks"), ["FCT"]);
});

check("returns every state named, in order", () => {
  assert.deepEqual(detectStates("Flood displaces residents in Benue and Kogi"), ["Benue", "Kogi"]);
});

check("does not match a state inside another word", () => {
  // "Niger" must not match "Nigeria"; "Kano" must not match "Kanoon".
  assert.deepEqual(detectStates("Nigeria wins the Africa Cup of Nations"), []);
});

check("does not treat Niger Republic as Niger State", () => {
  assert.deepEqual(detectStates("Niger Republic junta holds talks in Niamey"), []);
  assert.deepEqual(detectStates("Miners killed in Niger State"), ["Niger"]);
});

check("takes the first named state as the primary", () => {
  assert.equal(detectPrimaryState("A clash on the Lagos and Ogun border"), "Lagos");
  assert.equal(detectPrimaryState("Nothing located here"), null);
});

/* ── CIVIC tag ───────────────────────────────────────────────────────── */

check("derives civic from intent", () => {
  assert.equal(isCivicIntent("fact_check"), true);
  assert.equal(isCivicIntent("civic_info"), true);
  assert.equal(isCivicIntent("chat"), false);
  assert.equal(isCivicIntent("redirect"), false);
});

const main = async () => {
  // Force the fallback router so this is offline and deterministic.
  process.env.DEEPSEEK_API_KEY = "";
  process.env.OPENROUTER_API_KEY = "";

  const civicClaim = await routeMessage("Did Tinubu remove the fuel subsidy in Nigeria?");
  check("a Nigerian political claim is civic", () => {
    assert.equal(civicClaim.civic, true);
  });

  const offTopic = await routeMessage("write an essay on the history of Rome");
  check("an essay request is not civic", () => {
    assert.equal(offTopic.civic, false);
  });

  const generalKnowledge = await routeMessage("did Artemis II really go to the moon");
  check("a non-Nigerian general fact-check is not civic", () => {
    assert.equal(generalKnowledge.civic, false);
  });

  const greeting = await routeMessage("hello there");
  check("small talk is not civic", () => {
    assert.equal(greeting.civic, false);
  });

  const image = await routeMessage("check this", { hasImage: true });
  check("an image request is always civic", () => {
    assert.equal(image.civic, true);
    assert.equal(image.intent, "fact-check");
  });

  console.log(cases.join("\n"));
  console.log(`\n  ${passed}/${cases.length} feature tests passed`);
};

await main();
