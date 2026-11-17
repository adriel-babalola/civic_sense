/**
 * Nigerian state detection for scraped news.
 *
 * WHY THIS EXISTS
 *
 * The incident map pins news to a state. The RSS feeds give us a title and a
 * body; neither carries a structured location. So the location is inferred from
 * the text, and the inference has to be conservative: a dateline-free story that
 * merely mentions "Lagos" in passing is not a Lagos story, and pinning it to
 * Lagos puts a real incident in the wrong place on a map read by real people.
 *
 * Design rules:
 *   1. Match on word boundaries. "Niger" (the state) must not match "Nigeria",
 *      and "Kano" must not match "Kanoon". \b handles both because the
 *      surrounding characters are word characters.
 *   2. Prefer the full official state name. City aliases only add a state when
 *      the state is not already named, and every alias is a place that is
 *      unambiguously in exactly one state.
 *   3. Return every state mentioned, in order of first appearance, so a story
 *      spanning a border is honest about both rather than picking one.
 *
 * The state list mirrors website/src/data/states.js. `FCT` is stored as "FCT"
 * server-side; the website maps it to "FCT (Abuja)" at the boundary.
 */

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

/**
 * Place names that occur in news copy and unambiguously belong to one state.
 * Kept deliberately short and unambiguous: no "North", no regional terms.
 * Keys are matched case-insensitively on word boundaries.
 */
const ALIASES = {
  "port harcourt": "Rivers",
  "ph": null, // too ambiguous (abbreviation of many things) — explicitly ignored
  "abuja": "FCT",
  "federal capital territory": "FCT",
  "jos": "Plateau",
  "bukuru": "Plateau",
  "maiduguri": "Borno",
  "ibadan": "Oyo",
  "benin city": "Edo",
  "warri": "Delta",
  "asaba": "Delta",
  "onitsha": "Anambra",
  "awka": "Anambra",
  "nnewi": "Anambra",
  "aba": "Abia",
  "umuahia": "Abia",
  "owerri": "Imo",
  "calabar": "Cross River",
  "uyo": "Akwa Ibom",
  "yola": "Adamawa",
  "makurdi": "Benue",
  "lokoja": "Kogi",
  "ilorin": "Kwara",
  "minna": "Niger",
  "damaturu": "Yobe",
  "gusau": "Zamfara",
  "birnin kebbi": "Kebbi",
  "dutse": "Jigawa",
  "lafia": "Nasarawa",
  "jalingo": "Taraba",
  "yenagoa": "Bayelsa",
  "abeokuta": "Ogun",
  "akure": "Ondo",
  "ado ekiti": "Ekiti",
  "ado-ekiti": "Ekiti",
  "osogbo": "Osun",
  "lekki": "Lagos",
  "ikeja": "Lagos",
  "victoria island": "Lagos",
  "yaba": "Lagos",
  "sokoto": "Sokoto",
  "katsina": "Katsina",
  "gombe": "Gombe",
  "bauchi": "Bauchi",
  "kaduna": "Kaduna",
  "kano": "Kano",
  "enugu": "Enugu",
  "osogbo township": "Osun",
};

const STOP_PHRASES = new Set([
  // Guard against a word that is also an English word creeping in.
  "niger delta", // refers to the region, not the state, when phrased this way
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMatcher(term) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(term.toLowerCase())}([^a-z0-9]|$)`, "i");
}

// Pre-compile matchers once. Each entry is { state, regex, weight }.
const STATE_MATCHERS = NIGERIAN_STATES.map((state) => ({
  state,
  regex: buildMatcher(state),
  weight: 2,
}));

const ALIAS_MATCHERS = Object.entries(ALIASES)
  .filter(([, state]) => Boolean(state))
  .map(([alias, state]) => ({
    state,
    regex: buildMatcher(alias),
    weight: 1,
  }));

/**
 * Detect every Nigerian state named in `text`.
 *
 * @param {string} text
 * @param {{ max?: number }} [options]
 * @returns {string[]} state names, deduped, in order of first appearance.
 */
export function detectStates(text, { max = 4 } = {}) {
  const haystack = String(text || "");
  if (!haystack.trim()) return [];

  // First appearance position for ordering, and the best weight seen per state.
  const found = new Map();

  for (const matcher of [...STATE_MATCHERS, ...ALIAS_MATCHERS]) {
    const match = matcher.regex.exec(haystack);
    if (!match) continue;

    const index = match.index;
    const existing = found.get(matcher.state);
    if (!existing) {
      found.set(matcher.state, { index, weight: matcher.weight });
    } else if (matcher.weight > existing.weight) {
      existing.weight = matcher.weight;
    }
  }

  const ordered = [...found.entries()]
    .sort((a, b) => a[1].index - b[1].index)
    .map(([state]) => state);

  return disambiguateNiger(ordered, haystack).slice(0, Math.max(1, max));
}

/**
 * "Niger" is both a Nigerian state and a neighbouring country, and the country
 * is in the news for coups and diplomacy constantly. Only allow the state when
 * the copy says so, or when the country markers are absent.
 */
function disambiguateNiger(states, haystack) {
  if (!states.includes("Niger")) return states;
  const saysState = /\bniger\s+state\b/i.test(haystack);
  const saysCountry = /\b(niger republic|republic of niger|nigerien|niger's junta|niamey)\b/i.test(haystack);
  if (saysCountry && !saysState) return states.filter((s) => s !== "Niger");
  return states;
}

/**
 * A single best state for a story, or null when none is named.
 *
 * The first state named wins. That is wrong for a story about two states, which
 * is why detectStates() returns all of them and the article keeps the full list;
 * this is only the convenience field the map groups on.
 */
export function detectPrimaryState(text, options) {
  const states = detectStates(text, options);
  return states.length ? states[0] : null;
}

/**
 * Combine the fields we actually search (title + snippet + body) into one string.
 * Kept here so scraper.js and any backfill script agree on what counts.
 */
export function articleText(article = {}) {
  return [article.title, article.snippet, article.content].filter(Boolean).join("\n");
}

export default { NIGERIAN_STATES, detectStates, detectPrimaryState, articleText };
