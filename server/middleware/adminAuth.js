import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const JWT_SECRET = process.env.JWT_SECRET || "civicsense-admin-secret-key-2027-kratos";
const TOKEN_EXPIRY = "24h";

/**
 * Signs a JWT session token for an authenticated administrator.
 * @param {Object} admin - AdminUser document or object
 * @returns {string} Signed JWT token
 */
export function signAdminToken(admin) {
  return jwt.sign(
    {
      id: admin._id || admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Synchronously verifies a JWT token.
 * @param {string} token
 * @returns {Object|null} Decoded payload or null if invalid/expired
 */
export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Express middleware to protect administrative routes.
 * Checks for a valid Bearer token in Authorization or x-admin-token header.
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || req.headers["x-admin-token"];
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (typeof authHeader === "string") {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Missing admin authorization token.",
    });
  }

  const decoded = verifyAdminToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired admin session token.",
    });
  }

  req.admin = decoded;
  next();
}

/**
 * Express middleware to enforce superadmin-only operations.
 */
export function requireSuperadmin(req, res, next) {
  requireAdmin(req, res, () => {
    if (req.admin?.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden. Superadmin privileges required.",
      });
    }
    next();
  });
}

/**
 * Rate limiter to prevent brute-force attacks on the admin login route.
 * Allows at most 10 login attempts per 15 minutes per IP address.
 */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many failed login attempts. Please try again after 15 minutes.",
  },
});
