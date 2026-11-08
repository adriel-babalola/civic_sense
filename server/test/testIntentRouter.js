import assert from "node:assert/strict";
import {
  classifyIntent,
  validateRoute,
  heuristicRoute,
  buildMessages,
  parseJsonSafely,
  resetRouterState,
  STATIC_REPLIES,
} from "../services/intentRouter.js";

process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
process.env.GROQ_API_KEY = "test-groq-key";
process.env.OPENROUTER_API_KEY = "test-or-key";
process.env.ROUTER_MIN_CONFIDENCE = "0.55";
delete process.env.ROUTER_STATIC_REPLIES;

const FEWSHOT_LEN = 10;

function reply(content) {
  return { data: { choices: [{ message: { content } }] } };
}

async function testValidate() {
  assert.deepEqual(
    validateRoute({ intent: "fact_checking", search_query: "  Tinubu   fuel subsidy  ", confidence: 0.9 }),
    { intent: "fact_checking", search_query: "Tinubu fuel subsidy", reply: "", confidence: 0.9 }
  );
  const withReply = validateRoute({
    intent: "general_query",
    search_query: "",
    reply: "  Hey there.\n\nHow can I help?  ",
    confidence: 0.9,
  });
  assert.equal(withReply.reply, "Hey there. How can I help?");
  assert.equal(
    validateRoute({ intent: "off_topic", search_query: "", reply: "x".repeat(900), confidence: 0.5 }).reply,
    STATIC_REPLIES.offTopic
  );
  assert.equal(validateRoute({ intent: "chat", search_query: "", confidence: 0.9 }), null);
  assert.equal(validateRoute(null), null);
  assert.equal(validateRoute("not an object"), null);
  assert.equal(validateRoute({ search_query: "x", confidence: 0.9 }), null);
  assert.equal(validateRoute({ intent: "news_update", confidence: "abc" }), null);
  assert.equal(validateRoute({ intent: "news_update", search_query: "x", confidence: "0.4" }).confidence, 0.4);
  assert.equal(validateRoute({ intent: "news_update", search_query: "x", confidence: 5 }).confidence, 1);
  assert.ok(parseJsonSafely('Sure! Here you go: {"intent":"off_topic","search_query":"","confidence":0.8} hope that helps'));
  assert.equal(parseJsonSafely("no json here"), null);
}

async function testHeuristic() {
  const news = heuristicRoute("latest news on fuel subsidy");
  assert.equal(news.intent, "news_update");
  assert.equal(news.reply, "");
  const greet = heuristicRoute("good morning sir how are you");
  assert.equal(greet.intent, "general_query");
  assert.equal(greet.reply, STATIC_REPLIES.greeting);
  const essay = heuristicRoute("write an essay on World War 2");
  assert.equal(essay.intent, "off_topic");
  assert.equal(essay.reply, STATIC_REPLIES.offTopic);
  const fc = heuristicRoute("Did the president visit Lagos yesterday?");
  assert.equal(fc.intent, "fact_checking");
  assert.equal(fc.source, "heuristic");
  assert.equal(fc.ambiguous, false);
  const empty = heuristicRoute("");
  assert.equal(empty.intent, "general_query");
  assert.equal(empty.reply, STATIC_REPLIES.clarify);
}

async function testPromptShapes() {
  const ai = buildMessages("test input");
  assert.equal(ai[0].role, "system");
  assert.ok(ai[0].content.includes("GUARDRAILS"));
  assert.ok(ai[0].content.includes('"reply":""'));
  assert.equal(ai[ai.length - 1].content, "test input");
  assert.equal(ai.length, 1 + FEWSHOT_LEN * 2 + 1);
  for (const m of ai) {
    if (m.role === "assistant") assert.doesNotThrow(() => JSON.parse(m.content));
  }

  const staticPrompt = buildMessages("test input", { withReply: false });
  assert.ok(!staticPrompt[0].content.includes("GUARDRAILS"));
  assert.ok(!staticPrompt[0].content.includes('"reply"'));
  assert.ok(staticPrompt[0].content.includes("You only classify"));
  for (const m of staticPrompt) {
    if (m.role === "assistant") {
      const parsed = JSON.parse(m.content);
      assert.equal(parsed.reply, undefined);
    }
  }
}

async function testStaticModeReplies() {
  resetRouterState();
  process.env.ROUTER_STATIC_REPLIES = "true";
  const post = async (url) => {
    assert.ok(url.includes("deepseek"));
    return reply(
      JSON.stringify({
        intent: "general_query",
        search_query: "",
        reply: "UNAPPROVED AI REPLY THAT MUST BE IGNORED",
        confidence: 0.97,
      })
    );
  };
  const r = await classifyIntent("hello there friend", { post });
  assert.equal(r.intent, "general_query");
  assert.equal(r.source, "deepseek");
  assert.equal(r.reply, STATIC_REPLIES.greeting);
  assert.notEqual(r.reply, "UNAPPROVED AI REPLY THAT MUST BE IGNORED");

  const thanks = await classifyIntent("appreciate you my brother", { post });
  assert.equal(thanks.reply, STATIC_REPLIES.thanks);
}

async function testAiReplyMode() {
  resetRouterState();
  process.env.ROUTER_STATIC_REPLIES = "false";
  try {
    const post = async () =>
      reply(
        JSON.stringify({
          intent: "general_query",
          search_query: "",
          reply: "Fresh AI-written greeting for you.",
          confidence: 0.97,
        })
      );
    const r = await classifyIntent("hey now", { post });
    assert.equal(r.reply, "Fresh AI-written greeting for you.");
    const cached = await classifyIntent("hey now", { post });
    assert.equal(cached.source, "cache");
    assert.equal(cached.reply, "Fresh AI-written greeting for you.");
  } finally {
    delete process.env.ROUTER_STATIC_REPLIES;
  }
}

async function testGuardrails() {
  resetRouterState();
  process.env.ROUTER_STATIC_REPLIES = "false";
  try {
    // Guardrail 1: Casual query gets 1-sentence response
    const casualPost = async () =>
      reply(
        JSON.stringify({
          intent: "general_query",
          search_query: "",
          reply: "I do not have a favorite color, but I am ready to help you fact-check Nigerian news.",
          confidence: 0.98,
        })
      );
    const casual = await classifyIntent("What is your favorite color?", { post: casualPost });
    assert.equal(casual.intent, "general_query");
    assert.equal(casual.reply, "I do not have a favorite color, but I am ready to help you fact-check Nigerian news.");

    // Guardrail 2: Out-of-scope query gets exact rejection notice
    const oosPost = async () =>
      reply(
        JSON.stringify({
          intent: "off_topic",
          search_query: "",
          reply: "Here is an essay about WW2...",
          confidence: 0.99,
        })
      );
    const oos = await classifyIntent("Write an essay on World War 2", { post: oosPost });
    assert.equal(oos.intent, "off_topic");
    assert.equal(oos.reply, STATIC_REPLIES.offTopic);

    // Guardrail 3: Length limit (never more than 2 sentences)
    const longPost = async () =>
      reply(
        JSON.stringify({
          intent: "general_query",
          search_query: "",
          reply: "First sentence here. Second sentence here. Third sentence must be cut off. Fourth sentence too.",
          confidence: 0.95,
        })
      );
    const longReply = await classifyIntent("tell me about yourself", { post: longPost });
    const sentences = longReply.reply.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
    assert.ok(sentences.length <= 2, "Reply exceeded 2 sentences");
    assert.equal(longReply.reply, "First sentence here. Second sentence here.");
  } finally {
    delete process.env.ROUTER_STATIC_REPLIES;
  }
}

async function testConfidenceTiers() {
  resetRouterState();
  process.env.ROUTER_STATIC_REPLIES = "true";
  const post = async () =>
    reply(JSON.stringify({ intent: "general_query", search_query: "", confidence: 0.3 }));
  const low = await classifyIntent("what about that thing we discussed", { post });
  assert.equal(low.ambiguous, true);
  assert.equal(low.reply, STATIC_REPLIES.greeting);

  const claimPost = async () =>
    reply(JSON.stringify({ intent: "fact_checking", search_query: "naira exchange rate", confidence: 0.3 }));
  const claim = await classifyIntent("is the naira stronger than the dollar right now", { post: claimPost });
  assert.equal(claim.ambiguous, false);
  assert.equal(claim.intent, "fact_checking");
}

async function testDigitGuard() {
  resetRouterState();
  const boom = async () => {
    throw new Error("digit guard must not call the LLM");
  };
  for (const d of ["1", "5", "*67#", "0803 111 2233"]) {
    const r = await classifyIntent(d, { post: boom });
    assert.equal(r.ambiguous, true, `digit guard failed for ${d}`);
    assert.equal(r.reply, STATIC_REPLIES.clarify);
  }
}

async function testFallbackChain() {
  resetRouterState();
  const post = async (url) => {
    if (url.includes("deepseek")) return reply("invalid json");
    if (url.includes("groq")) {
      return reply(
        JSON.stringify({ intent: "news_update", search_query: "ASUU strike update", confidence: 0.8 })
      );
    }
    return reply(
      JSON.stringify({ intent: "news_update", search_query: "fallback ASUU", confidence: 0.8 })
    );
  };
  const r = await classifyIntent("abeg bring the latest gist on ASUU", { post });
  assert.equal(r.intent, "news_update");
  assert.equal(r.source, "groq");
  assert.equal(r.reply, "");
}

async function testAllProvidersFail() {
  resetRouterState();
  let calls = 0;
  const junkPost = async () => {
    calls += 1;
    return reply("Sorry, I cannot help with that request.");
  };
  const r = await classifyIntent("some random political claim about taxes in Nigeria", { post: junkPost });
  assert.equal(r.source, "heuristic");
  assert.equal(r.intent, "fact_checking");
  assert.ok(calls >= 3);
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
  assert.equal(r.reply, STATIC_REPLIES.clarify);
}

async function main() {
  await testValidate();
  await testHeuristic();
  await testPromptShapes();
  await testStaticModeReplies();
  await testAiReplyMode();
  await testGuardrails();
  await testConfidenceTiers();
  await testDigitGuard();
  await testFallbackChain();
  await testAllProvidersFail();
  await testCircuitBreaker();
  await testEmptyInput();
  console.log("Intent router tests passed.");
}

await main();
