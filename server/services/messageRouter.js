const MENU = [
  "CivicSense can help you check political information.",
  "\nReply with a number:",
  "1. Fact-check a claim",
  "2. Check an image",
  "3. How CivicSense works",
  "4. Privacy and data deletion",
].join("\n");

const DROPDOWN_OPTIONS = [
  "📰 Pull latest nightly news",
  "🔍 Fact-check a claim",
  "📸 Check an image",
  "ℹ️ How CivicSense works",
  "🔒 Privacy and data deletion",
].join("\n");

const CASUAL_MESSAGES = new Map([
  ["hi", DROPDOWN_OPTIONS],
  ["hello", DROPDOWN_OPTIONS],
  ["hey", DROPDOWN_OPTIONS],
  ["yayy", `Yayy!\n\n${DROPDOWN_OPTIONS}`],
  ["thanks", `You are welcome!\n\n${DROPDOWN_OPTIONS}`],
  ["thank you", `You are welcome!\n\n${DROPDOWN_OPTIONS}`],
]);

const HELP_MESSAGES = new Set([
  "help",
  "what can you do",
  "menu",
]);

const MENU_REPLIES = new Map([
  ["1", "Send me the political claim you want me to fact-check."],
  ["2", "Send me the screenshot or image you want me to check."],
  ["3", "CivicSense is a non-partisan fact-checking bot that verifies political claims by searching multiple sources, comparing evidence, and returning a sourced verdict. I do not collect your name or require an account. Reply '1' to fact-check a claim, or send me a claim or image to get started."],
  ["4", "Privacy policy: https://civicsense.fyi/privacy\nData deletion: https://civicsense.fyi/data-deletion"],
  ["5", "Pull latest nightly news"],
]);

function normalizeMessage(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function routeMessage(text, { hasImage = false, isFirstMessage = false } = {}) {
  if (hasImage) return { intent: "fact-check" };

  if (isFirstMessage) {
    return { intent: "casual", reply: DROPDOWN_OPTIONS };
  }

  const normalized = normalizeMessage(text);
  if (!normalized) return { intent: "unclear" };

  const menuReply = MENU_REPLIES.get(normalized);
  if (menuReply) return { intent: "menu-option", reply: menuReply };

  const casualReply = CASUAL_MESSAGES.get(normalized);
  if (casualReply) return { intent: "casual", reply: casualReply };

  if (HELP_MESSAGES.has(normalized)) {
    return { intent: "help", reply: MENU };
  }

  if (normalized.length < 4) {
    return {
      intent: "unclear",
      reply: `I did not quite understand that.\n\n${MENU}`,
    };
  }

  return { intent: "fact-check" };
}

export { MENU, DROPDOWN_OPTIONS };

