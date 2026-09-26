import mongoose from "mongoose";

const factCheckSchema = new mongoose.Schema(
  {
    claim: { type: String },
    verdict: String,
    channel: { type: String, default: "test" },
    timestamp: { type: Date, default: Date.now },
    hashedFrom: String,
  },
  { autoIndex: true }
);
factCheckSchema.index({ timestamp: -1 });
factCheckSchema.index({ claim: "text" });

const FactCheck = mongoose.model("FactCheck", factCheckSchema);

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, unique: true },
    snippet: String,
    content: String,
    imageUrl: String,
    source: String,
    sourceBase: String,
    category: { type: String, default: "news" },
    region: String,
    pubDate: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { autoIndex: true }
);
articleSchema.index({ title: "text", snippet: "text", content: "text", source: "text" });
articleSchema.index({ pubDate: -1 });
articleSchema.index({ createdAt: 1 }, { expireAfterSeconds: (Number(process.env.ARTICLE_TTL_DAYS) || 14) * 86400 });

const Article = mongoose.model("Article", articleSchema);

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

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGODB_URI) {
      console.warn("[DB] MONGODB_URI not set — running without persistent storage.");
      return false;
    }
    mongoose.connection.on("error", (err) =>
      console.error(`[DB] connection error: ${err.message}`)
    );
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    await Promise.allSettled([FactCheck.init(), Article.init(), Report.init()]);
    console.log("[DB] MongoDB connected");
  }
  return mongoose.connection.readyState === 1;
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function saveFactCheck(data) {
  try {
    await connectDB();
    if (!isDbConnected()) return null;
    return await FactCheck.create(data);
  } catch (err) {
    console.error(`DB save error: ${err.message}`);
    return null;
  }
}

export async function getRecentFactChecks(limit = 20) {
  try {
    await connectDB();
    if (!isDbConnected()) return [];
    return await FactCheck.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    console.error(`DB read error: ${err.message}`);
    return [];
  }
}

export async function saveArticles(articles) {
  try {
    await connectDB();
    if (!isDbConnected() || articles.length === 0) return 0;
    const ops = articles.map((a) => ({
      updateOne: {
        filter: { link: a.link },
        update: { $set: { ...a, createdAt: new Date() } },
        upsert: true,
      },
    }));
    const result = await Article.bulkWrite(ops, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  } catch (err) {
    console.error(`DB article save error: ${err.message}`);
    return 0;
  }
}

export async function searchArticles(claim, limit = 8) {
  try {
    await connectDB();
    if (!isDbConnected()) return [];
    const terms = claim
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 8)
      .join(" ");
    if (!terms) return [];
    return await Article.find(
      { $text: { $search: terms } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" }, pubDate: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    console.error(`DB article search error: ${err.message}`);
    return [];
  }
}

export async function countArticles() {
  try {
    await connectDB();
    if (!isDbConnected()) return 0;
    return await Article.estimatedDocumentCount();
  } catch {
    return 0;
  }
}

export async function saveReport(data) {
  try {
    await connectDB();
    if (!isDbConnected()) return null;
    return await Report.create(data);
  } catch (err) {
    console.error(`Report save error: ${err.message}`);
    return null;
  }
}

export async function getReports(status = null) {
  try {
    await connectDB();
    if (!isDbConnected()) return [];
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
    if (!isDbConnected()) return null;
    return await Report.findByIdAndUpdate(id, { status }, { new: true }).lean();
  } catch (err) {
    console.error(`Report update error: ${err.message}`);
    return null;
  }
}

export { Article };
