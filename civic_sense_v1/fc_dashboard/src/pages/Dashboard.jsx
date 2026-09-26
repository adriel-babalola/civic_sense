import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE, WHATSAPP_NUMBER } from "../config";
import StatsRow from "../components/StatsRow";
import FactCheckCard from "../components/FactCheckCard";
import FactCheckModal from "../components/FactCheckModal";
import SkeletonCard from "../components/SkeletonCard";
import { parseVerdict } from "../utils/parseVerdict";
import {
  Activity,
  Shield,
  TrendingUp,
  Newspaper,
  Clock,
  Zap,
  PlusCircle,
  Smartphone,
  Download,
  RefreshCw,
  QrCode,
} from "lucide-react";

function computeActivity(items) {
  const map = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    map[d.toISOString().split("T")[0]] = 0;
  }
  items.forEach((item) => {
    if (item.timestamp) {
      const key = new Date(item.timestamp).toISOString().split("T")[0];
      if (map[key] !== undefined) map[key]++;
    }
  });
  return Object.values(map);
}

function computeTrending(items) {
  const freq = {};
  items.forEach((item) => {
    const words = item.claim.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words[i] + " " + words[i + 1];
      if (
        phrase.length > 4 &&
        !/^(the |a |an |in |of |to |is |and |for |on |at |by |it )/.test(phrase)
      ) {
        freq[phrase] = (freq[phrase] || 0) + 1;
      }
    }
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

function computeSources(items) {
  const freq = {};
  items.forEach((item) => {
    const p = parseVerdict(item.verdict);
    const src =
      p.source?.replace(/https?:\/\/[^\s]+/g, "").trim() || "Unknown";
    if (src && src !== "Unknown" && src.length > 1) {
      freq[src] = (freq[src] || 0) + 1;
    }
  });
  const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, c]) => s + c, 0);
  return entries.slice(0, 3).map(([name, count]) => ({
    name,
    count,
    pct: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    VERIFIED: 0,
    MISLEADING: 0,
    FALSE: 0,
    UNVERIFIED: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/factchecks`);
      const json = await res.json();
      const data = json.data || [];
      setItems(data);
      const c = {
        total: data.length,
        VERIFIED: 0,
        MISLEADING: 0,
        FALSE: 0,
        UNVERIFIED: 0,
      };
      data.forEach((item) => {
        const m = item.verdict?.match(/\*VERDICT:\s*(\w+)/);
        const v = m?.[1];
        if (c[v] !== undefined) c[v]++;
      });
      setCounts(c);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const activityData = useMemo(() => computeActivity(items), [items]);
  const maxActivity = Math.max(...activityData, 1);
  const trending = useMemo(() => computeTrending(items), [items]);
  const sources = useMemo(() => computeSources(items), [items]);

  const latest = items[0] || null;
  const lastCheckTime = latest?.timestamp
    ? (() => {
        const diff = Math.floor(
          (Date.now() - new Date(latest.timestamp).getTime()) / 60000
        );
        return diff < 1 ? "Just now" : `${diff} min ago`;
      })()
    : "N/A";

  const todayCount = items.filter((item) => {
    if (!item.timestamp) return false;
    return Date.now() - new Date(item.timestamp).getTime() < 86400000;
  }).length;

  async function exportCSV() {
    try {
      const res = await fetch(`${API_BASE}/api/factchecks`);
      const json = await res.json();
      const data = json.data || [];
      const rows = [["Claim", "Verdict", "Evidence", "Source", "Timestamp"]];
      data.forEach((item) => {
        const p = parseVerdict(item.verdict);
        rows.push([
          `"${(item.claim || "").replace(/"/g, '""')}"`,
          p.verdict,
          `"${(p.evidence || "").replace(/"/g, '""')}"`,
          `"${(p.source || "").replace(/"/g, '""')}"`,
          item.timestamp || "",
        ]);
      });
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "civicsense-factchecks.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  function openWhatsApp() {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}`,
      "_blank"
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-[1100px] mx-auto space-y-6">

          {/* Stats Row */}
          <StatsRow counts={counts} />

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#1E1E1E]">
            <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mr-0.5">
              Quick Actions
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#141414] border border-white/[0.06] rounded-lg hover:border-white/20 text-[#A1A1AA] hover:text-white transition-all"
            >
              <PlusCircle size={13} />
              New Fact-Check
            </button>
            <button
              onClick={openWhatsApp}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#141414] border border-white/[0.06] rounded-lg hover:border-white/20 text-[#A1A1AA] hover:text-white transition-all"
            >
              <Smartphone size={13} />
              Send to WhatsApp
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#141414] border border-white/[0.06] rounded-lg hover:border-white/20 text-[#A1A1AA] hover:text-white transition-all"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>

          {/* Main Grid: Center Feed + Right Sticky Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Center Column (2/3) — Feed */}
            <div className="lg:col-span-2 space-y-4">

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Latest Fact-Checks
                </h2>
                <button
                  onClick={refresh}
                  className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>

              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="bg-[#141414] rounded-xl border border-[#1E1E1E] p-12 text-center">
                  <p className="text-sm text-[#6B7280] mb-1">
                    No fact-checks yet.
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    Send a claim to the WhatsApp bot to get started.
                  </p>
                </div>
              )}

              {!loading &&
                items.map((item, i) => (
                  <FactCheckCard key={item._id} item={item} first={i === 0} />
                ))}

            </div>

            {/* Right Column (1/3) — Sticky Widgets */}
            <aside className="lg:col-span-1 space-y-3 lg:sticky lg:top-6">

              {/* System Status */}
              <div className="bg-[#141414] rounded-xl p-4 border border-[#1E1E1E]">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={13} className="text-[#22C55E]" />
                  <h3 className="text-xs font-medium text-[#A1A1AA]">
                    System Status
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                  <div>
                    <span className="text-[10px] text-[#6B7280] block">
                      Status
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#10B981]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      Operational
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] block">
                      Avg Response
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#A1A1AA]">
                      <Zap size={11} />
                      ~12s
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] block">
                      Last Check
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#A1A1AA]">
                      <Clock size={11} />
                      {lastCheckTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6B7280] block">
                      WhatsApp
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#10B981]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      Connected
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity (compact) */}
              <div className="bg-[#141414] rounded-xl p-4 border border-[#1E1E1E]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity size={13} className="text-[#10B981]" />
                    <h3 className="text-xs font-medium text-[#A1A1AA]">
                      7-Day Activity
                    </h3>
                  </div>
                  {todayCount > 0 && (
                    <span className="text-[10px] font-medium text-[#10B981]">
                      +{todayCount} today
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1 h-12">
                  {activityData.map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#10B981] rounded-sm transition-all duration-500"
                      style={{
                        height: `${(val / maxActivity) * 100}%`,
                        opacity: 0.3 + (i / activityData.length) * 0.7,
                        minHeight: val > 0 ? "3px" : "1px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Trending Claims (compact) */}
              <div className="bg-[#141414] rounded-xl p-4 border border-[#1E1E1E]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={13} className="text-[#F59E0B]" />
                  <h3 className="text-xs font-medium text-[#A1A1AA]">
                    Trending
                  </h3>
                </div>
                {trending.length > 0 ? (
                  <div className="space-y-1.5">
                    {trending.map(([phrase, count], i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-[#A1A1AA] truncate max-w-[140px]">
                          <span className="text-[#6B7280] mr-1.5">
                            {i + 1}.
                          </span>
                          &ldquo;{phrase}&rdquo;
                        </span>
                        <span className="text-[10px] text-[#6B7280] shrink-0">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280]">Not enough data.</p>
                )}
              </div>

              {/* Sources (compact) */}
              <div className="bg-[#141414] rounded-xl p-4 border border-[#1E1E1E]">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper size={13} className="text-[#3B82F6]" />
                  <h3 className="text-xs font-medium text-[#A1A1AA]">
                    Sources
                  </h3>
                </div>
                {sources.length > 0 ? (
                  <div className="space-y-1">
                    {sources.map((src, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-[#A1A1AA] truncate max-w-[160px]">
                          {src.name}
                        </span>
                        <span className="text-[10px] text-[#6B7280] shrink-0">
                          {src.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280]">Not enough data.</p>
                )}
              </div>

            </aside>

          </div>
        </div>
      </div>

      <FactCheckModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
