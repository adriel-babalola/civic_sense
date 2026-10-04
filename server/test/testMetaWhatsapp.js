import assert from "assert/strict";
import crypto from "crypto";
import {
  extractMessage,
  handleVerification,
  verifySignature,
} from "../services/metaWhatsapp.js";

process.env.META_WEBHOOK_VERIFY_TOKEN = "test-verify-token";
process.env.META_APP_SECRET = "test-app-secret";

const verificationRequest = {
  query: {
    "hub.mode": "subscribe",
    "hub.verify_token": "test-verify-token",
    "hub.challenge": "challenge-123",
  },
};
assert.equal(handleVerification(verificationRequest), "challenge-123");
assert.equal(
  handleVerification({ query: { ...verificationRequest.query, "hub.verify_token": "wrong" } }),
  null
);

const payload = JSON.stringify({
  entry: [{ changes: [{ value: { messages: [{
    from: "2348000000000",
    id: "wamid.test",
    type: "text",
    text: { body: "A claim" },
  }] } }] }],
});
const signature = crypto.createHmac("sha256", process.env.META_APP_SECRET).update(payload).digest("hex");
const signedRequest = {
  rawBody: Buffer.from(payload),
  get: (header) => header === "X-Hub-Signature-256" ? `sha256=${signature}` : "",
};
assert.doesNotThrow(() => verifySignature(signedRequest));
assert.throws(() => verifySignature({ ...signedRequest, rawBody: Buffer.from(`${payload}x`) }));

assert.deepEqual(extractMessage(JSON.parse(payload)), {
  from: "2348000000000",
  type: "text",
  text: "A claim",
  imageId: null,
  caption: "",
  messageId: "wamid.test",
});

console.log("Meta WhatsApp adapter tests passed.");