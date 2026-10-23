import assert from "node:assert/strict";
import { MENU, DROPDOWN_OPTIONS, routeMessage } from "../services/messageRouter.js";

assert.equal(routeMessage("yayy").intent, "casual");
assert.equal(routeMessage("hello").reply, DROPDOWN_OPTIONS);
assert.equal(routeMessage("help").intent, "help");
assert.match(routeMessage("1").reply, /political claim/i);
assert.match(routeMessage("2").reply, /image/i);
assert.match(routeMessage("3").reply, /sources/i);
assert.match(routeMessage("4").reply, /data-deletion/);
assert.equal(routeMessage("yo").intent, "unclear");
assert.match(routeMessage("yo").reply, /Reply with a number/);
assert.equal(routeMessage("Did the president visit Lagos yesterday?").intent, "fact-check");
assert.equal(routeMessage("yayy", { hasImage: true }).intent, "fact-check");

console.log("Message router tests passed.");