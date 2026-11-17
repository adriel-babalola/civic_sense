import { searchKnowledgeBase } from "./gemini.js";
import { routeConversationalMessage, isCivicIntent } from "./llmRouter.js";

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
  // An image is always treated as a Nigerian civic fact-check, so it is civic.
  if (hasImage) return { intent: "fact-check", civic: true, router: { source: "image" } };

  const normalized = normalizeMessage(text);
  if (!normalized) return { intent: "chat", civic: false, reply: "Send a Nigerian civic or political claim you'd like me to fact-check." };

  const routed = await routeConversationalMessage(String(text).trim(), context);
  // The CIVIC tag travels with the route. Prefer the model's flag; fall back to
  // the intent so a missing field can never publish off-topic chatter.
  const civic = typeof routed?.civic === "boolean" ? routed.civic : isCivicIntent(routed?.intent);

  if (routed?.intent === "fact_check") {
    return { intent: "fact-check", civic, searchQuery: routed.search_query || String(text).trim(), router: routed };
  }
  if (routed?.intent === "redirect") {
    const base = oneSentence(routed.reply) || REDIRECT_REPLY;
    const reply = /another llm|other llm/i.test(base) ? base : REDIRECT_REPLY;
    return { intent: "redirect", civic, reply, router: routed };
  }
  if (routed?.intent === "civic_info") {
    if (routed.search_query) {
      const answer = kbAnswer(routed.search_query);
      if (answer) return { intent: "civic_info", civic, reply: answer, router: routed };
    }
    return {
      intent: "civic_info",
      civic,
      reply: oneSentence(routed.reply) || "Send the specific Nigerian civic or political claim you want me to fact-check.",
      router: routed,
    };
  }
  // hidden 5th skill: chat
  return {
    intent: "chat",
    civic,
    reply: oneSentence(routed?.reply) || "Hi, I'm CivicSense; I can help fact-check Nigerian civic and political claims.",
    router: routed,
  };
}

export { REDIRECT_REPLY };
