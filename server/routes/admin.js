import express from "express";
import bcrypt from "bcryptjs";
import {
  findAdminByEmail,
  updateAdminLastLogin,
  getAdminStats,
  getReportsPaginated,
  updateReportStatus,
  getFactChecksPaginated,
  getProfileSuggestions,
  updateProfileSuggestionStatus,
} from "../services/db.js";
import {
  signAdminToken,
  requireAdmin,
  requireSuperadmin,
  adminLoginLimiter,
} from "../middleware/adminAuth.js";
import { getScraperStats, syncOnce } from "../services/scraper.js";

const router = express.Router();

/**
 * POST /api/admin/auth/login
 * Authenticates administrator credentials and returns signed JWT token.
 */
router.post("/auth/login", adminLoginLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Please provide both email and password.",
    });
  }

  try {
    const admin = await findAdminByEmail(email);
    if (!admin || !admin.passwordHash) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    await updateAdminLastLogin(admin._id);
    const token = signAdminToken(admin);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(`[Admin Auth] Login error: ${err.message}`);
    res.status(500).json({ success: false, error: "Internal server error during authentication." });
  }
});

/**
 * GET /api/admin/auth/me
 * Returns current authenticated admin profile and role.
 */
router.get("/auth/me", requireAdmin, async (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

/**
 * POST /api/admin/auth/logout
 * Stateless confirmation of session logout.
 */
router.post("/auth/logout", requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

/**
 * GET /api/admin/stats
 * Aggregated dashboard metrics & system telemetry.
 */
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const scraperStats = getScraperStats();
    const stats = await getAdminStats(scraperStats);
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error(`[Admin Stats] Error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/reports
 * Paginated reports moderation queue.
 */
router.get("/reports", requireAdmin, async (req, res) => {
  try {
    const { page, limit, status, type, state } = req.query;
    const result = await getReportsPaginated({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status: status || "",
      type: type || "",
      state: state || "",
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`[Admin Reports] Query error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/reports/:id
 * Moderate incident report status (approved/rejected/pending).
 */
router.patch("/reports/:id", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status must be 'approved', 'rejected', or 'pending'.",
    });
  }

  try {
    const report = await updateReportStatus(req.params.id, status);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found." });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    console.error(`[Admin Reports] Update error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/claims
 * Paginated fact-check claims audit inspector.
 */
router.get("/claims", requireAdmin, async (req, res) => {
  try {
    const { page, limit, search, verdict, channel } = req.query;
    const result = await getFactChecksPaginated({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: search || "",
      verdict: verdict || "",
      channel: channel || "",
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`[Admin Claims] Query error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/suggestions
 * Paginated politician profile adjustments queue.
 */
router.get("/suggestions", requireAdmin, async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await getProfileSuggestions({
      status: status || null,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`[Admin Suggestions] Query error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/suggestions/:id
 * Review a politician profile adjustment suggestion.
 */
router.patch("/suggestions/:id", requireAdmin, async (req, res) => {
  const { status, reviewNotes } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status must be 'approved', 'rejected', or 'pending'.",
    });
  }

  try {
    const suggestion = await updateProfileSuggestionStatus(req.params.id, {
      status,
      reviewNotes: reviewNotes || "",
      reviewedBy: req.admin.id,
    });
    if (!suggestion) {
      return res.status(404).json({ success: false, error: "Suggestion not found." });
    }
    res.json({ success: true, data: suggestion });
  } catch (err) {
    console.error(`[Admin Suggestions] Update error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/scraper/sync
 * Manually trigger on-demand RSS scraper sync (superadmin only).
 */
router.post("/scraper/sync", requireSuperadmin, async (req, res) => {
  try {
    const result = await syncOnce();
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(`[Admin Scraper] Sync error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
