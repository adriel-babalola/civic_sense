/**
 * CivicSense website — runtime configuration.
 *
 * Anything environment-dependent is resolved here once, so no component ever
 * reads `import.meta.env` directly. That keeps the deployment surface to a
 * single file and makes the defaults explicit.
 */

const env = import.meta.env;

const SITE_URL = (env.VITE_SITE_URL || "https://civic-sense-website.vercel.app").replace(
  /\/+$/,
  "",
);

/**
 * WhatsApp number.
 *
 * Supplied at build time via `VITE_WHATSAPP_NUMBER`. There is no hardcoded
 * fallback: the number is deployment data, and every consumer reads it from
 * here so a single env change updates every CTA.
 */
const WHATSAPP_NUMBER_E164 = (env.VITE_WHATSAPP_NUMBER || "").trim();

function formatPhone(e164) {
  const match = /^\+(\d{1,3})(\d{3})(\d{3})(\d{4})$/.exec(e164);
  if (!match) return e164;
  const [, cc, a, b, c] = match;
  return `+${cc} ${a} ${b} ${c}`;
}

const WHATSAPP_DISPLAY = formatPhone(WHATSAPP_NUMBER_E164);

const CONTACT_EMAIL = "civicsense@gmail.com";

/**
 * Privacy contact.
 *
 * Kept separate from CONTACT_EMAIL so a data subject access or erasure request
 * has its own address to aim at, which is what Meta's Data Deletion
 * Instructions reviewer expects to find. Same inbox is fine, a different
 * constant is not optional: the two pages have to be able to name a privacy
 * route without asserting that general enquiries are a privacy channel.
 */
const PRIVACY_EMAIL = "civicsense.verify@gmail.com";
const GITHUB_URL = "https://github.com/adriel-babalola/civic_sense";
const DEMO_VIDEO_URL = "https://youtu.be/nhasRYxrBNc";

/**
 * Feature flags. These gate unfinished surfaces so navigation never links to a
 * dead route.
 */
export const FEATURES = {
  /** Bundled INEC-derived roster. */
  politicians: env.VITE_FEATURE_POLITICIANS !== "false",
  /** Claim checker, answered locally from the sample index. */
  webFactCheck: env.VITE_FEATURE_FACTCHECK !== "false",
  /** Leaflet incident map over bundled boundaries and sample records. */
  incidentMap: env.VITE_FEATURE_MAP !== "false",
  /** Verification feed over bundled sample records. */
  liveFeed: env.VITE_FEATURE_FEED !== "false",
  /** Anonymous incident reports, stored in this browser. */
  reports: env.VITE_FEATURE_REPORTS !== "false",
};

export const CONFIG = {
  SITE_URL,
  WHATSAPP: {
    e164: WHATSAPP_NUMBER_E164,
    display: WHATSAPP_DISPLAY,
    /** Deep link that opens a chat with the CivicSense bot. */
    joinLink: `https://wa.me/${WHATSAPP_NUMBER_E164}`,
    chatLink: `https://wa.me/${WHATSAPP_NUMBER_E164}`,
  },
  CONTACT_EMAIL,
  PRIVACY_EMAIL,
  GITHUB_URL,
  DEMO_VIDEO_URL,
  FEATURES,
  /** Front-end submission throttle. See hooks/useRateLimit.js. */
  REPORT_LIMIT: { max: 5, windowMs: 60 * 60 * 1000 },
  /** Matches MEDIA_MAX_MB on the server. */
  MAX_UPLOAD_MB: 5,
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

export default CONFIG;