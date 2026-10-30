import assert from "node:assert/strict";
import { MENU, DROPDOWN_OPTIONS, routeMessage } from "../services/messageRouter.js";

process.env.GROQ_API_KEY = "";
process.env.OPENROUTER_API_KEY = "";

assert.equal((await routeMessage("yayy")).intent, "casual");
assert.equal((await routeMessage("hello")).reply, DROPDOWN_OPTIONS);
assert.equal((await routeMessage("help")).intent, "help");
assert.match((await routeMessage("1")).reply, /nightly news/i);
assert.match((await routeMessage("2")).reply, /political claim/i);
assert.match((await routeMessage("3")).reply, /image/i);
assert.match((await routeMessage("4")).reply, /non-partisan/i);
assert.match((await routeMessage("5")).reply, /data-deletion/);
assert.equal((await routeMessage("yo")).intent, "unclear");
assert.match((await routeMessage("yo")).reply, /Reply with a number/);

const claimRoute = await routeMessage("Did the president visit Lagos yesterday?");
assert.equal(claimRoute.intent, "fact-check");
assert.ok(claimRoute.searchQuery.length > 0);

assert.equal((await routeMessage("yayy", { hasImage: true })).intent, "fact-check");
assert.equal((await routeMessage("anything at all", { isFirstMessage: true })).intent, "casual");

const newsRoute = await routeMessage("latest news on fuel subsidy please");
assert.equal(newsRoute.intent, "news");

const greetingRoute = await routeMessage("good morning sir how far");
assert.equal(greetingRoute.intent, "casual");
assert.match(greetingRoute.reply, /Pull latest nightly news/);

assert.match(MENU, /Reply with a number/);

console.log("Message router tests passed.");
