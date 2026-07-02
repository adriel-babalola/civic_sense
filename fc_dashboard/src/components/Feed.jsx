import { useEffect, useState, useCallback, useRef } from "react";
import { API_BASE } from "../config";
import FactCheckCard from "./FactCheckCard";
import SkeletonCard from "./SkeletonCard";

export default function Feed({ skip = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchChecks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/factchecks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecks();
    intervalRef.current = setInterval(fetchChecks, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchChecks]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
          Recent Fact-Checks
        </h2>
        <button
          onClick={fetchChecks}
          className="text-xs text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-[#141414] rounded-xl p-6 border border-[#1E1E1E] text-center">
          <p className="text-sm text-[#EF4444] mb-3">
            Could not load fact-checks
          </p>
          <p className="text-xs text-[#6B7280] mb-4">{error}</p>
          <button
            onClick={fetchChecks}
            className="text-sm text-[#A1A1AA] hover:text-white underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="bg-[#141414] rounded-xl p-10 border border-[#1E1E1E] text-center">
          <p className="text-sm text-[#6B7280]">
            No fact-checks yet. Send a claim to the WhatsApp bot to get started.
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="space-y-3">
          {data.slice(skip).map((item) => (
            <FactCheckCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
