import { useState, useEffect, useCallback } from "react";
import { MessageCircle, CheckCircle, XCircle, AlertTriangle, HelpCircle, RefreshCw } from "lucide-react";
import { API_BASE, WHATSAPP_NUMBER } from "../config";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import FactCheckCard from "../components/FactCheckCard";

async function fetchChecks() {
  const res = await fetch(`${API_BASE}/api/factchecks`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

const STAT_ICONS = {
  VERIFIED: CheckCircle,
  FALSE: XCircle,
  MISLEADING: AlertTriangle,
  UNVERIFIED: HelpCircle,
};

const STAT_COLORS = {
  VERIFIED: "text-verified border-verified/20 bg-verified/5",
  FALSE: "text-false border-false/20 bg-false/5",
  MISLEADING: "text-misleading border-misleading/20 bg-misleading/5",
  UNVERIFIED: "text-unverified border-unverified/20 bg-unverified/5",
};

export default function Dashboard() {
  const { data, loading, error, refetch } = useAutoRefresh(fetchChecks, 30000);
  const [counts, setCounts] = useState({ total: 0, VERIFIED: 0, FALSE: 0, MISLEADING: 0, UNVERIFIED: 0 });

  useEffect(() => {
    const c = { total: data.length, VERIFIED: 0, FALSE: 0, MISLEADING: 0, UNVERIFIED: 0 };
    data.forEach((item) => {
      const m = item.verdict?.match(/\*VERDICT:\s*(\w+)/);
      const v = m?.[1];
      if (c[v] !== undefined) c[v]++;
    });
    setCounts(c);
  }, [data]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-[11px] text-gray-500 mb-5 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live fact-checking
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="gradient-text">CivicSense</span>
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Send a rumour. Get the truth back.
          </p>
          <div className="inline-flex items-center gap-2.5 mt-5 px-4 py-2 rounded-xl glass-card">
            <MessageCircle size={16} className="text-accent" />
            <span className="text-sm text-gray-400">{WHATSAPP_NUMBER}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="md:col-span-1 glass-card rounded-2xl p-4 glow-green">
            <p className="text-2xl md:text-3xl font-bold gradient-text-green">
              {counts.total}
            </p>
            <p className="text-[11px] text-gray-600 mt-1 uppercase tracking-wide">
              Total
            </p>
          </div>
          {["VERIFIED", "MISLEADING", "FALSE", "UNVERIFIED"].map((k) => {
            const Icon = STAT_ICONS[k];
            return (
              <div key={k} className={`glass-card rounded-2xl p-4 ${STAT_COLORS[k]}`}>
                <div className="flex items-center gap-1.5">
                  <Icon size={14} />
                  <p className="text-xl md:text-2xl font-bold">{counts[k]}</p>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 uppercase tracking-wide">
                  {k === "MISLEADING" ? "misleading" : k.toLowerCase()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Feed */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Recent fact-checks
          </h2>
          <button
            onClick={refetch}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/[0.03] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="text-center py-16">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">Loading fact-checks...</p>
            </div>
          )}

          {error && (
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-sm text-false">Could not load fact-checks: {error}</p>
              <button onClick={refetch} className="mt-3 text-xs text-accent hover:underline">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <MessageCircle size={32} className="mx-auto text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">
                No fact-checks yet. Send a claim to {WHATSAPP_NUMBER} on WhatsApp or use{" "}
                <a href="/chat" className="text-accent hover:underline">Ask Kratos</a>.
              </p>
            </div>
          )}

          {!loading &&
            data.map((item) => (
              <FactCheckCard key={item._id} item={item} />
            ))}
        </div>

        <footer className="text-center mt-12 pb-4">
          <p className="text-[11px] text-gray-700">
            Built for BuildVerse 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
