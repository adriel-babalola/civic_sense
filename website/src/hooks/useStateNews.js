import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONFIG } from "../config/config";

/**
 * Live news grouped by Nigerian state, for the incident map.
 *
 * Reads GET /api/incidents/map, which returns each state that has recent
 * scraped stories with the newest few attached. The map page falls back to its
 * bundled sample incidents when this returns nothing, so the page still shows a
 * map and a list with the backend down.
 *
 * The fetch is deliberately silent on failure: a news API that is down is not a
 * reason to render an error on a public page, it is a reason to show less.
 */
export function useStateNews({ days = 0, perState = 5, maxStates = 20 } = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  const load = useCallback(async () => {
    const apiBase = CONFIG.API_BASE_URL || "";
    const params = new URLSearchParams({
      days: String(days),
      perState: String(perState),
      states: String(maxStates),
    });
    try {
      setIsLoading(true);
      const res = await fetch(`${apiBase}/api/incidents/map?${params.toString()}`);
      if (!res.ok) throw new Error(`Map request failed (${res.status})`);
      const json = await res.json();
      if (cancelledRef.current) return;
      if (json?.success && Array.isArray(json.data?.states)) {
        setData(json.data);
        setError(null);
      } else {
        throw new Error("Map response was malformed");
      }
    } catch (err) {
      if (!cancelledRef.current) setError(err);
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  }, [days, perState, maxStates]);

  useEffect(() => {
    cancelledRef.current = false;
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  const states = useMemo(() => data?.states || [], [data]);

  /** Look-ups keyed by state name, including the FCT alias. */
  const byState = useMemo(() => {
    const map = new Map();
    for (const entry of states) {
      if (!entry?.state) continue;
      map.set(entry.state, entry);
      if (entry.state === "FCT") map.set("FCT (Abuja)", entry);
    }
    return map;
  }, [states]);

  return {
    states,
    byState,
    isLoading,
    error,
    updatedAt: data?.updatedAt || null,
    hasLiveData: states.length > 0,
    reload: load,
  };
}

export default useStateNews;
