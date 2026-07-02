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
