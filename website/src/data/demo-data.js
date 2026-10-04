/**
 * Demo data.
 *
 * WHY THIS FILE EXISTS
 *
 * The website is a static bundle. Every remote read it used to perform
 * (GET /api/incidents, GET /api/factchecks, GET /api/sources, POST
 * /api/factcheck, POST /api/reports) failed on a static host, because there is
 * no server behind it. That produced the "The incident feed did not load /
 * [object Object]" state on /map and /live: the API client stringified a JSON
 * error object into an Error message, and React rendered the result.
 *
 * So the reads are gone, and this file stands in for them. The trade is explicit:
 * a demo that needs a running backend is a demo that breaks on stage, and the
 * pages below are the ones a visitor looks at first.
 *
 * THE ONE RULE THAT MATTERS HERE
 *
 * This is SAMPLE data, and every surface that renders it says so. An incident map
 * populated with invented reports, published under a real product's name, would
 * be the single most damaging thing this codebase could do: readers cannot tell
 * a sample row from a corroborated one at a glance, and a fabricated report about
 * a real state is defamatory to whoever is actually there. So `SAMPLE_NOTICE` is
 * rendered on /map, /live and /sources, and nothing here is ever described as a
 * live report.
 *
 * The shape of each record matches what the server returns, so restoring the API
 * is a matter of swapping the import in each page. Nothing else changes.
 */

/** Shown on every surface that renders this file. Not optional. */
export const SAMPLE_NOTICE =
  "Demonstration data. These records are samples for previewing the interface, not live reports or real published checks.";

/* ---------------------------------------------------------------------------
 * Sources
 *
 * The newsroom registry, bundled rather than fetched, so listing where we check
 * does not depend on a server being up.
 * ------------------------------------------------------------------------ */

export const SOURCES = [
  { name: "Premium Times", region: "National", category: "General", baseUrl: "https://www.premiumtimesng.com", feed: "https://www.premiumtimesng.com/feed/" },
  { name: "The Punch", region: "National", category: "General", baseUrl: "https://punchng.com", feed: "https://punchng.com/feed/" },
  { name: "Vanguard", region: "National", category: "General", baseUrl: "https://www.vanguardngr.com", feed: "https://www.vanguardngr.com/feed/" },
  { name: "Daily Trust", region: "North", category: "General", baseUrl: "https://dailytrust.com", feed: "https://dailytrust.com/feed/" },
  { name: "Leadership", region: "National", category: "General", baseUrl: "https://leadership.ng", feed: "https://leadership.ng/feed/" },
  { name: "Channels TV", region: "National", category: "Broadcast", baseUrl: "https://www.channelstv.com", feed: "https://www.channelstv.com/feed/" },
  { name: "Daily Post", region: "South-West", category: "General", baseUrl: "https://dailypost.ng", feed: "https://dailypost.ng/feed/" },
  { name: "Nigerian Tribune", region: "South-West", category: "General", baseUrl: "https://tribuneonlineng.com", feed: "https://tribuneonlineng.com/feed/" },
  { name: "BusinessDay", region: "National", category: "Business", baseUrl: "https://businessday.ng", feed: "https://businessday.ng/feed/" },
  { name: "PM News", region: "North-West", category: "General", baseUrl: "https://pmnewsnigeria.com", feed: "https://pmnewsnigeria.com/feed/" },
  { name: "Ripples Nigeria", region: "South-East", category: "General", baseUrl: "https://ripplesnigeria.com", feed: "https://ripplesnigeria.com/feed/" },
  { name: "Information Nigeria", region: "North-Central", category: "General", baseUrl: "https://information-nigeria.com", feed: "https://information-nigeria.com/feed/" },
  { name: "TheCable", region: "National", category: "Analysis", baseUrl: "https://www.thecable.ng", feed: "https://www.thecable.ng/feed/" },
  { name: "The Guardian Nigeria", region: "South-West", category: "General", baseUrl: "https://guardian.ng", feed: "https://guardian.ng/feed/" },
  { name: "Dubawa", region: "National", category: "Fact-checking", baseUrl: "https://dubawa.org", feed: "https://dubawa.org/feed/" },
  { name: "FactCheckHub", region: "National", category: "Fact-checking", baseUrl: "https://factcheckhub.com", feed: "https://factcheckhub.com/feed/" },
  { name: "FactCheck Africa", region: "Continental", category: "Fact-checking", baseUrl: "https://factcheck.africa", feed: "https://factcheck.africa/feed/" },
  // Primary official bodies, not newsrooms. They are here because the sample
  // rules cite them: a verdict that leans on the CBN or the electoral
  // commission should link the commission, not a paper reporting it.
  { name: "National Orientation Agency", region: "National", category: "Official", baseUrl: "https://noa.gov.ng" },
  { name: "National Bureau of Statistics", region: "National", category: "Official", baseUrl: "https://www.nigerianstat.gov.ng" },
];

/* ---------------------------------------------------------------------------
 * Incidents
 *
 * Field-for-field the shape `GET /api/incidents` returns, because the map, the
 * legend and the counts are all driven off these keys.
 * ------------------------------------------------------------------------ */

export const INCIDENTS = [
  {
    _id: "sample-1",
    type: "misconduct",
    state: "Kano",
    lga: "Kano Municipal",
    description:
      "Sample record: voters reportedly queued before the scheduled opening time at two polling units, and materials arrived after the first hour.",
    evidence: "Photographs of the queue were attached to the original report.",
    timestamp: "2026-11-14T08:40:00.000Z",
  },
  {
    _id: "sample-2",
    type: "violence",
    state: "Borno",
    lga: "Maiduguri",
    description:
      "Sample record: a dispute between two supporters at a campaign stop was reported to police. No injuries were recorded.",
    evidence: "",
    timestamp: "2026-10-02T13:15:00.000Z",
  },
  {
    _id: "sample-3",
    type: "misconduct",
    state: "Rivers",
    lga: "Port Harcourt",
    description:
      "Sample record: a returning officer was observed writing into an opened ballot box while polls were still running.",
    evidence: "A short video clip was attached to the original report.",
    timestamp: "2026-11-14T11:05:00.000Z",
  },
  {
    _id: "sample-4",
    type: "unrest",
    state: "Lagos",
    lga: "Ikeja",
    description:
      "Sample record: a road blocking protest affected movement through the junction for most of the afternoon.",
    evidence: "",
    timestamp: "2026-09-19T16:30:00.000Z",
  },
  {
    _id: "sample-5",
    type: "misconduct",
    state: "Adamawa",
    lga: "Yola North",
    description:
      "Sample record: results sheets photographed before sealing were circulated and did not match the figures announced later.",
    evidence: "Two sets of photographs were attached to the original report.",
    timestamp: "2026-11-15T07:20:00.000Z",
  },
  {
    _id: "sample-6",
    type: "violence",
    state: "Plateau",
    lga: "Jos North",
    description:
      "Sample record: clashes between rival groups near a ward office. Police were deployed and the area was cleared.",
    evidence: "",
    timestamp: "2026-08-08T14:50:00.000Z",
  },
  {
    _id: "sample-7",
    type: "unrest",
    state: "Oyo",
    lga: "Ibadin South",
    description:
      "Sample record: a student protest over fees disrupted lectures for two days before a negotiated settlement.",
    evidence: "Statements from both sides were attached to the original report.",
    timestamp: "2026-06-11T09:10:00.000Z",
  },
  {
    _id: "sample-8",
    type: "misconduct",
    state: "Anambra",
    lga: "Awka South",
    description:
      "Sample record: indeliberate foreign-looking voters were observed at a unit during a visit by observers.",
    evidence: "",
    timestamp: "2026-11-14T10:25:00.000Z",
  },
  {
    _id: "sample-9",
    type: "misconduct",
    state: "Kaduna",
    lga: "Kaduna North",
    description:
      "Sample record: a truck was reported carrying voters to a ward, with movement between units shortly before close of polls.",
    evidence: "A photograph of the vehicle was attached to the original report.",
    timestamp: "2026-11-14T15:40:00.000Z",
  },
  {
    _id: "sample-10",
    type: "unrest",
    state: "Enugu",
    lga: "Enugu North",
    description:
      "Sample record: a market association protest over taxation closed shops along the main road for a day.",
    evidence: "",
    timestamp: "2026-07-23T12:00:00.000Z",
  },
  {
    _id: "sample-11",
    type: "violence",
    state: "Sokoto",
    lga: "Sokoto North",
    description:
      "Sample record: a physical altercation broke out at a party primaries venue. The venue was evacuated.",
    evidence: "",
    timestamp: "2026-05-30T18:25:00.000Z",
  },
  {
    _id: "sample-12",
    type: "misconduct",
    state: "Niger",
    lga: "Muzaffar",
    description:
      "Sample record: voters were reportedly offered cash in exchange for a completed ballot. No arrest was made.",
    evidence: "",
    timestamp: "2026-11-14T12:45:00.000Z",
  },
];

/* ---------------------------------------------------------------------------
 * Fact-checks
 *
 * Field-for-field the shape `GET /api/factchecks` returns.
 * ------------------------------------------------------------------------ */

export const CHECKS = [
  {
    _id: "check-1",
    claim: "Fuel subsidy has been removed and petrol is now ₦200 per litre",
    verdict: "FALSE",
    summary:
      "Petrol does not sell for ₦200. Pump prices vary by state and have settled well above that figure.",
    sources: [
      { title: "Premium Times", url: "https://www.premiumtimesng.com" },
      { title: "National Bureau of Statistics", url: "https://www.nigerianstat.gov.ng" },
    ],
    channel: "whatsapp",
    timestamp: "2026-09-24T09:12:00.000Z",
  },
  {
    _id: "check-2",
    claim: "The new national minimum wage is ₦70,000 per month",
    verdict: "VERIFIED",
    summary:
      "The figure was adopted for the national minimum wage. State governments may set a higher rate.",
    sources: [{ title: "National Orientation Agency", url: "https://noa.gov.ng" }],
    channel: "whatsapp",
    timestamp: "2026-09-23T16:40:00.000Z",
  },
  {
    _id: "check-3",
    claim: "INEC has extended the deadline for the 2027 presidential election by one month",
    verdict: "FALSE",
    summary:
      "No extension was announced. The commission published the timetable in its guidelines and it has not changed.",
    sources: [
      { title: "INEC", url: "https://inecnigeria.org" },
      { title: "TheCable", url: "https://www.thecable.ng" },
    ],
    channel: "telegram",
    timestamp: "2026-09-23T11:05:00.000Z",
  },
  {
    _id: "check-4",
    claim: "Voters can use their phone numbers to check their polling unit",
    verdict: "MISLEADING",
    summary:
      "INEC has a verification lookup, but it requires the registered voter number rather than a phone number, and it has been unstable under load.",
    sources: [{ title: "INEC", url: "https://inecnigeria.org" }],
    channel: "whatsapp",
    timestamp: "2026-09-22T14:20:00.000Z",
  },
  {
    _id: "check-5",
    claim: "The electoral commission has published the final list of presidential candidates",
    verdict: "VERIFIED",
    summary:
      "The list was published on 12 September 2026, signed by the chair, Rose Oriaran-Anthony. It carries 18 presidential tickets.",
    sources: [{ title: "INEC final list", url: "https://inecnigeria.org" }],
    channel: "whatsapp",
    timestamp: "2026-09-21T08:55:00.000Z",
  },
  {
    _id: "check-6",
    claim: "A former governor has been charged over a ₦2 billion cash seizure",
    verdict: "UNVERIFIED",
    summary:
      "Only one outlet reported this and we could not reach the court record or a second source. We will not label it either way on a single report.",
    sources: [{ title: "Daily Post", url: "https://dailypost.ng" }],
    channel: "web",
    timestamp: "2026-09-20T19:30:00.000Z",
  },
  {
    _id: "check-7",
    claim: "Nigeria is holding the largest election in the country's history in 2027",
    verdict: "VERIFIED",
    summary:
      "With close to 93 million registered voters on the 2026 register, the 2027 general election is the largest the country has run.",
    sources: [
      { title: "INEC", url: "https://inecnigeria.org" },
      { title: "Premium Times", url: "https://www.premiumtimesng.com" },
    ],
    channel: "whatsapp",
    timestamp: "2026-09-20T10:15:00.000Z",
  },
  {
    _id: "check-8",
    claim: "Results can now be declared from the handset app",
    verdict: "FALSE",
    summary:
      "The app is for results monitoring by observers. Results are declared at the collation centre by the presiding officer.",
    sources: [{ title: "Vanguard", url: "https://www.vanguardngr.com" }],
    channel: "telegram",
    timestamp: "2026-09-19T15:45:00.000Z",
  },
  {
    _id: "check-9",
    claim: "The national youth service duration has been reduced to five months",
    verdict: "UNVERIFIED",
    summary:
      "This has been reported by two outlets citing the same unnamed source, with no statement from the ministry. Not enough to call.",
    sources: [{ title: "Leadership", url: "https://leadership.ng" }],
    channel: "web",
    timestamp: "2026-09-18T13:00:00.000Z",
  },
];

/* ---------------------------------------------------------------------------
 * Local fact-check
 *
 * Stands in for POST /api/factcheck. It resolves from a small keyword table so the
 * interaction is real: the verdict changes with the claim, and the reasoning shown
 * is the reasoning for that verdict.
 *
 * The verdict is explicitly a sample. Presenting a canned answer as though a live
 * pipeline had researched it would be the dishonest version of this feature, so
 * the result carries `isSample: true` and the interface says so.
 * ------------------------------------------------------------------------ */

const RULES = [
  {
    match: /(minimum wage|wage)/i,
    verdict: "VERIFIED",
    summary:
      "The national minimum wage was adopted at ₦70,000 per month. State governments may set a higher figure, so a claim about a specific state is not answered by this.",
    sources: ["National Orientation Agency", "Premium Times"],
  },
  {
    match: /(subsidy|petrol|fuel price|pump price)/i,
    verdict: "FALSE",
    summary:
      "Prices vary by state and season and sit far above the figure in circulation. A fixed national price does not exist, so any specific litre price in the claim is wrong.",
    sources: ["Premium Times", "National Bureau of Statistics"],
  },
  {
    match: /(inec|electoral commission|polling unit|results sheet|ballot box)/i,
    verdict: "UNVERIFIED",
    summary:
      "This one turns on a document. We would need to read the commission's own published guidance for the relevant date, and we do not treat a forwarded screenshot of a timetable as sufficient.",
    sources: ["INEC"],
  },
  {
    match: /(army|soldier|police|court|charged|arrest)/i,
    verdict: "UNVERIFIED",
    summary:
      "Claims involving security agencies or court proceedings need a primary record before we label them. Without one, the honest verdict is that we cannot confirm it yet.",
    sources: [],
  },
  {
    match: /(rice|bag of rice)/i,
    verdict: "MISLEADING",
    summary:
      "The direction of the claim is right and the number is not. Prices have risen, but the figure quoted does not match any recent market report we can find.",
    sources: ["National Bureau of Statistics", "BusinessDay"],
  },
];

const FALLBACK = {
  verdict: "UNVERIFIED",
  summary:
    "Nothing in the sample index matches this claim closely enough to label it. In a live deployment this is where the retrieval step would run and the honest answer is usually that the claim cannot be confirmed yet.",
  sources: [],
};

/**
 * A named source becomes a link the reader can actually open.
 *
 * The rules above list sources by name only. Returning those strings unchanged was
 * the original bug here: <ResultPanel> reads `result.structured.sources` and links
 * each entry's `url`, so a bare string rendered an anchor with no href and the
 * whole Sources panel fell through to "no usable source was returned" on every
 * claim. Matching by name against the registry above keeps the rules readable
 * while still producing real, checkable links.
 */
function resolveSources(names = []) {
  return names.map((name) => {
    const match = SOURCES.find((source) => source.name.toLowerCase() === name.toLowerCase());

    // Unknown names are kept with a null url rather than filtered out. The
    // result panel then renders them as plain text with "not in registry" beside
    // it. Dropping them would make a verdict appear to rest on fewer sources
    // than it does, which is the one thing a fact-check page must never do.
    return match
      ? { title: match.name, url: match.baseUrl, site: match.name }
      : { title: name, url: null, site: "Not in the source registry" };
  });
}

/**
 * Confidence shown against a sample verdict.
 *
 * Deliberately low and fixed, and deliberately not a real number. A bundled
 * keyword rule has not read a single document, so any percentage here would be
 * invented precision on a page whose whole argument is that published numbers
 * should be traceable. These are presentation values for a demo.
 */
const DEMO_CONFIDENCE = { VERIFIED: 72, FALSE: 80, MISLEADING: 65, UNVERIFIED: 20 };

/**
 * @returns {{
 *   claim: string,
 *   verdict: string,
 *   summary: string,
 *   isSample: true,
 *   structured: {
 *     verdict: string,
 *     confidence: number,
 *     whatWeFound: string,
 *     sources: { title: string, url: string, site: string }[],
 *   },
 * }}
 */
export function runSampleFactCheck(claim = "") {
  const rule = RULES.find((entry) => entry.match.test(claim));
  const picked = rule || FALLBACK;

  return {
    claim,
    verdict: picked.verdict,
    summary: picked.summary,
    isSample: true,
    // The same envelope the real pipeline returns, so VerdictCard and the
    // sources list render through one code path and a live server can be wired
    // in later without touching the result panel.
    structured: {
      verdict: picked.verdict,
      confidence: DEMO_CONFIDENCE[picked.verdict] ?? 20,
      whatWeFound: picked.summary,
      sources: resolveSources(picked.sources),
    },
  };
}

export default { SOURCES, INCIDENTS, CHECKS, SAMPLE_NOTICE, runSampleFactCheck };