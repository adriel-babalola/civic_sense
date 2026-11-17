import { ELECTION_CALENDAR_2027 } from "../data/electionCalendar2027.js";

/**
 * Format a JavaScript Date into an iCalendar UTC timestamp (YYYYMMDDTHHMMSSZ).
 */
function formatIcsTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Escape text for iCalendar RFC 5545 compliance (backslash escaping).
 */
function escapeIcsText(str = "") {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Add whole days to a YYYY-MM-DD date using UTC arithmetic. */
function addDaysIso(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * RFC 5545 folds content lines longer than 75 octets onto continuation lines
 * beginning with a space. Google and Outlook are strict about this on long
 * DESCRIPTION lines; without folding a feed can be dropped as malformed.
 */
function foldLine(line, limit = 75) {
  if (line.length <= limit) return line;
  const chunks = [line.slice(0, limit)];
  let rest = line.slice(limit);
  while (rest.length > 0) {
    chunks.push(` ${rest.slice(0, limit - 1)}`);
    rest = rest.slice(limit - 1);
  }
  return chunks.join("\r\n");
}

/**
 * Generate full RFC 5545 iCalendar (.ics) string with Apple / iOS extensions.
 */
export function generateIcsCalendar(events = ELECTION_CALENDAR_2027) {
  const dtstamp = formatIcsTimestamp();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CivicSense//Nigeria 2027 Election Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Nigeria 2027 General Elections",
    "X-WR-CALDESC:Official and statutory dates for Nigeria's 2027 General Elections, verified by CivicSense (https://civicsense.fyi).",
    "X-WR-TIMEZONE:Africa/Lagos",
    "X-APPLE-CALENDAR-COLOR:#008751", // Nigerian green
  ];

  for (const event of events) {
    const cleanStart = event.date.replace(/-/g, "");
    let cleanEnd = (event.endDate || event.date).replace(/-/g, "");

    // DTEND is exclusive, so an all-day event ends the day after its last day.
    // UTC arithmetic keeps this identical on a server in any timezone.
    if (!event.timeStart) {
      cleanEnd = addDaysIso(event.endDate || event.date, 1).replace(/-/g, "");
    }

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}-2027@civicsense.fyi`);
    lines.push(`DTSTAMP:${dtstamp}`);

    if (event.timeStart) {
      const sTime = event.timeStart.replace(/:/g, "");
      const eTime = (event.timeEnd || "143000").replace(/:/g, "");
      lines.push(`DTSTART;TZID=Africa/Lagos:${cleanStart}T${sTime}`);
      lines.push(`DTEND;TZID=Africa/Lagos:${cleanEnd}T${eTime}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${cleanStart}`);
      lines.push(`DTEND;VALUE=DATE:${cleanEnd}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
    lines.push(
      `DESCRIPTION:${escapeIcsText(
        `${event.description}\n\nLegal Basis: ${event.legalBasis || "Electoral Act 2022"}\nVerified by CivicSense: https://civicsense.fyi/calendar`
      )}`
    );
    lines.push(`LOCATION:${escapeIcsText(event.location || "Nigeria")}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:TRANSPARENT");

    // Alarms / Notifications (e.g. 1 day before, 1 week before)
    const alarms = event.alarms || [1];
    for (const days of alarms) {
      lines.push("BEGIN:VALARM");
      if (days === 0) {
        lines.push("TRIGGER:-PT1H"); // 1 hour before
      } else {
        lines.push(`TRIGGER:-P${days}D`);
      }
      lines.push("ACTION:DISPLAY");
      lines.push(
        `DESCRIPTION:${escapeIcsText(
          `Upcoming: ${event.title} (${event.date}). Ensure your PVC and voting details are ready!`
        )}`
      );
      lines.push("END:VALARM");
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  // RFC 5545: CRLF line endings, long lines folded, and a trailing CRLF.
  // Note the arrow: `lines.map(foldLine)` would pass the index as the fold
  // limit and hang the request.
  return `${lines.map((line) => foldLine(line)).join("\r\n")}\r\n`;
}
