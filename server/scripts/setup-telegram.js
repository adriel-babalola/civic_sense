import dotenv from "dotenv";
dotenv.config();
import { setWebhook } from "../services/telegram.js";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/setup-telegram.js https://your-app.up.railway.app/webhook/telegram");
  process.exit(1);
}
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is not set in .env (get it from @BotFather)");
  process.exit(1);
}

const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const result = await setWebhook(url, secret);
console.log(JSON.stringify(result, null, 2));

if (result.ok) {
  console.log(`Webhook registered: ${url}`);
  if (secret) console.log("Using TELEGRAM_WEBHOOK_SECRET for request verification.");
} else {
  console.error(`Failed: ${result.description}`);
  process.exit(1);
}
