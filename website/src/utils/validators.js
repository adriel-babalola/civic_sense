/** CivicSense website — form validation. */

import { INCIDENT_TYPES } from "./constants";

/**
 * Each validator returns an error string, or an empty string when valid.
 * Rules live here rather than in components so the report form and the admin
 * moderation panel validate identically.
 */

const MIN_DESCRIPTION = 20;
const MAX_DESCRIPTION = 2000;

export function validateRequired(value, label) {
  if (!value || !String(value).trim()) return `${label} is required.`;
  return "";
}

export function validateIncidentType(value) {
  if (!value) return "Select what happened.";
  if (!INCIDENT_TYPES.includes(value)) return "Select a valid incident type.";
  return "";
}

export function validateDescription(value) {
  const text = String(value || "").trim();
  if (!text) return "Describe what happened.";
  if (text.length < MIN_DESCRIPTION) {
    return `Add a little more detail. At least ${MIN_DESCRIPTION} characters.`;
  }
  if (text.length > MAX_DESCRIPTION) {
    return `Keep it under ${MAX_DESCRIPTION} characters.`;
  }
  return "";
}

export function validateState(value) {
  if (!value) return "Select a state.";
  return "";
}

export function validateLga(value) {
  // Wording stays neutral: for states without a canonical roster the LGA is
  // typed, so "Select" would be wrong.
  if (!value) return "Local government area is required.";
  return "";
}

/* ---------------------------------------------------------------------------
 * Profile update suggestions
 *
 * A different form from the incident report, so different rules. The governing
 * constraint is that a profile is a sourced document: nothing appears on one
 * without a document behind it. So the source is not optional here, which is the
 * exact inverse of the incident report, where evidence is optional because the
 * reporter is the witness.
 * ------------------------------------------------------------------------- */

/** The kinds of change a profile suggestion can carry. */
export const UPDATE_TYPES = ["record", "correction", "statement", "photo", "other"];

/**
 * A URL that points at a document rather than at a page of someone's opinion.
 *
 * Only http and https. Rejecting `javascript:` is the point: this field is
 * rendered back to whoever reviews the queue, and a stored `javascript:` URL is
 * a stored script execution problem on whoever builds that view next.
 *
 * Deliberately permissive about the rest. Refusing a URL because the host looks
 * unfamiliar would block exactly the local newsroom or court record that is often
 * the only source for an entry. A wrong host is caught by a human; a blocked
 * legitimate source is lost.
 */
export function validateSourceUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "A source link is required. This is what we check the claim against.";
  if (text.length > 500) return "Keep the link under 500 characters.";

  let url;
  try {
    url = new URL(text);
  } catch {
    return "That does not look like a link. Include the https:// at the start.";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "Only http and https links can be opened.";
  }
  return "";
}

export function validateUpdateType(value) {
  if (!value) return "Say what kind of change this is.";
  if (!UPDATE_TYPES.includes(value)) return "Choose one of the listed kinds of change.";
  return "";
}

/**
 * What the change actually is.
 *
 * A separate validator from `validateDescription` even though the bounds are
 * similar, so the error text can name the thing being asked for. "Describe what
 * happened" is wrong here and would be actively confusing on a form about
 * editing a profile.
 */
export function validateUpdateDetail(value) {
  const text = String(value || "").trim();
  if (!text) return "Describe the change you are suggesting.";
  if (text.length < 20) return `Add a little more detail. At least 20 characters.`;
  if (text.length > MAX_DESCRIPTION) return `Keep it under ${MAX_DESCRIPTION} characters.`;
  return "";
}

/** Evidence is optional. Only its shape is checked when present. */
/**
 * Evidence attached to an incident report.
 *
 * Text, not a file. The server stores evidence as a string, so this validates a
 * description rather than an upload. `validateEvidenceFile` covers the
 * fact-check form, where the server does accept a multipart image.
 */
export function validateEvidenceText(value) {
  if (!value) return "";
  if (value.length > 500) return "Keep the description under 500 characters.";
  return "";
}

export function validateEvidenceFile(file, { maxBytes, acceptedTypes } = {}) {
  if (!file) return "";
  if (acceptedTypes?.length && !acceptedTypes.includes(file.type)) {
    return "Only JPEG, PNG, WebP or GIF images are supported.";
  }
  if (maxBytes && file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return `Image must be under ${mb} MB.`;
  }
  return "";
}

export function validatePassword(value) {
  if (!value) return "Enter the access password.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return "";
}

/**
 * Run a map of field name -> validator over a values object.
 * Returns `{ field: error }` containing only the fields that failed, plus
 * `firstError` for focusing the form.
 */
export function runValidators(values, validators) {
  const errors = {};
  for (const [field, validate] of Object.entries(validators)) {
    const error = validate(values[field], values);
    if (error) errors[field] = error;
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
}
