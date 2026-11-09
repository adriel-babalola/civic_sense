import { searchKnowledgeBase } from "./gemini.js";
import { routeConversationalMessage } from "./llmRouter.js";

const REDIRECT_REPLY =
  "My sole purpose is Nigerian civic and political fact-checking, so please use another LLM for that request.";

function normalizeMessage(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function oneSentence(text) {
  const clean = String(text || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const m = clean.match(/.+?[.!?](?:\s|$)/);
  return (m ? m[0] : clean).trim().slice(0, 280);
}

function kbAnswer(query) {
  try {
    const matches = searchKnowledgeBase(query);
    const top = matches.find((m) => m.verdict && m.verdict !== "UNVERIFIED") || matches[0];
    if (!top) return null;
    return oneSentence(`${top.explanation} (Source: ${top.source}.)`);
  } catch {
    return null;
  }
}

export async function routeMessage(text, { hasImage = false, context = {} } = {}) {
  if (hasImage) return { intent: "fact-check", router: { source: "image" } };

  const normalized = normalizeMessage(text);
  if (!normalized) return { intent: "chat", reply: "Send a Nigerian civic or political claim you'd like me to fact-check." };

  const routed = await routeConversationalMessage(String(text).trim(), context);

  if (routed?.intent === "fact_check") {
    return { intent: "fact-check", searchQuery: routed.search_query || String(text).trim(), router: routed };
  }
  if (routed?.intent === "redirect") {
    return { intent: "redirect", reply: oneSentence(routed.reply) || REDIRECT_REPLY, router: routed };
  }
  if (routed?.intent === "civic_info") {
    if (routed.search_query) {
      const answer = kbAnswer(routed.search_query);
      if (answer) return { intent: "civic_info", reply: answer, router: routed };
    }
    return {
      intent: "civic_info",
      reply: oneSentence(routed.reply) || "Send the specific Nigerian civic or political claim you want me to fact-check.",
      router: routed,
    };
  }
  // hidden 5th skill: chat
  return {
    intent: "chat",
    reply: oneSentence(routed?.reply) || "Hi, I'm CivicSense; I can help fact-check Nigerian civic and political claims.",
    router: routed,
  };
}

export { REDIRECT_REPLY };
