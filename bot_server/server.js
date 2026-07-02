import express from "express";
import twilio from "twilio";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { searchClaim } from "./services/search.js";
import { factCheck } from "./services/gemini.js";
import { saveFactCheck, getRecentFactChecks } from "./services/db.js";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Kratos — CivicSense fact-checking bot is running.");
});

app.get("/api/fact-checks", async (req, res) => {
  try {
    const checks = await getRecentFactChecks(50);
    res.json(checks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/factchecks", async (req, res) => {
  try {
    const checks = await getRecentFactChecks(20);
    res.json({ success: true, data: checks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  const { claim } = req.body;
  if (!claim || !claim.trim()) {
    return res.status(400).json({ success: false, error: "No claim provided" });
  }
  try {
    const searchResults = await searchClaim(claim);
    const verdict = await factCheck(claim, searchResults);
    await saveFactCheck({
      claim,
      verdict,
      channel: "dashboard",
      timestamp: new Date(),
    }).catch((err) => console.error("DB save error:", err.message));
    res.json({ success: true, data: { claim, verdict } });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/webhook", async (req, res) => {
  const message = req.body.Body?.trim();
  const from = req.body.From;

  if (!message) {
    return res.status(400).send("No message");
  }

  console.log(`Incoming from ${from}: "${message}"`);

  try {
    const searchResults = await searchClaim(message);
    const verdict = await factCheck(message, searchResults);

    await saveFactCheck({
      claim: message,
      verdict,
      channel: "whatsapp",
      hashedFrom: from,
      timestamp: new Date(),
    }).catch((err) => console.error("DB save error:", err.message));

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(verdict);
    res.type("text/xml");
    res.send(twiml.toString());
  } catch (err) {
    console.error("Webhook error:", err);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(
      "Sorry, I couldn't process that claim. Please try again."
    );
    res.type("text/xml");
    res.send(twiml.toString());
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
