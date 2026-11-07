const env = import.meta.env;

export const CONFIG = {
  SITE_NAME: "CivicSense",
  TAGLINE: "Truth. Awareness. Vote Informed.",
  ABOUT_TAGLINE: "Truth, Awareness, and Civic Sensibility",
  WHATSAPP_NUMBER: env.VITE_WHATSAPP_NUMBER || "",
  WHATSAPP_MESSAGE: "Hi CivicSense",
  WHATSAPP: `https://wa.me/${(env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "")}?text=${encodeURIComponent("Hi CivicSense")}`,
  API_BASE_URL: (env.VITE_API_URL || "https://civic-sense-8d2m.onrender.com").replace(/\/+$/, ""),
  SOCIAL: {
    twitter: env.VITE_TWITTER_URL || "https://twitter.com/civicsenseng",
    instagram: env.VITE_INSTAGRAM_URL || "https://instagram.com/civicsenseng",
  },
};

export default CONFIG;
