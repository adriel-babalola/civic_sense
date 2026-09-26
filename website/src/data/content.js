/**
 * Sample verdicts shown on the home page.
 *
 * These illustrate the format the pipeline returns. They are illustrative, not
 * live output — the home page must never present a stored example as a real
 * result, so the block is labelled as a sample in the UI.
 */

export const SAMPLE_VERDICTS = [
  {
    claim: "The federal government removed the fuel subsidy in May 2023.",
    verdict: "VERIFIED",
    source: "Premium Times, The Cable",
    summary:
      "The removal was announced in the inaugural address on 29 May 2023 and took effect immediately. Pump prices rose the same week.",
  },
  {
    claim: "Nigeria's external debt has crossed ₦100 trillion.",
    verdict: "VERIFIED",
    source: "Debt Management Office, BusinessDay",
    summary:
      "Figures published by the Debt Management Office put total public debt above ₦100 trillion in 2024, a rise of over 60% in two years.",
  },
  {
    claim: "The new minimum wage is ₦70,000 per month.",
    verdict: "VERIFIED",
    source: "National Orientation Agency, Premium Times",
    summary:
      "The National Council of States approved ₦70,000 as the new national minimum wage, with state governments empowered to set their own higher figure.",
  },
  {
    claim: "Petrol now sells for ₦200 per litre nationwide.",
    verdict: "FALSE",
    source: "NBS, Premium Times",
    summary:
      "Pump prices vary by state and have generally settled between ₦700 and ₦900 per litre. ₦200 was not observed anywhere as the going rate.",
  },
  {
    claim: "The minimum wage was raised to ₦30,000 in 2024.",
    verdict: "MISLEADING",
    source: "Premium Times",
    summary:
      "The ₦30,000 figure is real but it was the 2019 figure, repealed and replaced in 2024. The claim is technically true and practically misleading.",
  },
  {
    claim: "A former INEC chairman has been appointed to a cabinet position.",
    verdict: "UNVERIFIED",
    source: "No reliable source found",
    summary:
      "No credible outlet or official statement confirming this was found. Treat it as unconfirmed until a primary source appears.",
  },
];

/** The three headline products, in priority order. */
/**
 * The three product cards.
 *
 * `flag` names the switch in config/config.js that controls the surface, so
 * turning a feature off in one place hides the card, the header link and the
 * route together. The ids are content keys and are deliberately not the same
 * strings as the config keys.
 */
export const FEATURES = [
  {
    id: "factcheck",
    flag: "webFactCheck",
    title: "Check before you believe",
    body: "Send a rumour to WhatsApp and get a sourced verdict in under 30 seconds. Send a screenshot and the bot reads the claim out of the image.",
    href: "/fact-check",
    cta: "Check a claim",
    accent: "verified",
  },
  {
    id: "profiles",
    flag: "politicians",
    title: "Know who decides",
    body: "A searchable record of office-holders and what has been documented about them, so a promise made before an election does not vanish after it.",
    href: "/politicians",
    cta: "Browse records",
    accent: "brand",
  },
  {
    id: "reports",
    flag: "reports",
    title: "Speak up, safely",
    body: "Report violence, malpractice or unrest where it happens. No name, no account, no trail. Verified reports go on the public map.",
    href: "/report",
    cta: "File a report",
    accent: "misleading",
  },
];

/** How the product works. Three steps, no more. */
export const STEPS = [
  {
    title: "Send what you were told",
    body: "Forward a message, a poster screenshot, or a news clip to the CivicSense number on WhatsApp. It reads the claim out of an image too.",
  },
  {
    title: "We check it against reporting",
    body: "The claim is matched against a local index of Nigerian newsrooms, live search, and a curated civic reference set.",
  },
  {
    title: "You decide for yourself",
    body: "VERIFIED, FALSE, MISLEADING or UNVERIFIED, with the evidence and a link to every source. The answer comes with the reporting attached, not instead of it.",
  },
];

export const TRUST_POINTS = [
  {
    title: "No account",
    body: "No app, no sign-up, no email. A chat message is the whole interface, so it works on any phone.",
  },
  {
    title: "No tracking",
    body: "No analytics, no advertising pixels, no third-party scripts. We do not build a profile of you.",
  },
  {
    title: "Sources shown",
    body: "Every verdict lists the reporting it came from. Check our work.",
  },
  {
    title: "Anonymous reporting",
    body: "The report form has no field that could identify you, and images are stripped of location metadata before upload.",
  },
];

/** The newsrooms and fact-checkers the index is built from. */
/**
 * Logo for each source in the server's RSS registry.
 *
 * The `name` values must match `NEWS_SOURCES` in server/services/newsSources.js
 * exactly — the lookup is an equality match, and a near-miss silently drops the
 * logo. Files live in public/images/sources and are all served from this
 * origin, so listing our sources does not send a visit to 17 newsrooms.
 */
export const SOURCE_LOGOS = [
  { name: "Premium Times", file: "premiumtimes" },
  { name: "The Punch", file: "punch" },
  { name: "Vanguard", file: "vanguard" },
  { name: "Daily Trust", file: "dailytrust" },
  { name: "Leadership", file: "leadership" },
  { name: "Channels TV", file: "channels" },
  { name: "Daily Post", file: "dailypost" },
  { name: "Nigerian Tribune", file: "tribune" },
  { name: "BusinessDay", file: "businessday" },
  { name: "PM News", file: "pmnews" },
  { name: "Ripples Nigeria", file: "ripples" },
  { name: "Information Nigeria", file: "informationng" },
  { name: "TheCable", file: "thecable" },
  { name: "The Guardian Nigeria", file: "guardian" },
  { name: "Dubawa", file: "dubawa" },
  { name: "FactCheckHub", file: "factcheckhub" },
  { name: "FactCheck Africa", file: "factcheckafrica" },
];;
