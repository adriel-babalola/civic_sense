/**
 * LGA roster — intentionally empty.
 *
 * Populate from the INEC gazette of local governments, one array per state,
 * before the report form is used in a live election. Expected shape:
 *
 *   export const LGAS = {
 *     Lagos: ["Ajeromi-Ifelodun", "Alimosho"],
 *     "FCT (Abuja)": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Municipal"],
 *   };
 *
 * `components/reports/ReportForm.jsx` already reads this: a state present here
 * renders a filtered dropdown, a state absent here falls back to a text input.
 * Nothing in the components needs to change when the data lands.
 *
 * Keys must match `STATES` in ./states.js exactly.
 */

export const LGAS = {};

/** True when a canonical roster exists for the state. */
export function hasLgaRoster(state) {
  return Array.isArray(LGAS[state]) && LGAS[state].length > 0;
}

export function getLgas(state) {
  return LGAS[state] || [];
}

export default LGAS;
