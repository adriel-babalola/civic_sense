/** Report submission and moderation actions. */

import { useCallback, useState } from "react";
import {
  approveReport,
  getReports,
  rejectReport,
  submitReport,
} from "../services/api";
import { useAsync } from "./useAsync";
import { toApiStateName } from "../data/states";

/** Create an anonymous report. */
export function useSubmitReport() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (values) => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await submitReport({
        type: values.type,
        description: values.description.trim(),
        state: toApiStateName(values.state),
        lga: values.lga.trim(),
        // The server stores evidence as a string (Report.evidence is a String
        // field), so this must be text. A File serialised to "{}" and was
        // written to the database as two meaningless characters.
        evidence: (values.evidence || "").trim(),
      });
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, error };
}

/**
 * The moderation queue.
 *
 * @param {string} status Optional filter, matching the Report status enum.
 */
export function useReports(status, { intervalMs = 0 } = {}) {
  const [pending, setPending] = useState({});
  const [actionError, setActionError] = useState(null);

  const { data, error, isLoading, refresh, reload } = useAsync(
    (signal) => getReports(status || undefined, signal),
    { intervalMs },
  );

  const reports = data || [];

  const runAction = useCallback(
    async (id, action) => {
      setPending((prev) => ({ ...prev, [id]: action }));
      setActionError(null);
      try {
        const updated = action === "approve" ? await approveReport(id) : await rejectReport(id);
        // Reflect the change immediately rather than waiting for the next poll.
        await refresh();
        return updated;
      } catch (err) {
        setActionError(err);
        return null;
      } finally {
        setPending((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [refresh],
  );

  const counts = useCallback(
    (list) => ({
      pending: list.filter((r) => r.status === "pending").length,
      approved: list.filter((r) => r.status === "approved").length,
      rejected: list.filter((r) => r.status === "rejected").length,
    }),
    [],
  );

  return {
    reports,
    counts: counts(reports),
    isLoading,
    error: error || actionError,
    pendingId: Object.keys(pending)[0] || null,
    pendingAction: Object.values(pending)[0] || null,
    approve: (id) => runAction(id, "approve"),
    reject: (id) => runAction(id, "reject"),
    refresh,
    reload,
  };
}

export default useReports;
