import { CONFIG } from "../config/config";

export const ELECTION_CALENDAR_2027 = [
  {
    id: "inec-notice-2026",
    title: "INEC Official Notice of 2027 General Elections",
    category: "statutory",
    categoryLabel: "Official Notice",
    date: "2026-02-23",
    endDate: "2026-02-23",
    description: "INEC publishes the official Notice of General Election at least 360 days before polling day as mandated by Section 28(1) of the Electoral Act 2022.",
    location: "INEC Headquarters, Abuja & 36 State Offices",
    legalBasis: "Section 28(1), Electoral Act 2022",
  },
  {
    id: "party-primaries-window",
    title: "Political Party Primaries & Dispute Resolution Window",
    category: "primaries",
    categoryLabel: "Party Primaries",
    date: "2026-06-01",
    endDate: "2026-08-15",
    description: "Political parties conduct congresses and primary elections to nominate candidates for Presidential, National Assembly, Governorship, and State Assembly contests.",
    location: "Nationwide Party Secretariats & Congress Venues",
    legalBasis: "Section 29(1), Electoral Act 2022",
  },
  {
    id: "candidate-submission-deadline",
    title: "Submission of Final Certified Candidate Lists (Forms EC9/EC9B)",
    category: "nomination",
    categoryLabel: "Nominations",
    date: "2026-09-12",
    endDate: "2026-09-12",
    description: "Deadline for political parties to submit validated personal particulars of cleared presidential and legislative candidates to INEC.",
    location: "INEC Portal, Abuja",
    legalBasis: "Section 29(3), Electoral Act 2022",
  },
  {
    id: "presidential-campaign-begins",
    title: "Official Campaign Period Begins (Presidential & NASS)",
    category: "campaign",
    categoryLabel: "Campaigns",
    date: "2026-09-23",
    endDate: "2026-09-23",
    description: "Public campaigning by certified political parties and candidates officially commences 150 days before polling day as mandated by Section 94(1).",
    location: "Nationwide Rallies & Media",
    legalBasis: "Section 94(1), Electoral Act 2022",
  },
  {
    id: "cvr-pvc-collection-deadline",
    title: "Continuous Voter Registration (CVR) & PVC Collection Deadline",
    category: "voters",
    categoryLabel: "Voter Registration",
    date: "2026-11-15",
    endDate: "2026-11-15",
    description: "Final deadline for Nigerian citizens to register to vote, transfer registration, and collect Permanent Voter Cards (PVCs) at designated INEC offices.",
    location: "INEC Local Government Offices Nationwide",
    legalBasis: "Section 10(1), Electoral Act 2022",
  },
  {
    id: "campaign-blackout",
    title: "Campaign Blackout Window (24 Hours Before Polling)",
    category: "campaign",
    categoryLabel: "Campaigns",
    date: "2027-02-19",
    endDate: "2027-02-19",
    description: "All political campaigns, advertisements, public rallies, and promotional media must cease completely 24 hours prior to polling.",
    location: "Nationwide Broadcast & Public Spaces",
    legalBasis: "Section 94(1), Electoral Act 2022",
  },
  {
    id: "presidential-election-day",
    title: "2027 Presidential & National Assembly Election (POLLING DAY)",
    category: "polling",
    categoryLabel: "Polling Day",
    date: "2027-02-20",
    endDate: "2027-02-20",
    timeStart: "08:30:00",
    timeEnd: "14:30:00",
    description: "Accreditation and voting nationwide across all 176,846 polling units for President, Vice President, Senate, and House of Representatives.",
    location: "All Polling Units Across 36 States & FCT",
    legalBasis: "Sections 132(2) & 76(2), 1999 Constitution (as amended)",
    isMajor: true,
  },
  {
    id: "governorship-election-day",
    title: "2027 Governorship & State Houses of Assembly Election",
    category: "polling",
    categoryLabel: "Polling Day",
    date: "2027-03-06",
    endDate: "2027-03-06",
    timeStart: "08:30:00",
    timeEnd: "14:30:00",
    description: "Polling day for State Governors and Members of State Houses of Assembly in 28 participating states across Nigeria.",
    location: "Polling Units in Participating 28 States",
    legalBasis: "Sections 178(2) & 116(2), 1999 Constitution (as amended)",
    isMajor: true,
  },
  {
    id: "runoff-window",
    title: "Constitutional Window for Presidential Run-Off (If Required)",
    category: "contingency",
    categoryLabel: "Contingency",
    date: "2027-03-13",
    endDate: "2027-03-27",
    description: "Constitutional 21-day window for a second ballot run-off if no presidential candidate secures a simple majority and 25% of votes in at least two-thirds of all states.",
    location: "Nationwide Polling Units",
    legalBasis: "Section 134(4), 1999 Constitution (as amended)",
  },
  {
    id: "inauguration-day",
    title: "Presidential Inauguration & Handover Day",
    category: "inauguration",
    categoryLabel: "Handover",
    date: "2027-05-29",
    endDate: "2027-05-29",
    description: "Official inauguration and swearing-in ceremony of the President-Elect and Vice President-Elect of the Federal Republic of Nigeria.",
    location: "Eagle Square, Abuja",
    legalBasis: "Section 135(2), 1999 Constitution (as amended)",
    isMajor: true,
  },
];

export const CALENDAR_CATEGORIES = [
  { key: "all", label: "All Milestones" },
  { key: "polling", label: "Polling Days" },
  { key: "voters", label: "Voter Registration & PVC" },
  { key: "campaign", label: "Campaign Periods" },
  { key: "primaries", label: "Party Primaries" },
];

/**
 * Generate a direct webcal link for Apple Calendar (iPhone / iPad / Mac).
 */
export function getWebcalUrl() {
  const base = CONFIG.API_BASE_URL || "https://civic-sense-8d2m.onrender.com";
  const url = `${base}/api/calendar/2027.ics`;
  return url.replace(/^https?:/, "webcal:");
}

/**
 * Direct HTTPS download link for .ics file.
 */
export function getIcsDownloadUrl() {
  const base = CONFIG.API_BASE_URL || "https://civic-sense-8d2m.onrender.com";
  return `${base}/api/calendar/2027.ics`;
}

/**
 * Generate a 1-click Google Calendar URL for a specific event.
 */
export function getGoogleCalendarUrl(event) {
  const pad = (n) => String(n).padStart(2, "0");
  const sDate = event.date.replace(/-/g, "");
  let datesParam = `${sDate}/${sDate}`;

  if (event.timeStart) {
    const sTime = event.timeStart.replace(/:/g, "");
    const eTime = (event.timeEnd || "143000").replace(/:/g, "");
    datesParam = `${sDate}T${sTime}/${sDate}T${eTime}`;
  } else {
    const endD = new Date(event.endDate || event.date);
    endD.setDate(endD.getDate() + 1);
    const eDate = `${endD.getFullYear()}${pad(endD.getMonth() + 1)}${pad(endD.getDate())}`;
    datesParam = `${sDate}/${eDate}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: datesParam,
    details: `${event.description}\n\nVerified by CivicSense (https://civicsense.fyi/calendar)`,
    location: event.location || "Nigeria",
    ctz: "Africa/Lagos",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
