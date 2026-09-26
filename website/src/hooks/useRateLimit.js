/**
 * Client-side submission throttle.
 *
 * The report form is anonymous on purpose, which means there is no account to
 * rate-limit against. This keeps a single browser from flooding the moderation
 * queue. It is a courtesy throttle, not a control: the real limit has to be on
 * the server, keyed by IP, before this handles real submissions.
 *
 * The counter lives in `localStorage` so closing the tab does not reset it. If
 * storage is unavailable the hook degrades to in-memory for the session.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "../config/config";

const STORAGE_KEY = "civicsense.report.submissions";

function readTimestamps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "number") : [];
  } catch {
    return [];
  }
}

function writeTimestamps(timestamps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
    return true;
  } catch {
    return false;
  }
}

export function useRateLimit({ max = CONFIG.REPORT_LIMIT.max, windowMs = CONFIG.REPORT_LIMIT.windowMs } = {}) {
  const [timestamps, setTimestamps] = useState(() => readTimestamps());

  // Drop expired entries when the window rolls forward.
  //
  // The timer matters: without it the counter only re-evaluates when something
  // else re-renders, so a visitor who hits the limit would stay blocked after
  // the window passed until they reloaded the page.
  const timerRef = useRef(null);
  useEffect(() => {
    const now = Date.now();
    const live = timestamps.filter((t) => now - t < windowMs);
    if (live.length !== timestamps.length) {
      setTimestamps(live);
      writeTimestamps(live);
      return;
    }

    if (!live.length || timerRef.current) return undefined;
    const wait = live[0] + windowMs - now;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setTimestamps(readTimestamps());
    }, wait + 50);

    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [timestamps, windowMs]);

  const inWindow = timestamps.length;
  const remaining = Math.max(0, max - inWindow);
  const isLimited = remaining === 0;

  // Earliest moment a slot frees up, for the countdown.
  const resetsAt = timestamps.length > 0 ? timestamps[0] + windowMs : null;

  const record = useCallback(() => {
    const next = [...readTimestamps(), Date.now()];
    setTimestamps(next);
    // If storage is blocked we still want the in-memory count for this session.
    writeTimestamps(next);
  }, []);

  return { record, isLimited, remaining, inWindow, max, resetsAt };
}

export default useRateLimit;
