import assert from "node:assert/strict";
import {
  classifyIntent,
  validateRoute,
  heuristicRoute,
  buildMessages,
  parseJsonSafely,
  resetRouterState,
} from "../services/intentRouter.js";

process.env.GROQ_API_KEY = "test-groq-key";
process.env.OPENROUTER_API_KEY = "test-or-key";
process.env.ROUTER_MIN_CONFIDENCE = "0.55";

function reply(content) {
  return { data: { choices: [{ message: { content } }] } };
}

async function testValidate() {
  assert.deepEqual(
    validateRoute({ intent: "fact_checking", search_query: "  Tinubu   fuel subsidy  ", confidence: 0.9 }),
    { intent: "fact_checking", search_query: "Tinubu fuel subsidy", confidence: 0.9 }
  );
  assert.equal(validateRoute({ intent: "chat", search_query: "", confidence: 0.9 }), null);
  assert.equal(validateRoute(null), null);
  assert.equal(validateRoute("not an object"), null);
  assert.equal(validateRoute({ search_query: "x", confidence: 0.9 }), null);
  assert.equal(validateRoute({ intent: "news_update", confidence: "abc" }), null);
  assert.equal(validateRoute({ intent: "news_update", search_query: "x", confidence: "0.4" }).confidence, 0.4);
  assert.equal(validateRoute({ intent: "news_update", search_query: "x", confidence: 5 }).confidence, 1);
  assert.ok(validateRoute({ intent: "off_topic", search_query: "y".repeat(500), confidence: 0.5 }).search_query.length <= 120);
  assert.ok(parseJsonSafely('Sure! Here you go: {"intent":"off_topic","search_query":"","confidence":0.8} hope that helps'));
  assert.equal(parseJsonSafely("no json here"), null);
}

async function testHeuristic() {
  assert.equal(heuristicRoute("latest news on fuel subsidy").intent, "news_update");
  assert.equal(heuristicRoute("good morning sir how are you").intent, "general_query");
  const fc = heuristicRoute("Did the president visit Lagos yesterday?");
  assert.equal(fc.intent, "fact_checking");
  assert.equal(fc.source, "heuristic");
  assert.equal(fc.ambiguous, false);
  assert.equal(heuristicRoute("").intent, "general_query");
}

async function testPromptShape() {
  const msgs = buildMessages("test input");
  assert.equal(msgs[0].role, "system");
  assert.ok(msgs[0].content.includes("fact_checking"));
  assert.ok(msgs[0].content.includes("minified JSON"));
  assert.equal(msgs[msgs.length - 1].role, "user");
  assert.equal(msgs[msgs.length - 1].content, "test input");
  assert.equal(msgs.length, 1 + FEWSHOT_LEN * 2 + 1);
  for (const m of msgs) {
    if (m.role === "assistant") {
      assert.doesNotThrow(() => JSON.parse(m.content));
    }
  }
}
const FEWSHOT_LEN = 6;

async function testGroqSuccess() {
  resetRouterState();
  let calls = 0;
  const post = async (url) => {
    calls += 1;
    assert.ok(url.includes("groq"));
    return reply(
      JSON.stringify({
        intent: "fact_checking",
        search_query: "Wike removed as minister",
        confidence: 0.92,
      })
    );
  };
  const r = await classifyIntent("Is it true that Wike was removed as minister?", { post });
  assert.equal(r.intent, "fact_checking");
  assert.equal(r.search_query, "Wike removed as minister");
  assert.equal(r.source, "groq");
  assert.equal(r.ambiguous, false);
  assert.equal(calls, 1);

  const cached = await classifyIntent("Is it true that Wike was removed as minister?", { post });
  assert.equal(cached.source, "cache");
  assert.equal(cached.intent, "fact_checking");
  assert.equal(calls, 1);
}

async function testFallbackToOpenRouter() {
  resetRouterState();
  const post = async (url) => {
    if (url.includes("groq")) return reply("I believe the user wants a fact check!");
    return reply(
      JSON.stringify({ intent: "news_update", search_query: "ASUU strike update", confidence: 0.8 })
    );
  };
  const r = await classifyIntent("abeg bring the latest gist on ASUU", { post });
  assert.equal(r.intent, "news_update");
  assert.equal(r.source, "openrouter");
}

async function testLowConfidenceAmbiguous() {
  resetRouterState();
  const post = async () =>
    reply(JSON.stringify({ intent: "general_query", search_query: "", confidence: 0.3 }));
  const r = await classifyIntent("what about that thing we discussed", { post });
  assert.equal(r.ambiguous, true);
  assert.equal(r.source, "groq");
}

async function testBothProvidersFail() {
  resetRouterState();
  let calls = 0;
  const junkPost = async () => {
    calls += 1;
    return reply("Sorry, I cannot help with that request.");
  };
  const r = await classifyIntent("some random political claim about taxes in Nigeria", { post: junkPost });
  assert.equal(r.source, "heuristic");
  assert.equal(r.intent, "fact_checking");
  assert.ok(calls >= 2);
}

async function testCircuitBreaker() {
  resetRouterState();
  const junkPost = async () => reply("not json at all");
  for (let i = 0; i < 5; i++) {
    await classifyIntent(`heuristic breaker claim number ${i} about elections`, { post: junkPost });
  }
  let called = false;
  const boomPost = async () => {
    called = true;
    throw new Error("should not be called while breaker is open");
  };
  const r = await classifyIntent("fresh claim about the naira exchange rate in Nigeria", { post: boomPost });
  assert.equal(called, false);
  assert.equal(r.source, "heuristic");
  resetRouterState();
}

async function testEmptyInput() {
  resetRouterState();
  const r = await classifyIntent("   ");
  assert.equal(r.ambiguous, true);
  assert.equal(r.intent, "general_query");
}

async function main() {
  await testValidate();
  await testHeuristic();
  await testPromptShape();
  await testGroqSuccess();
  await testFallbackToOpenRouter();
  await testLowConfidenceAmbiguous();
  await testBothProvidersFail();
  await testCircuitBreaker();
  await testEmptyInput();
  console.log("Intent router tests passed.");
}

await main();
