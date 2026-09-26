/**
 * Generic async data hook.
 *
 * Every remote read in the app has the same shape — load, refresh, cancel on
 * unmount, poll on an interval — so it lives in one place rather than being
 * reimplemented per page.
 */

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @template T
 * @param {() => Promise<T>} fetcher
 * @param {{ intervalMs?: number, enabled?: boolean, initialData?: T }} options
 */
export function useAsync(fetcher, { intervalMs = 0, enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const [updatedAt, setUpdatedAt] = useState(null);

  // Keeps the polling effect from re-running when the caller passes an inline
  // arrow function, which is the normal case.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      setUpdatedAt(Date.now());
    } catch (err) {
      // A failed poll should not wipe data already on screen; the banner is
      // enough to tell the user it is stale.
      setError(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    // The fetcher receives the signal through its own closure, so cancellation
    // is best-effort: we ignore the result if the component has gone away.
    let active = true;

    (async () => {
      try {
        const result = await fetcherRef.current(controller.signal);
        if (active) {
          setData(result);
          setError(null);
          setUpdatedAt(Date.now());
        }
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    let timer = null;
    if (intervalMs > 0) {
      timer = setInterval(() => {
        if (active) run({ silent: true });
      }, intervalMs);
    }

    return () => {
      active = false;
      controller.abort();
      if (timer) clearInterval(timer);
    };
  }, [enabled, intervalMs, run]);

  return {
    data,
    error,
    isLoading,
    updatedAt,
    refresh: () => run({ silent: true }),
    reload: () => run(),
    setData,
  };
}

export default useAsync;
