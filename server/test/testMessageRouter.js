import assert from "node:assert/strict";
import { routeMessage, STATIC_REPLIES } from "../services/messageRouter.js";
import { resetRouterState } from "../services/intentRouter.js";

process.env.GROQ_API_KEY = "";
process.env.OPENROUTER_API_KEY = "";
delete process.env.ROUTER_STATIC_REPLIES;
resetRouterState();

const greet = await routeMessage("hello");
assert.equal(greet.intent, "casual");
assert.equal(greet.reply, STATIC_REPLIES.greeting);

const help = await routeMessage("help");
assert.equal(help.intent, "casual");
assert.equal(help.reply, STATIC_REPLIES.how);

const digit1 = await routeMessage("1");
assert.equal(digit1.intent, "unclear");
assert.equal(digit1.reply, STATIC_REPLIES.clarify);

const digit5 = await routeMessage("5");
assert.equal(digit5.intent, "unclear");
assert.equal(digit5.reply, STATIC_REPLIES.clarify);

const claim = await routeMessage("Did the president visit Lagos yesterday?");
assert.equal(claim.intent, "fact-check");
assert.ok(claim.searchQuery.length > 0);

const image = await routeMessage("yayy", { hasImage: true });
assert.equal(image.intent, "fact-check");

const news = await routeMessage("latest news on fuel subsidy please");
assert.equal(news.intent, "news");

const morning = await routeMessage("good morning sir how far");
assert.equal(morning.intent, "casual");
assert.equal(morning.reply, STATIC_REPLIES.greeting);

const empty = await routeMessage("");
assert.equal(empty.intent, "unclear");
assert.equal(empty.reply, STATIC_REPLIES.clarify);

const failOpen = await routeMessage("some random chatter that is not a greeting");
assert.equal(failOpen.intent, "fact-check");

console.log("Message router tests passed.");
