import { routeConversationalMessage, OFFTOPIC_REJECTION } from "./llmRouter.js";

const OFFTOPIC_REDIRECT = OFFTOPIC_REJECTION;

function normalizeMessage(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export async function routeMessage(text, { hasImage = false, context = {} } = {}) {
  if (hasImage) return { intent: "fact-check", router: { source: "image" } };

  const normalized = normalizeMessage(text);
  if (!normalized) return { intent: "unclear", reply: "Send a Nigerian civic or political claim to fact-check." };

  const routed = await routeConversationalMessage(String(text).trim(), context);
  if (routed?.intent === "fact_checking") {
    return { intent: "fact-check", searchQuery: routed.search_query || text, router: routed };
  }
  if (routed?.intent === "off_topic") {
    const repeat = Boolean(context?.lastIntent === "off_topic");
    return {
      intent: "off_topic",
      reply: repeat ? OFFTOPIC_REDIRECT : (routed.reply || OFFTOPIC_REDIRECT),
      router: routed,
      repeat,
    };
  }
  return {
    intent: "casual",
    reply: routed?.reply || "I can help fact-check Nigerian civic or political claims. Send the claim you want checked.",
    router: routed,
  };
}

export { OFFTOPIC_REDIRECT };
