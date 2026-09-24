import crypto from "crypto";
import axios from "axios";
import { validateImageBuffer, bufferToDataUrl } from "./image.js";

const GRAPH_URL = "https://graph.facebook.com/v21.0";
const META_TIMEOUT_MS = Number(process.env.META_TIMEOUT_MS) || 15000;
const MAX_BYTES = (Number(process.env.META_MEDIA_MAX_MB) || 5) * 1024 * 1024;

export function handleVerification(req) {
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!expected) return null;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === expected && challenge) {
    return challenge;
  }
  return null;
}

export function verifySignature(req) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) throw new Error("META_APP_SECRET is not set");
  const provided = (req.get("X-Hub-Signature-256") || "").replace(/^sha256=/, "");
  const computed = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody || Buffer.alloc(0))
    .digest("hex");
  if (
    provided.length !== computed.length ||
    !crypto.timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(computed, "hex"))
  ) {
    throw new Error("Signature mismatch");
  }
}

export function extractMessage(update) {
  for (const entry of update?.entry || []) {
    for (const change of entry.changes || []) {
      const value = change?.value || {};
      const messages = Array.isArray(value.messages) ? value.messages : [];
      for (const msg of messages) {
        const from = msg?.from || value.contacts?.[0]?.wa_id || null;
        if (!from) continue;
        const type = msg?.type;
        const text = String(msg?.text?.body || "").trim();
        const imageId = type === "image" ? msg?.image?.id : null;
        const caption = type === "image" ? String(msg?.image?.caption || "").trim() : "";
        return { from, type, text, imageId, caption, messageId: msg?.id || "" };
      }
    }
  }
  return null;
}

export async function sendTextMessage(to, body) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  if (!token) throw new Error("META_WHATSAPP_TOKEN is not set");
  if (!phoneNumberId) throw new Error("META_WHATSAPP_PHONE_NUMBER_ID is not set");
  const response = await axios.post(
    `${GRAPH_URL}/${phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body, preview_url: false },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: META_TIMEOUT_MS,
    }
  );
  return response.data;
}

export async function downloadMedia(mediaId) {
  const token = process.env.META_WHATSAPP_TOKEN;
  if (!token) throw new Error("META_WHATSAPP_TOKEN is not set");
  const media = await axios.get(`${GRAPH_URL}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: META_TIMEOUT_MS,
  });
  const url = media.data?.url;
  if (!url) throw new Error("Meta media response has no download URL");
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { Authorization: `Bearer ${token}` },
    timeout: META_TIMEOUT_MS,
    maxContentLength: MAX_BYTES,
  });
  const buffer = Buffer.from(response.data);
  const mime = validateImageBuffer(buffer);
  return { dataUrl: bufferToDataUrl(buffer, mime), mime, bytes: buffer.length };
}