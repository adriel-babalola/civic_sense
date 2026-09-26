/** Incident map data, with client-side filtering and a bounded history. */

import { useCallback, useMemo, useState } from "react";
import { useAsync } from "./useAsync";
import { getIncidents } from "../services/api";
import { CONFIG } from "../config/config";
import { getCoords, fromApiStateName } from "../data/states";
import { ALL } from "../utils/constants";

/**
 * Deterministic identity for an incident the server sent without one.
 * Two reports about the same thing in the same place at the same moment are the
 * same row as far as the map is concerned.
 */
function incidentKey({ type, state, lga, timestamp, description }) {
  return [type, state, lga, timestamp, description].join("|");
}

/** Default map viewport: Nigeria, a little zoomed out for context. */
const DEFAULT_CENTER = [9.08, 8.68];
const DEFAULT_ZOOM = 6;

export function useIncidents({ intervalMs = CONFIG.POLL_INTERVAL_MS } = {}) {
  const [type, setType] = useState(ALL);
  const [state, setState] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, error, isLoading, updatedAt, refresh, reload } = useAsync(
    (signal) => getIncidents(signal),
    { intervalMs },
  );

  // The server sends no identifier: `GET /api/incidents` merges hard-coded
  // seed rows with approved reports and returns only type, description, state,
  // lga, evidence and timestamp. Without a stable key React cannot list them
  // and a selected incident can never be matched back to its card, so derive
  // one from the fields that do identify it. The value is deterministic, so a
  // poll that returns the same incident keeps its selection.
  const incidents = useMemo(
    () =>
      (data || []).map((incident) => ({
        ...incident,
        id: incident._id || incident.id || incidentKey(incident),
      })),
    [data],
  );

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return incidents.filter((incident) => {
      if (type !== ALL && incident.type !== type) return false;
      if (state !== ALL && fromApiStateName(incident.state) !== state) return false;
      if (from !== null || to !== null) {
        const at = new Date(incident.timestamp).getTime();
        if (Number.isNaN(at)) return false;
        if (from !== null && at < from) return false;
        if (to !== null && at > to) return false;
      }
      return true;
    });
  }, [incidents, type, state, dateFrom, dateTo]);

  /** Incidents that have usable coordinates, ready to plot. */
  const markers = useMemo(
    () =>
      filtered
        .map((incident) => {
          const coords = getCoords(incident.state);
          return coords ? { ...incident, coords } : null;
        })
        .filter(Boolean),
    [filtered],
  );

  const counts = useMemo(
    () => ({
      total: incidents.length,
      violence: incidents.filter((i) => i.type === "violence").length,
      misconduct: incidents.filter((i) => i.type === "misconduct").length,
      unrest: incidents.filter((i) => i.type === "unrest").length,
    }),
    [incidents],
  );

  /** States actually represented in the data, so the filter offers real options. */
  const availableStates = useMemo(
    () => [...new Set(incidents.map((i) => fromApiStateName(i.state)).filter(Boolean))].sort(),
    [incidents],
  );

  const reset = useCallback(() => {
    setType(ALL);
    setState(ALL);
    setDateFrom("");
    setDateTo("");
  }, []);

  return {
    incidents: filtered,
    markers,
    counts,
    availableStates,
    isLoading,
    error,
    updatedAt,
    refresh,
    reload,
    filters: { type, setType, state, setState, dateFrom, setDateFrom, dateTo, setDateTo, reset },
    view: { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM },
  };
}

export default useIncidents;
