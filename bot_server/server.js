import express from "express";
import twilio from "twilio";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { searchClaim } from "./services/search.js";
import { factCheck } from "./services/gemini.js";
import { saveFactCheck, getRecentFactChecks, saveReport, getReports, updateReportStatus } from "./services/db.js";

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
