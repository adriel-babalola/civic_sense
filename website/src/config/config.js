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
 * PLACEHOLDER. The production Twilio number has not been provisioned, so this is
 * the Twilio sandbox rather than a real CivicSense line. It renders correctly and
 * the deep link is well formed, but messages sent here reach a sandbox and not
 * the bot. Replace all three values together when the number is issued.
 */
const WHATSAPP_NUMBER_E164 = "+14155238886";
const WHATSAPP_DISPLAY = "+1 415 523 8886";
const WHATSAPP_JOIN_CODE = "join angle-building";

const CONTACT_EMAIL = "civicsense@gmail.com";
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
    joinCode: WHATSAPP_JOIN_CODE,
    /** True while WHATSAPP_NUMBER_E164 is still the Twilio sandbox. */
    isPlaceholder: true,
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
  /** Front-end submission throttle. See hooks/useRateLimit.js. */
  REPORT_LIMIT: { max: 5, windowMs: 60 * 60 * 1000 },
  /** Matches MEDIA_MAX_MB on the server. */
  MAX_UPLOAD_MB: 5,
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

export default CONFIG;