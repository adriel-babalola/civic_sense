import assert from "node:assert/strict";
import {
  routeConversationalMessage,
  sanitizeReply,
  fallback,
  OFFTOPIC_REJECTION,
} from "../services/llmRouter.js";
import { routeMessage, OFFTOPIC_REDIRECT } from "../services/messageRouter.js";

async function testSanitizeReply() {
  assert.equal(sanitizeReply("Any reply", "off_topic"), OFFTOPIC_REJECTION);
  assert.equal(sanitizeReply("", "casual"), "");

  // Max 2 sentences enforced
  const multi = "Sentence one. Sentence two! Sentence three? Sentence four.";
  const capped = sanitizeReply(multi, "casual");
  const sentences = capped.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  assert.equal(sentences.length, 2);
  assert.equal(capped, "Sentence one. Sentence two!");
}

async function testFallback() {
  // Out of scope tasks
  const essay = fallback("write an essay on World War 2");
  assert.equal(essay.intent, "off_topic");
  assert.equal(essay.reply, OFFTOPIC_REJECTION);

  const code = fallback("write python code to sort list");
  assert.equal(code.intent, "off_topic");
  assert.equal(code.reply, OFFTOPIC_REJECTION);

  // Civic query
  const civic = fallback("Is the naira stronger than the dollar right now?");
  assert.equal(civic.intent, "fact_checking");

  // Casual query (Guardrail 1)
  const casual = fallback("What is your favorite color?");
  assert.equal(casual.intent, "casual");
  assert.ok(casual.reply && casual.reply.length > 5);

  const greeting = fallback("Hello");
  assert.equal(greeting.intent, "casual");
  assert.ok(greeting.reply && greeting.reply.length > 5);
}

async function testRouteMessageIntegration() {
  process.env.DEEPSEEK_API_KEY = "";
  process.env.OPENROUTER_API_KEY = "";

  // Out of scope rejection
  const essay = await routeMessage("write an essay on World War 2");
  assert.equal(essay.intent, "off_topic");
  assert.equal(essay.reply, OFFTOPIC_REDIRECT);
  assert.equal(essay.reply, OFFTOPIC_REJECTION);

  // Image input
  const image = await routeMessage("check this", { hasImage: true });
  assert.equal(image.intent, "fact-check");

  // Empty message
  const empty = await routeMessage("");
  assert.equal(empty.intent, "unclear");

  // Civic claim
  const claim = await routeMessage("Did Tinubu remove the fuel subsidy in Nigeria?");
  assert.equal(claim.intent, "fact-check");
}

async function main() {
  await testSanitizeReply();
  await testFallback();
  await testRouteMessageIntegration();
  console.log("LLM Router & Guardrails tests passed cleanly.");
}

await main();
