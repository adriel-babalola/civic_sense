import { RefreshCw } from "lucide-react";
import { API_BASE } from "../config";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import FactCheckCard from "./FactCheckCard";

async function fetchChecks() {
  const res = await fetch(`${API_BASE}/api/factchecks`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export default function FeedPanel() {
  const { data, loading, error, refetch } = useAutoRefresh(fetchChecks, 30000);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white/80">
          Recent checks{" "}
          <span className="text-gray-500 font-normal">
            ({data.length})
          </span>
        </h2>
        <button
          onClick={refetch}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading fact-checks...</p>
          </div>
        )}

        {error && (
          <div className="bg-false/10 border border-false/20 rounded-xl p-4 text-center">
            <p className="text-xs text-false">{error}</p>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">
              No fact-checks yet. Send a claim to the WhatsApp bot or type one in the chat panel.
            </p>
          </div>
        )}

        {!loading &&
          data.map((item) => (
            <FactCheckCard key={item._id} item={item} />
          ))}
      </div>
    </div>
  );
}
