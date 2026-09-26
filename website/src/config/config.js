/**
 * CivicSense website — runtime configuration.
 *
 * Anything environment-dependent is resolved here once, so no component ever
 * reads `import.meta.env` directly. That keeps the deployment surface to a
 * single file and makes the defaults explicit.
 */

const env = import.meta.env;

/**
 * API origin.
 *
 * In development Vite proxies /api to the local server, and in production the
 * default is same-origin. A hard-coded localhost default would point a deployed
 * site at the visitor's own machine, where every request fails silently.
 * Set VITE_API_URL to an absolute origin when the API is hosted separately.
 */
const API_BASE = (env.VITE_API_URL || (env.DEV ? "http://localhost:3000" : "")).replace(/\/+$/, "");

/** Twilio WhatsApp sandbox. Update when a production number is provisioned. */
const WHATSAPP_NUMBER_E164 = "+14155238886";
const WHATSAPP_DISPLAY = "+1 415 523 8886";
const WHATSAPP_JOIN_CODE = "join angle-building";

const SITE_URL = (env.VITE_SITE_URL || "https://civic-sense-website.vercel.app").replace(
  /\/+$/,
  "",
);

const CONTACT_EMAIL = "civic-sense@proton.me";
const GITHUB_URL = "https://github.com/adriel-babalola/civic_sense";
const DEMO_VIDEO_URL = "https://youtu.be/nhasRYxrBNc";

/**
 * Feature flags. These gate unfinished surfaces so navigation never links to a
 * dead route. Flip to `true` as each feature ships.
 */
export const FEATURES = {
  /** Local JSON dataset served from the client. Moves to the API in Month 1. */
  politicians: env.VITE_FEATURE_POLITICIANS !== "false",
  /** Public web fact-check, backed by POST /api/factcheck. */
  webFactCheck: env.VITE_FEATURE_FACTCHECK !== "false",
  /** Leaflet incident map, backed by GET /api/incidents. */
  incidentMap: env.VITE_FEATURE_MAP !== "false",
  /** Live verdict feed, backed by GET /api/factchecks. */
  liveFeed: env.VITE_FEATURE_FEED !== "false",
  /** Anonymous incident reports, backed by POST /api/reports. */
  reports: env.VITE_FEATURE_REPORTS !== "false",
  /** Password-gated moderation and analytics. */
  admin: env.VITE_FEATURE_ADMIN !== "false",
};

export const API = {
  health: `${API_BASE}/api/health`,
  sources: `${API_BASE}/api/sources`,
  incidents: `${API_BASE}/api/incidents`,
  reports: `${API_BASE}/api/reports`,
  factchecks: `${API_BASE}/api/factchecks`,
  factcheck: `${API_BASE}/api/factcheck`,
};

export const CONFIG = {
  API_BASE,
  SITE_URL,
  WHATSAPP: {
    e164: WHATSAPP_NUMBER_E164,
    display: WHATSAPP_DISPLAY,
    joinCode: WHATSAPP_JOIN_CODE,
    /** Deep link that opens WhatsApp with the sandbox join code prefilled. */
    joinLink: `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(
      WHATSAPP_JOIN_CODE,
    )}`,
    chatLink: `https://wa.me/${WHATSAPP_NUMBER_E164}`,
  },
  CONTACT_EMAIL,
  GITHUB_URL,
  DEMO_VIDEO_URL,
  FEATURES,
  /** Poll interval for anything that shows live data. */
  POLL_INTERVAL_MS: 30_000,
  /** Front-end submission throttle. See hooks/useRateLimit.js. */
  REPORT_LIMIT: { max: 5, windowMs: 60 * 60 * 1000 },
  /** Matches MEDIA_MAX_MB on the server. */
  MAX_UPLOAD_MB: 5,
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

export default CONFIG;
