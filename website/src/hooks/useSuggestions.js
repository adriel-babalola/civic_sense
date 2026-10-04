/**
 * Profile update suggestions.
 *
 * A SEPARATE STORE FROM INCIDENT REPORTS, and that separation is the whole point
 * of this file existing.
 *
 * An incident report is anonymous by design: no name, no per-person context,
 * nothing that could link whoever filed it to a place and a time. A profile
 * suggestion is the opposite: it is a claim about a named, living person, it
 * carries the name of the person it concerns, and it is reviewed against a
 * source before anything is published.
 *
 * Merging the two would have been easier and wrong in a specific way. One
 * shared list would have meant either suggestions inheriting anonymity, which
 * strips them of the accountability that makes a sourced claim checkable, or
 * incident reports inheriting a named subject, which breaks the one guarantee
 * the incident form is built on. Different key, different shape, different
 * review standard.
 *
 * As with the incident report, nothing is transmitted: there is no server in
 * this deployment. The confirmation says so rather than implying a researcher
 * is waiting for the submission.
 */

import { useCallback, useState } from "react";

const STORAGE_KEY = "civicsense.profileSuggestions";

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(suggestions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions));
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a profile suggestion, held in this browser.
 *
 * `person` is stored as a name and slug rather than a whole profile object. A
 * roster entry can be regenerated when INEC publishes a revised list, and a
 * stored copy of the old object would quietly disagree with the page it is
 * displayed on.
 */
export function useSubmitSuggestion() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (person, values) => {
    setIsSubmitting(true);
    setError(null);

    // Same reasoning as the incident form: an instant close reads as a click
    // that did nothing.
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const suggestion = {
        _id: `suggestion-local-${Date.now()}`,
        personId: person.id,
        personName: person.name,
        updateType: values.updateType,
        detail: values.detail.trim(),
        sourceUrl: values.sourceUrl.trim(),
        // Optional context, free text. Not an identity field and not one we ask
        // for: a source link is what gets a suggestion reviewed, not a name.
        note: (values.note || "").trim(),
        status: "pending",
        storedLocally: true,
        timestamp: new Date().toISOString(),
      };

      if (!write([suggestion, ...read()])) {
        throw new Error(
          "This browser refused to store the suggestion, most likely because storage is full or blocked.",
        );
      }

      return suggestion;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, error };
}

/** Everything stored in this browser. Used by the confirmation copy. */
export function getLocalSuggestions() {
  return read();
}

export default useSubmitSuggestion;