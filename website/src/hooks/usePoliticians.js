/** Politician directory search, filtering, sorting and view mode. */

import { useCallback, useMemo, useState } from "react";
import { UNIQUE_POLITICIANS, getParties, PRESIDENTIAL, RUNNING_MATE } from "../data/politicians";
import { slugify } from "../utils/formatters";

const ALL = "all";

/** Grid is the default: it is what the directory was designed around. */
export const VIEWS = {
  grid: "grid",
  list: "list",
};

const VIEW_KEY = "civicsense.politicians.view";

/**
 * Remembered view preference.
 *
 * Reading localStorage during render would break under server rendering and throw
 * on a privacy setting that blocks storage, so the stored value is read once on
 * mount and a failure just means the default stands.
 */
function readStoredView() {
  try {
    return localStorage.getItem(VIEW_KEY) === VIEWS.list ? VIEWS.list : VIEWS.grid;
  } catch {
    return VIEWS.grid;
  }
}

export const ROLES = {
  [PRESIDENTIAL]: "Presidential candidate",
  [RUNNING_MATE]: "Running mate",
};

const SORTS = {
  name: { label: "Name (A-Z)", compare: (a, b) => a.name.localeCompare(b.name) },
  party: { label: "Party (A-Z)", compare: (a, b) => a.party.localeCompare(b.party) },
  // Presidential candidates first: that is the question most visitors arrive with.
  role: {
    label: "Role",
    compare: (a, b) =>
      Number(b.role === PRESIDENTIAL) - Number(a.role === PRESIDENTIAL) ||
      a.name.localeCompare(b.name),
  },
  age: { label: "Age (youngest first)", compare: (a, b) => (a.age ?? 999) - (b.age ?? 999) },
};

export function usePoliticians() {
  const [query, setQuery] = useState("");
  const [party, setParty] = useState(ALL);
  const [role, setRole] = useState(ALL);
  const [sort, setSort] = useState("role");
  const [view, setViewState] = useState(readStoredView);

  const parties = useMemo(() => getParties(), []);

  const setView = useCallback((next) => {
    setViewState(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Storage blocked or full. The preference is a nicety, not state worth
      // breaking the control over.
    }
  }, []);

  /**
   * Counts shown against each party chip.
   *
   * Computed across the whole directory rather than the filtered set, so the
   * number beside a party is how many of that party exist rather than how many
   * survive the filters you are currently looking at. The second number would
   * shrink as you filter and read as a bug.
   */
  const partyCounts = useMemo(() => {
    const counts = {};
    for (const person of UNIQUE_POLITICIANS) {
      counts[person.party] = (counts[person.party] || 0) + 1;
    }
    return counts;
  }, []);

  /**
   * Role totals across the whole directory, ignoring the role filter itself.
   * Counting from the filtered set would make each toggle shrink the other
   * option, which reads as a bug.
   */
  const roleTotals = useMemo(() => {
    const counts = { [PRESIDENTIAL]: 0, [RUNNING_MATE]: 0 };
    for (const person of UNIQUE_POLITICIANS) counts[person.role] += 1;
    return counts;
  }, []);

  const results = useMemo(() => {
    const needle = slugify(query);
    const tokens = needle ? needle.split("-").filter(Boolean) : [];

    return UNIQUE_POLITICIANS.filter((person) => {
      if (party !== ALL && person.party !== party) return false;
      if (role !== ALL && person.role !== role) return false;
      if (tokens.length === 0) return true;

      // Every token must appear somewhere in the record, so "tinubu apc"
      // narrows rather than widens.
      const haystack = slugify(
        [
          person.name,
          person.office,
          person.party,
          person.partyName,
          person.bio,
          person.runningMate.name,
        ].join(" "),
      );
      return tokens.every((token) => haystack.includes(token));
    }).sort(SORTS[sort]?.compare ?? SORTS.role.compare);
  }, [query, party, role, sort]);

  const filters = useMemo(
    () => ({
      isFiltered: Boolean(query) || party !== ALL || role !== ALL,
      /** Human-readable summary of what is narrowing the list, for the sticky bar. */
      activeLabels: [
        party !== ALL ? party : null,
        role !== ALL ? ROLES[role] : null,
      ].filter(Boolean),
      reset: () => {
        setQuery("");
        setParty(ALL);
        setRole(ALL);
      },
    }),
    [query, party, role],
  );

  return {
    results,
    total: UNIQUE_POLITICIANS.length,
    parties,
    partyCounts,
    roleTotals,
    sorts: Object.entries(SORTS).map(([value, { label }]) => ({ value, label })),
    query,
    setQuery,
    party,
    setParty,
    role,
    setRole,
    sort,
    setSort,
    view,
    setView,
    ...filters,
  };
}

export default usePoliticians;
