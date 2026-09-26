/** CivicSense website — shared constants. */

/* ---------------------------------------------------------------------------
 * Verdicts
 * Mirrors the four verdicts the pipeline can return. Anything outside this set
 * is coerced to UNVERIFIED so the UI never renders an unstyled state.
 * ------------------------------------------------------------------------ */
export const VERDICTS = ["VERIFIED", "MISLEADING", "FALSE", "UNVERIFIED"];

export const VERDICT_META = {
  VERIFIED: {
    label: "Verified",
    token: "verified",
    description: "Multiple independent sources confirm this claim.",
  },
  MISLEADING: {
    label: "Misleading",
    token: "misleading",
    description: "The claim is partly true but framed to deceive.",
  },
  FALSE: {
    label: "False",
    token: "false",
    description: "Independent sources contradict this claim.",
  },
  UNVERIFIED: {
    label: "Unverified",
    token: "unverified",
    description: "Not enough evidence yet to reach a verdict.",
  },
};

/* ---------------------------------------------------------------------------
 * Incident types
 * Enum is enforced server-side on the Report collection.
 * ------------------------------------------------------------------------ */
export const INCIDENT_TYPES = ["violence", "misconduct", "unrest"];

export const INCIDENT_META = {
  violence: {
    label: "Violence",
    token: "violence",
    blurb: "Physical attacks, killings, or clashes at a venue.",
  },
  misconduct: {
    label: "Misconduct",
    token: "misconduct",
    blurb: "Voter intimidation, ballot-box issues, or procedural fraud.",
  },
  unrest: {
    label: "Civil unrest",
    token: "unrest",
    blurb: "Protests, blockades, or property destruction.",
  },
};

/* ---------------------------------------------------------------------------
 * Report status
 * ------------------------------------------------------------------------ */
export const REPORT_STATUSES = ["pending", "approved", "rejected"];

export const REPORT_STATUS_META = {
  pending: { label: "Pending", token: "unverified" },
  approved: { label: "Approved", token: "verified" },
  rejected: { label: "Rejected", token: "false" },
};

/* ---------------------------------------------------------------------------
 * Parties
 *
 * The old hard-coded list here was nine entries and wrong for the current
 * electoral cycle: INEC cleared 18 parties for the 2027 presidential election,
 * including four that were missing entirely. Parties are no longer listed here
 * at all. They are read from the certified ticket list in
 * src/data/elections2027.js, so a new election cycle cannot leave this file
 * quietly out of date. Use getParties() from src/data/politicians.js.
 * ------------------------------------------------------------------------ */

/* ---------------------------------------------------------------------------
 * Channels a fact-check can originate from. Stored on the FactCheck document.
 * ------------------------------------------------------------------------ */
export const CHANNELS = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  api: "API",
  dashboard: "Dashboard",
  web: "Website",
  test: "Test",
};

/* ---------------------------------------------------------------------------
 * Incident types and the incident types filter
 * ------------------------------------------------------------------------ */
export const ALL = "all";
