/** CivicSense website — formatting helpers. */

/**
 * Extract a verdict from free text.
 *
 * The pipeline returns both a structured verdict and a WhatsApp-formatted
 * string. Anything rendered from a stored `verdict` string has to be parsed,
 * and older records predate the structured field — so this is tolerant of
 * several shapes and always returns a known verdict.
 */
export function parseVerdict(text) {
  if (!text) return { verdict: "UNVERIFIED", evidence: "", source: "" };

  const match = String(text).match(/\b(VERIFIED|MISLEADING|FALSE|UNVERIFIED)\b/i);
  const verdict = (match?.[1] || "UNVERIFIED").toUpperCase();

  const evidence = String(text)
    .match(/\*?What we found:?\*?\s*([\s\S]*?)(?:\*?Source|\*?Evidence|$)/i)?.[1]
    ?.trim();

  const source = String(text)
    .match(/\*?Source:?\*?\s*([\s\S]+)/i)?.[1]
    ?.trim();

  return {
    verdict,
    evidence: evidence || "",
    source: source || "",
  };
}

/** Count verdicts across a list of fact-check records. */
export function countVerdicts(records) {
  const counts = { total: 0, VERIFIED: 0, MISLEADING: 0, FALSE: 0, UNVERIFIED: 0 };
  for (const record of records) {
    counts.total += 1;
    const { verdict } = parseVerdict(record?.verdict);
    if (verdict in counts) counts[verdict] += 1;
  }
  return counts;
}

/** "2h ago", "3d ago". Compact and unambiguous for a dense feed. */
export function relativeTime(value) {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";

  const units = [
    ["m", 60],
    ["h", 3600],
    ["d", 86400],
    ["w", 604800],
  ];

  let label = "m";
  let size = 60;
  for (const [unit, unitSeconds] of units) {
    if (seconds >= unitSeconds) {
      label = unit;
      size = unitSeconds;
    }
  }

  return `${Math.floor(seconds / size)}${label} ago`;
}

/** "26 Sep 2026". */
export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "26 Sep 2026, 14:32". */
export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${formatDate(value)}, ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** "4.2s" from a millisecond value. */
export function formatDuration(ms) {
  if (typeof ms !== "number" || Number.isNaN(ms)) return "n/a";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** "1,204". Keeps stat counters readable at a glance. */
export function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "n/a";
  return value.toLocaleString("en-US");
}

/** "3.4 MB" / "812 KB". */
export function formatBytes(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "58%" from a 0-100 confidence value. */
export function formatConfidence(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "n/a";
  return `${Math.round(value)}%`;
}

/** Trim to a word boundary and append an ellipsis. Never cuts mid-word. */
export function truncate(text, max = 120) {
  if (!text) return "";
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

/** "Tinubu" -> "TT". Used for avatar fallbacks. */
export function initials(name) {
  if (!name) return "?";
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** URL-safe slug, used for politician profile routes. */
export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve a source logo path from the registry.
 *
 * Exact name match, then a case-insensitive fallback. A miss returns `null` so
 * the caller renders initials rather than a broken image.
 */
export function getLogo(name, logos) {
  if (!name || !Array.isArray(logos)) return null;
  const base = import.meta.env.BASE_URL || "/";
  const exact = logos.find((logo) => logo.name === name);
  const loose = exact || logos.find((logo) => logo.name?.toLowerCase() === name.toLowerCase());
  return loose ? `${base}images/sources/${loose.file}.png` : null;
}

/** "3 days ago" -> ISO date, for report form start dates. */
export function toDateInputValue(date) {
  const iso = new Date(date).toISOString();
  return iso.slice(0, 10);
}
