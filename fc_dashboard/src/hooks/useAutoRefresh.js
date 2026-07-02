import { useState, useEffect, useCallback, useRef } from "react";

export function useAutoRefresh(fetchFn, interval = 30000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, interval);
    return () => clearInterval(intervalRef.current);
  }, [load, interval]);

  return { data, loading, error, refetch: load };
}
