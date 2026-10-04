/**
 * Report submission.
 *
 * Reports are written to this browser's localStorage instead of POSTed to
 * /api/reports. The site is deployed as static files, so that request had no
 * server behind it and every submission failed with a transport error on a page
 * whose entire purpose is to accept a report from someone standing at a polling
 * unit. A demo that cannot receive its own form is not a demo of the product.
 *
 * WHAT THIS DOES AND DOES NOT DO
 *
 * It stores the report, and it shows the same confirmation the real flow would.
 * It does not send it anywhere, and nothing is moderated, because there is no
 * server. The confirmation says so rather than claiming a report was filed,
 * since telling someone their report is with a moderator when it is sitting in
 * their own browser would be the worst possible outcome for a form like this.
 *
 * Swapping this back is one function: replace the localStorage write with the
 * POST. Validation is untouched.
 */

import { useCallback, useState } from "react";

const STORAGE_KEY = "civicsense.reports";

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(reports) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return true;
  } catch {
    // A private-mode quota failure must not read as a successful submission.
    return false;
  }
}

/** Create an anonymous report, held in this browser. */
export function useSubmitReport() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (values) => {
    setIsSubmitting(true);
    setError(null);

    // Small delay so the pending state is visible. The real pipeline takes
    // seconds, and a button that snaps shut reads as a click that did nothing.
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const report = {
        _id: `local-${Date.now()}`,
        type: values.type,
        description: values.description.trim(),
        state: values.state,
        lga: values.lga.trim(),
        // Evidence stays a string, as on the server: Report.evidence is a String
        // field, and a File serialised to "{}" would be stored as two
        // meaningless characters.
        evidence: (values.evidence || "").trim(),
        status: "pending",
        storedLocally: true,
        timestamp: new Date().toISOString(),
      };

      if (!write([report, ...read()])) {
        throw new Error(
          "This browser refused to store the report, most likely because storage is full or blocked.",
        );
      }

      return report;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, error };
}

/** Everything stored in this browser. Used by the demo confirmation copy. */
export function getLocalReports() {
  return read();
}

export default useSubmitReport;