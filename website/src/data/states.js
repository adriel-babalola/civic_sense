/**
 * Nigerian states, and the map geometry that goes with them.
 *
 * SCOPE NOTE — read before editing
 * --------------------------------
 * This module intentionally contains **states and coordinates only**.
 *
 * An earlier draft carried a full local-government-area roster. It was wrong:
 * entries were duplicated, and some states listed LGAs belonging to other
 * states. For a tool whose entire value is "this happened in this LGA",
 * plausible-but-invented geography is worse than an honest gap.
 *
 * So the LGA field is a text input with a datalist hook, and the canonical
 * roster is expected to be generated from the INEC gazette and dropped into
 * `src/data/lgas.js`. See documentation/ROADMAP.md, "Open data gaps".
 *
 * Coordinates are state-capital centroids. They place a marker when a report
 * carries no coordinates of its own, and are accurate enough for a
 * state/LGA-level civic map — they are not survey-grade.
 */

export const STATES = [
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
  "FCT (Abuja)",
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

/** Capital centroids, [lat, lng]. */
export const STATE_COORDS = {
  Abia: [5.45, 7.49],
  Adamawa: [9.33, 12.38],
  "Akwa Ibom": [5.0, 7.83],
  Anambra: [6.22, 6.94],
  Bauchi: [10.31, 9.84],
  Bayelsa: [4.77, 6.07],
  Benue: [7.73, 8.54],
  Borno: [11.83, 13.15],
  "Cross River": [5.87, 8.6],
  Delta: [5.5, 5.99],
  Ebonyi: [6.25, 8.1],
  Edo: [6.33, 5.6],
  Ekiti: [7.67, 5.25],
  Enugu: [6.44, 7.49],
  "FCT (Abuja)": [8.99, 7.18],
  Gombe: [10.27, 11.17],
  Imo: [5.48, 7.03],
  Jigawa: [12.0, 9.75],
  Kaduna: [10.52, 7.44],
  Kano: [12.0, 8.52],
  Katsina: [12.99, 7.6],
  Kebbi: [11.5, 4.0],
  Kogi: [7.8, 6.74],
  Kwara: [8.5, 4.55],
  Lagos: [6.52, 3.38],
  Nasarawa: [8.56, 7.71],
  Niger: [9.92, 6.95],
  Ogun: [7.16, 3.35],
  Ondo: [7.25, 5.2],
  Osun: [7.65, 4.56],
  Oyo: [8.16, 3.93],
  Plateau: [9.93, 8.89],
  Rivers: [4.82, 7.03],
  Sokoto: [13.06, 5.25],
  Taraba: [8.0, 10.52],
  Yobe: [11.75, 11.97],
  Zamfara: [12.17, 6.65],
};

/** Map bounds for Nigeria, used to fit the viewport on load. */
export const NIGERIA_BOUNDS = {
  southWest: [3.9, 2.4],
  northEast: [14.2, 15.2],
};

/**
 * The API stores the capital territory as "FCT". These keep the two naming
 * conventions from drifting across the boundary.
 */
export function toApiStateName(state) {
  if (!state) return "";
  return state === "FCT (Abuja)" ? "FCT" : state;
}

export function fromApiStateName(state) {
  if (!state) return "";
  return state === "FCT" ? "FCT (Abuja)" : state;
}

export function getCoords(state) {
  return STATE_COORDS[state] || STATE_COORDS[fromApiStateName(state)] || null;
}
