import express from "express";
import twilio from "twilio";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";
import multer from "multer";
dotenv.config();

import { runFactCheck } from "./services/pipeline.js";
import {
  connectDB,
  saveFactCheck,
  getRecentFactChecks,
  saveReport,
  getReports,
  updateReportStatus,
  isDbConnected,
  countArticles,
} from "./services/db.js";
import { startScraper, getScraperStats, syncOnce } from "./services/scraper.js";
import { validateImageBuffer, bufferToDataUrl, imageFromUrl } from "./services/image.js";
import {
  verifyTelegramSecret,
  extractMessage,
  getFileUrl,
  sendChatAction,
  sendMessage,
} from "./services/telegram.js";
import { NEWS_SOURCES } from "./services/newsSources.js";

const app = express();
app.use(compression());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

const MEDIA_MAX_MB = Number(process.env.MEDIA_MAX_MB) || 5;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MEDIA_MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP and GIF images are supported"));
    }
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
});
app.use("/api/factcheck", apiLimiter);
app.use("/api/chat", apiLimiter);

app.get("/", (req, res) => {
  res.send("Kratos — CivicSense fact-checking bot is running.");
});

app.get("/api/health", async (req, res) => {
  await connectDB();
  res.json({
    success: true,
    uptime: process.uptime(),
    db: isDbConnected(),
    articles: await countArticles(),
    scraper: getScraperStats(),
  });
});

app.post("/api/scrape", async (req, res) => {
  if (req.query.secret !== process.env.SCRAPE_SECRET) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    const result = await syncOnce();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/factchecks", async (req, res) => {
  try {
    const checks = await getRecentFactChecks(50);
    res.json({ success: true, data: checks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function parseImagePayload(req) {
  if (req.file && req.file.buffer) {
    const mime = validateImageBuffer(req.file.buffer);
    return { imageDataUrl: bufferToDataUrl(req.file.buffer, mime), caption: req.body?.caption || "" };
  }
  const { imageBase64, imageUrl } = req.body || {};
  if (imageBase64) {
    const buffer = Buffer.from(imageBase64, "base64");
    const mime = validateImageBuffer(buffer);
    return { imageDataUrl: bufferToDataUrl(buffer, mime), caption: req.body?.caption || "" };
  }
  if (imageUrl) {
    return { imageDataUrl: null, caption: req.body?.caption || "", imageUrl };
  }
  return null;
}

async function handleFactCheck(req, res) {
  try {
    const claim = (req.body?.claim || req.query?.claim || "").toString().trim();
    const caption = (req.body?.caption || "").toString().trim();

    let parsed = null;
    try {
      parsed = parseImagePayload(req);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    let imageDataUrl = parsed?.imageDataUrl || null;
    if (parsed?.imageUrl) {
      const remote = await imageFromUrl(parsed.imageUrl);
      if (remote) imageDataUrl = remote.dataUrl;
    }

    if (!claim && !imageDataUrl) {
      return res.status(400).json({ success: false, error: "Provide a claim and/or an image" });
    }

    const result = await runFactCheck({ claim, imageDataUrl, caption });

    await saveFactCheck({
      claim: result.claim || claim,
      verdict: result.verdict,
      channel: "api",
      timestamp: new Date(),
    }).catch((err) => console.error("DB save error:", err.message));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Fact-check error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

app.post("/api/factcheck", upload.single("image"), handleFactCheck);

app.post("/api/chat", async (req, res) => {
  const { claim } = req.body;
  if (!claim || !claim.trim()) {
    return res.status(400).json({ success: false, error: "No claim provided" });
  }
  try {
    const result = await runFactCheck({ claim: claim.trim() });
    await saveFactCheck({
      claim,
      verdict: result.verdict,
      channel: "dashboard",
      timestamp: new Date(),
    }).catch((err) => console.error("DB save error:", err.message));
    res.json({ success: true, data: { claim, verdict: result.verdict } });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Twilio enforces a hard 15-second timeout on webhook responses.
// The pipeline (Tavily + LLM) can take 10-25s. We use a race pattern:
// respond with TwiML within 14s, or send a "still working" message if we time out.
const WEBHOOK_DEADLINE_MS = Number(process.env.WEBHOOK_DEADLINE_MS) || 13000;

app.post("/webhook", async (req, res) => {
  const message = (req.body.Body || "").trim();
  const from = req.body.From;
  const to = req.body.To;
  const numMedia = parseInt(req.body.NumMedia || "0", 10);
  const mediaUrl = numMedia > 0 ? req.body.MediaUrl0 : null;

  if (!message && !mediaUrl) {
    return res.status(400).send("No message");
  }

  console.log(`Incoming from ${from}: "${message}" media=${numMedia}`);

  const respond = (text) => {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(text);
    res.type("text/xml");
    res.send(twiml.toString());
  };

  try {
    let imageDataUrl = null;
    if (mediaUrl) {
      const remote = await imageFromUrl(mediaUrl);
      if (remote) imageDataUrl = remote.dataUrl;
    }

    // Race: fact-check vs deadline timeout
    const factCheckPromise = runFactCheck({ claim: message, imageDataUrl, caption: message });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("WEBHOOK_TIMEOUT")), WEBHOOK_DEADLINE_MS)
    );

    const result = await Promise.race([factCheckPromise, timeoutPromise]);

    await saveFactCheck({
      claim: result.claim || message,
      verdict: result.verdict,
      channel: "whatsapp",
      hashedFrom: from,
      timestamp: new Date(),
    }).catch((err) => console.error("DB save error:", err.message));

    console.log(`[WhatsApp] Replying to ${from} within deadline`);
    respond(result.verdict);
  } catch (err) {
    if (err.message === "WEBHOOK_TIMEOUT") {
      console.warn(`[WhatsApp] Pipeline exceeded ${WEBHOOK_DEADLINE_MS}ms for ${from}, sending fallback`);
      respond(
        "⏳ Your claim is being checked. This is taking longer than usual — " +
        "please resend your message in 30 seconds to get the cached result."
      );
    } else {
      console.error("Webhook error:", err);
      respond("Sorry, I couldn't process that. Please try again with a text claim.");
    }
  }
});

app.post("/webhook/telegram", async (req, res) => {
  if (!verifyTelegramSecret(req.get("X-Telegram-Bot-Api-Secret-Token"))) {
    return res.status(401).send("Unauthorized");
  }

  const update = req.body;
  const message = extractMessage(update);
  if (!message || !message.chatId) {
    return res.send("ok");
  }

  console.log(`Telegram from ${message.chatId}: "${message.text}" fileId=${message.fileId || "none"}`);

  res.send("ok");
  if (!message.text && !message.fileId) return;

  try {
    sendChatAction(message.chatId, "typing");

    let imageDataUrl = null;
    if (message.fileId) {
      const fileUrl = await getFileUrl(message.fileId);
      const remote = await imageFromUrl(fileUrl);
      if (remote) imageDataUrl = remote.dataUrl;
    }

    const result = await runFactCheck({ claim: message.text, imageDataUrl, caption: message.text });

    await saveFactCheck({
      claim: result.claim || message.text,
      verdict: result.verdict,
      channel: "telegram",
      hashedFrom: String(message.chatId),
      timestamp: new Date(),
    }).catch((err) => console.error("DB save error:", err.message));

    await sendMessage(message.chatId, result.verdict);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    await sendMessage(message.chatId, "Sorry, I couldn't process that. Please try again with a text claim.");
  }
});

const SEED_INCIDENTS = [
  { type: "violence", description: "APC primary election clash in Igabi LGA, Kaduna State. Party supporters engaged in a violent fight at the venue, disrupting the primaries.", state: "Kaduna", lga: "Igabi", timestamp: new Date("2026-05-16") },
  { type: "unrest", description: "Police station attacked and set ablaze in Isan-Ekiti, Oye LGA. One killed hours before the Ekiti governorship election.", state: "Ekiti", lga: "Oye", timestamp: new Date("2026-06-19") },
  { type: "violence", description: "Political thugs killed three people near Government House in Kano after the deputy governor's swearing-in ceremony.", state: "Kano", lga: "Nasarawa", timestamp: new Date("2026-05-06") },
  { type: "violence", description: "Boko Haram JAS faction resurgence in Borno State. Deadly attacks in the epicenter of the insurgency signal escalating violence.", state: "Borno", lga: "Maiduguri", timestamp: new Date("2026-01-15") },
  { type: "unrest", description: "CSO raises alarm over rising pre-election violence in Osun State ahead of the 2027 general elections.", state: "Osun", lga: "Osogbo", timestamp: new Date("2026-06-25") },
  { type: "misconduct", description: "By-election marred by violence and voter intimidation in Enugu State. Party agent assaulted by thugs at polling unit.", state: "Enugu", lga: "Nsukka", timestamp: new Date("2026-06-20") },
  { type: "misconduct", description: "Low voter turnout and apathy during Zuru State Constituency by-election in Kebbi State.", state: "Kebbi", lga: "Zuru", timestamp: new Date("2026-06-20") },
  { type: "misconduct", description: "BVAS malfunction and delayed election materials during Nasarawa Central Senatorial by-election.", state: "Nasarawa", lga: "Nasarawa Eggon", timestamp: new Date("2026-06-20") },
  { type: "unrest", description: "NDC boycotts Dawakin Kudu/Warawa Federal Constituency by-election in Kano State citing security concerns and attacks on members.", state: "Kano", lga: "Dawakin Kudu", timestamp: new Date("2026-06-20") },
  { type: "violence", description: "Bandit expansion into Kwara and Kano states. 4654 casualties recorded nationwide in 2025 driven by terrorism, banditry and communal violence.", state: "Kwara", lga: "Ilorin", timestamp: new Date("2026-02-12") },
];

app.post("/api/reports", async (req, res) => {
  const { type, description, state, lga, evidence } = req.body;
  if (!type || !description || !state || !lga) {
    return res.status(400).json({ success: false, error: "Missing required fields: type, description, state, lga" });
  }
  try {
    const report = await saveReport({ type, description, state, lga, evidence });
    if (!report) throw new Error("Failed to save report");
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const reports = await getReports(req.query.status || null);
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch("/api/reports/:id/approve", async (req, res) => {
  try {
    const report = await updateReportStatus(req.params.id, "approved");
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch("/api/reports/:id/reject", async (req, res) => {
  try {
    const report = await updateReportStatus(req.params.id, "rejected");
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/incidents", async (req, res) => {
  try {
    const approved = await getReports("approved");
    const combined = [...SEED_INCIDENTS, ...approved.map((r) => ({
      type: r.type,
      description: r.description,
      state: r.state,
      lga: r.lga,
      evidence: r.evidence || null,
      timestamp: r.timestamp,
    }))];
    combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, data: combined });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/sources", (req, res) => {
  res.json({ success: true, data: NEWS_SOURCES });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("image")) {
    return res.status(400).json({ success: false, error: err.message });
  }
  console.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScraper();
});

async function shutdown(signal) {
  console.log(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    const { default: mongoose } = await import("mongoose");
    await mongoose.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
