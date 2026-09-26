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
