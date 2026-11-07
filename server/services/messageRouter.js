import { searchKnowledgeBase } from "./gemini.js";
import { routeConversationalMessage } from "./llmRouter.js";

const OFFTOPIC_REDIRECT =
  "Please use another chatbot for that request; CivicSense is focused on Nigerian civic and political fact-checking.";

function normalizeMessage(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function kbAnswer(query) {
  try {
    const matches = searchKnowledgeBase(query);
    const top = matches.find((m) => m.verdict && m.verdict !== "UNVERIFIED") || matches[0];
    if (!top) return null;
    return `${top.explanation}\n\nSource: ${top.source}`;
  } catch {
    return null;
  }
}

export async function routeMessage(text, { hasImage = false, context = {} } = {}) {
  if (hasImage) return { intent: "fact-check", router: { source: "image" } };

  const normalized = normalizeMessage(text);
  if (!normalized) return { intent: "unclear", reply: "Send a Nigerian civic or political claim to fact-check." };

  const routed = await routeConversationalMessage(String(text).trim(), context);
  if (routed?.intent === "fact_checking") {
    return { intent: "fact-check", searchQuery: routed.search_query || "", router: routed };
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
  if (routed?.search_query) {
    const answer = kbAnswer(routed.search_query);
    if (answer) return { intent: "casual", reply: answer, router: routed };
  }
  return {
    intent: "casual",
    reply: routed?.reply || "I can help fact-check Nigerian civic or political claims. Send the claim you want checked.",
    router: routed,
  };
}

export { OFFTOPIC_REDIRECT };
