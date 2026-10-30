import { classifyIntent, STATIC_REPLIES } from "./intentRouter.js";
import { searchKnowledgeBase } from "./gemini.js";

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
    return `${top.explanation}\n\nSource: ${top.source}\n\n${STATIC_REPLIES.closer}`;
  } catch {
    return null;
  }
}

function mapIntent(route) {
  if (!route || route.ambiguous) {
    return { intent: "unclear", reply: STATIC_REPLIES.clarify, router: route };
  }
  if (route.intent === "news_update") return { intent: "news", router: route };
  if (route.intent === "fact_checking") {
    return { intent: "fact-check", searchQuery: route.search_query, router: route };
  }
  if (route.intent === "off_topic") {
    return {
      intent: "unclear",
      reply: route.reply || STATIC_REPLIES.offTopic,
      router: route,
    };
  }
  if (route.search_query) {
    const answer = kbAnswer(route.search_query);
    if (answer) return { intent: "casual", reply: answer, router: route };
  }
  return {
    intent: "casual",
    reply: route.reply || STATIC_REPLIES.greeting,
    router: route,
  };
}

export async function routeMessage(text, { hasImage = false } = {}) {
  if (hasImage) return { intent: "fact-check" };

  const normalized = normalizeMessage(text);
  if (!normalized) return { intent: "unclear", reply: STATIC_REPLIES.clarify };

  let route = null;
  try {
    route = await classifyIntent(String(text).trim());
  } catch (err) {
    console.error(`[Router] classifyIntent threw: ${err.message}`);
  }
  return mapIntent(route);
}

export { STATIC_REPLIES };
