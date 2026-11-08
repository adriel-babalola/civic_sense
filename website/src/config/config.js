const env = import.meta.env;

export const CONFIG = {
  SITE_NAME: "CivicSense",
  TAGLINE: "Truth. Awareness. Vote Informed.",
  ABOUT_TAGLINE: "Truth, Awareness, and Civic Sensibility",
  WHATSAPP_NUMBER: env.VITE_WHATSAPP_NUMBER || "",
  WHATSAPP_MESSAGE: "Hi CivicSense",
  WHATSAPP_LINK: `https://wa.me/${(env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "")}?text=${encodeURIComponent("Hi CivicSense")}`,
  API_BASE_URL: (env.VITE_API_URL || "https://civic-sense-8d2m.onrender.com").replace(/\/+$/, ""),
  CONTACT_EMAIL: env.VITE_CONTACT_EMAIL || "hello@civicsense.ng",
  GITHUB_URL: env.VITE_GITHUB_URL || "https://github.com/adriel-babalola/civic_sense",
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  WHATSAPP: {
    joinLink: `https://wa.me/${(env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "")}?text=${encodeURIComponent("Hi CivicSense")}`,
    chatLink: `https://wa.me/${(env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "")}?text=${encodeURIComponent("Hi CivicSense")}`,
  },
  SOCIAL: {
    twitter: env.VITE_TWITTER_URL || "https://twitter.com/civicsenseng",
    instagram: env.VITE_INSTAGRAM_URL || "https://instagram.com/civicsenseng",
  },
};

export default CONFIG;


export const FEATURES = {
  webFactCheck: (import.meta.env.VITE_FEATURE_FACTCHECK ?? "true") !== "false",
  politicians: (import.meta.env.VITE_FEATURE_POLITICIANS ?? "true") !== "false",
  incidentMap: (import.meta.env.VITE_FEATURE_MAP ?? "true") !== "false",
  liveFeed: (import.meta.env.VITE_FEATURE_FEED ?? "true") !== "false",
  reports: (import.meta.env.VITE_FEATURE_REPORTS ?? "true") !== "false",
};
