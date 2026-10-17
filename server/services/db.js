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

const adminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "moderator"],
      default: "moderator",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);
adminUserSchema.index({ email: 1 });

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

const profileSuggestionSchema = new mongoose.Schema(
  {
    politicianSlug: {
      type: String,
      required: [true, "Politician slug is required"],
      trim: true,
      index: true,
    },
    politicianName: {
      type: String,
      required: [true, "Politician name is required"],
      trim: true,
    },
    field: {
      type: String,
      default: "general",
    },
    suggestedText: {
      type: String,
      required: [true, "Suggested text is required"],
      trim: true,
    },
    sourceUrl: {
      type: String,
      required: [true, "Source citation URL is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    reviewNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);
profileSuggestionSchema.index({ status: 1, createdAt: -1 });

const ProfileSuggestion = mongoose.model("ProfileSuggestion", profileSuggestionSchema);

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
    await Promise.allSettled([
      FactCheck.init(),
      Article.init(),
      Report.init(),
      AdminUser.init(),
      ProfileSuggestion.init(),
    ]);
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

export async function findAdminByEmail(email) {
  try {
    await connectDB();
    if (!isDbConnected()) return null;
    return await AdminUser.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash").lean();
  } catch (err) {
    console.error(`Admin find error: ${err.message}`);
    return null;
  }
}

export async function findAdminById(id) {
  try {
    await connectDB();
    if (!isDbConnected()) return null;
    return await AdminUser.findById(id).lean();
  } catch (err) {
    console.error(`Admin findById error: ${err.message}`);
    return null;
  }
}

export async function updateAdminLastLogin(id) {
  try {
    await connectDB();
    if (!isDbConnected()) return;
    await AdminUser.findByIdAndUpdate(id, { lastLogin: new Date() });
  } catch (err) {
    console.error(`Admin lastLogin error: ${err.message}`);
  }
}

export async function countAdmins() {
  try {
    await connectDB();
    if (!isDbConnected()) return 0;
    return await AdminUser.countDocuments();
  } catch {
    return 0;
  }
}

export async function saveProfileSuggestion(data) {
  try {
    await connectDB();
    if (!isDbConnected()) return null;
    return await ProfileSuggestion.create(data);
  } catch (err) {
    console.error(`Suggestion save error: ${err.message}`);
    return null;
  }
}

export async function getProfileSuggestions({ status = null, page = 1, limit = 20 } = {}) {
  try {
    await connectDB();
    if (!isDbConnected()) return { items: [], total: 0, page, totalPages: 1 };
    const query = status ? { status } : {};
    const skip = (Math.max(1, page) - 1) * limit;
    const [items, total] = await Promise.all([
      ProfileSuggestion.find(query)
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProfileSuggestion.countDocuments(query),
    ]);
    return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) || 1 };
  } catch (err) {
    console.error(`Suggestions read error: ${err.message}`);
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function updateProfileSuggestionStatus(id, { status, reviewNotes, reviewedBy }) {
  try {
    await connectDB();
    if (!isDbConnected()) return null;
    const update = { status };
    if (reviewNotes !== undefined) update.reviewNotes = reviewNotes;
    if (reviewedBy) update.reviewedBy = reviewedBy;
    return await ProfileSuggestion.findByIdAndUpdate(id, update, { new: true })
      .populate("reviewedBy", "name email")
      .lean();
  } catch (err) {
    console.error(`Suggestion update error: ${err.message}`);
    return null;
  }
}

export async function getFactChecksPaginated({ page = 1, limit = 20, search = "", verdict = "", channel = "" } = {}) {
  try {
    await connectDB();
    if (!isDbConnected()) return { items: [], total: 0, page, totalPages: 1 };
    const query = {};
    if (verdict) query.verdict = verdict.toUpperCase();
    if (channel) query.channel = channel.toLowerCase();
    if (search) {
      query.$or = [
        { claim: { $regex: search, $options: "i" } },
        { hashedFrom: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Math.max(1, page) - 1) * limit;
    const [items, total] = await Promise.all([
      FactCheck.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      FactCheck.countDocuments(query),
    ]);
    return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) || 1 };
  } catch (err) {
    console.error(`FactChecks paginated read error: ${err.message}`);
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getReportsPaginated({ page = 1, limit = 20, status = "", type = "", state = "" } = {}) {
  try {
    await connectDB();
    if (!isDbConnected()) return { items: [], total: 0, page, totalPages: 1 };
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (state) query.state = state;
    const skip = (Math.max(1, page) - 1) * limit;
    const [items, total] = await Promise.all([
      Report.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments(query),
    ]);
    return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) || 1 };
  } catch (err) {
    console.error(`Reports paginated read error: ${err.message}`);
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getAdminStats(scraperStats = null) {
  try {
    await connectDB();
    if (!isDbConnected()) {
      return {
        dbConnected: false,
        totalFactChecks: 0,
        totalUsers: 0,
        activeUsersToday: 0,
        queriesToday: 0,
        verdicts: { VERIFIED: 0, FALSE: 0, MISLEADING: 0, UNVERIFIED: 0 },
        channels: { whatsapp: 0, telegram: 0, meta_whatsapp: 0, web: 0, test: 0 },
        reports: { pending: 0, approved: 0, rejected: 0, total: 0 },
        suggestions: { pending: 0, approved: 0, rejected: 0, total: 0 },
        articlesCount: 0,
        scraper: scraperStats,
      };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalFactChecks,
      distinctUsers,
      activeUsersToday,
      queriesToday,
      verdictAgg,
      channelAgg,
      reportAgg,
      suggestionAgg,
      articlesCount,
    ] = await Promise.all([
      FactCheck.countDocuments(),
      FactCheck.distinct("hashedFrom").then((res) => (res || []).filter(Boolean).length),
      FactCheck.distinct("hashedFrom", { timestamp: { $gte: todayStart } }).then(
        (res) => (res || []).filter(Boolean).length
      ),
      FactCheck.countDocuments({ timestamp: { $gte: todayStart } }),
      FactCheck.aggregate([
        { $group: { _id: { $toUpper: "$verdict" }, count: { $sum: 1 } } },
      ]),
      FactCheck.aggregate([
        { $group: { _id: { $toLower: "$channel" }, count: { $sum: 1 } } },
      ]),
      Report.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ProfileSuggestion.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Article.estimatedDocumentCount(),
    ]);

    const verdicts = { VERIFIED: 0, FALSE: 0, MISLEADING: 0, UNVERIFIED: 0 };
    for (const v of verdictAgg) {
      if (v._id) verdicts[v._id] = v.count;
    }

    const channels = { whatsapp: 0, telegram: 0, meta_whatsapp: 0, web: 0, test: 0 };
    for (const c of channelAgg) {
      if (c._id) channels[c._id] = c.count;
    }

    const reports = { pending: 0, approved: 0, rejected: 0, total: 0 };
    for (const r of reportAgg) {
      if (r._id) {
        reports[r._id] = r.count;
        reports.total += r.count;
      }
    }

    const suggestions = { pending: 0, approved: 0, rejected: 0, total: 0 };
    for (const s of suggestionAgg) {
      if (s._id) {
        suggestions[s._id] = s.count;
        suggestions.total += s.count;
      }
    }

    return {
      dbConnected: true,
      totalFactChecks,
      totalUsers: Math.max(distinctUsers, totalFactChecks > 0 ? 1 : 0),
      activeUsersToday: Math.max(activeUsersToday, queriesToday > 0 ? 1 : 0),
      queriesToday,
      verdicts,
      channels,
      reports,
      suggestions,
      articlesCount,
      scraper: scraperStats,
    };
  } catch (err) {
    console.error(`getAdminStats error: ${err.message}`);
    return null;
  }
}

export { Article, Report, FactCheck, AdminUser, ProfileSuggestion };

