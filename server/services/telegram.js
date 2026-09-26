import axios from "axios";

const API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || ""}`;
const TELEGRAM_TIMEOUT_MS = Number(process.env.TELEGRAM_TIMEOUT_MS) || 10000;

export function verifyTelegramSecret(secret) {
  if (!secret) return false;
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET || process.env.TELEGRAM_BOT_TOKEN;
  if (!expected) return false;
  return secret === expected;
}

export function extractMessage(update) {
  const msg = update?.message || update?.edited_message;
  if (!msg) return null;
  const chatId = msg.chat?.id;
  const text = (msg.text || msg.caption || "").trim();
  const photo = Array.isArray(msg.photo) ? msg.photo[msg.photo.length - 1] : null;
  const fileId = photo?.file_id || null;
  return { chatId, text, fileId };
}

export async function getFileUrl(fileId) {
  const response = await axios.get(`${API}/getFile`, {
    params: { file_id: fileId },
    timeout: TELEGRAM_TIMEOUT_MS,
  });
  const filePath = response.data?.result?.file_path;
  if (!filePath) throw new Error("Telegram getFile returned no file_path");
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
}

export async function sendChatAction(chatId, action = "typing") {
  try {
    await axios.post(`${API}/sendChatAction`, {
      chat_id: chatId,
      action,
    }, { timeout: 5000 });
  } catch (err) {
    console.error(`Telegram chat action failed: ${err.message}`);
  }
}

export async function sendMessage(chatId, text) {
  const response = await axios.post(
    `${API}/sendMessage`,
    { chat_id: chatId, text },
    { timeout: TELEGRAM_TIMEOUT_MS }
  );
  return response.data?.ok === true;
}

export async function setWebhook(url, secret) {
  const response = await axios.post(`${API}/setWebhook`, {
    url,
    allowed_updates: ["message"],
    ...(secret ? { secret_token: secret } : {}),
  }, { timeout: TELEGRAM_TIMEOUT_MS });
  return response.data;
}
