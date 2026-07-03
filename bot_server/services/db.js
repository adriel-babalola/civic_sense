import mongoose from "mongoose";

const factCheckSchema = new mongoose.Schema({
  claim: String,
  verdict: String,
  channel: { type: String, default: "test" },
  timestamp: { type: Date, default: Date.now },
  hashedFrom: String,
});

const FactCheck = mongoose.model("FactCheck", factCheckSchema);

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  }
}

export async function saveFactCheck(data) {
  try {
    await connectDB();
    return await FactCheck.create(data);
  } catch (err) {
    console.error(`DB save error: ${err.message}`);
    return null;
  }
}

export async function getRecentFactChecks(limit = 20) {
  try {
    await connectDB();
    return await FactCheck.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    console.error(`DB read error: ${err.message}`);
    return [];
  }
}

const reportSchema = new mongoose.Schema({
  type: { type: String, enum: ["violence", "misconduct", "unrest"], required: true },
  description: { type: String, required: true },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  evidence: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  timestamp: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

export async function saveReport(data) {
  try {
    await connectDB();
    return await Report.create(data);
  } catch (err) {
    console.error(`Report save error: ${err.message}`);
    return null;
  }
}

export async function getReports(status = null) {
  try {
    await connectDB();
    const query = status ? { status } : {};
    return await Report.find(query).sort({ timestamp: -1 }).lean();
  } catch (err) {
    console.error(`Report read error: ${err.message}`);
    return [];
  }
}

export async function updateReportStatus(id, status) {
  try {
    await connectDB();
    return await Report.findByIdAndUpdate(id, { status }, { new: true }).lean();
  } catch (err) {
    console.error(`Report update error: ${err.message}`);
    return null;
  }
}
