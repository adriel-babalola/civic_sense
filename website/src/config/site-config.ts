export const siteConfig = {
  name: "CivicSense",
  description:
    "Send a rumour to WhatsApp. Get the truth back. CivicSense is a WhatsApp AI fact-checking bot for Nigerians. No app, no sign-up, sourced verdicts in under 20 seconds.",
  tagline: "Truth Awareness. CivicSense.",
  whatsappUrl: "https://wa.me/14155238886",
  whatsappNumber: "+1 415 523 8886",
  contactEmail: "hello@civicsense.app",
  links: {
    // TODO: replace these with the live production URLs once deployed
    websiteUrl: "https://civicsense.app/",
    mapUrl: "https://civicsense.app/map",
    reportUrl: "https://civicsense.app/report",
    dashboardUrl: "https://civicsense.app/dashboard",
    repositoryUrl: "https://github.com/adriel-babalola/civic_sense",
    politicianRequestUrl:
      "mailto:hello@civicsense.app?subject=Request%20a%20new%20politician",
  },
  navItems: [
    {
      label: "About",
      href: "#about",
    },
    {
      label: "Sources",
      href: "#sources",
    },
    {
      label: "How it works",
      href: "#how-it-works",
    },
    {
      label: "Sample verdicts",
      href: "#verdicts",
    },
  ],
};
export type SiteConfig = typeof siteConfig;
