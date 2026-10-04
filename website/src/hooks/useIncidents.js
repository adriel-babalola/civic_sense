/**
 * Incident map data, with client-side filtering.
 *
 * Read from ./data/demo-data.js rather than fetched. The site is a static
 * bundle, so a request for GET /api/incidents had no server behind it and the
 * map rendered an error instead of a map. Filtering, the legend counts, the
 * marker list and the viewport all still come from here, so restoring the API is
 * only a change to the first import in this file.
 */

import { useCallback, useMemo, useState } from "react";
import { INCIDENTS } from "../data/demo-data";
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

export function useIncidents() {
  const [type, setType] = useState(ALL);
  const [state, setState] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // An `_id` is assigned once and kept, so a selected incident stays selected
  // across a filter change. The derivation is deterministic, which is what makes
  // that possible without a server-provided key.
  const incidents = useMemo(
    () =>
      INCIDENTS.map((incident) => ({
        ...incident,
        id: incident._id || incident.id || incidentKey(incident),
      })),
    [],
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
    isLoading: false,
    // No request, so there is no transport failure to surface. Everything that
    // can still go wrong on this page is a render error, which React handles.
    error: null,
    updatedAt: null,
    refresh: () => {},
    reload: () => {},
    filters: { type, setType, state, setState, dateFrom, setDateFrom, dateTo, setDateTo, reset },
    view: { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM },
  };
}

export default useIncidents;