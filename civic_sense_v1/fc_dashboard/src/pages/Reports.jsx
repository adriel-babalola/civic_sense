import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE } from "../config";
import { RefreshCw, Check, X, ExternalLink, Flag, Shield, AlertTriangle, Eye } from "lucide-react";

const STATUS_TABS = [
  { value: null, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TYPE_STYLES = {
  violence: { badge: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20", label: "Violence" },
  misconduct: { badge: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20", label: "Misconduct" },
  unrest: { badge: "bg-[#E8650A]/10 text-[#E8650A] border-[#E8650A]/20", label: "Unrest" },
};

const STATUS_STYLES = {
  pending: "text-[#F59E0B] bg-[#F59E0B]/10",
  approved: "text-[#10B981] bg-[#10B981]/10",
  rejected: "text-[#EF4444] bg-[#EF4444]/10",
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [selected, setSelected] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const q = filter ? `?status=${filter}` : "";
      const res = await fetch(`${API_BASE}/api/reports${q}`);
      const json = await res.json();
      setReports(json.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleApprove(id) {
    await fetch(`${API_BASE}/api/reports/${id}/approve`, { method: "PATCH" });
    refresh();
  }

  async function handleReject(id) {
    await fetch(`${API_BASE}/api/reports/${id}/reject`, { method: "PATCH" });
    refresh();
  }

  const counts = useMemo(() => {
    const c = { total: reports.length, pending: 0, approved: 0, rejected: 0 };
    reports.forEach((r) => { if (c[r.status] !== undefined) c[r.status]++; });
    return c;
  }, [reports]);

  const STAT_CARDS = [
    { key: "total", icon: Flag, label: "Total Reports", color: "text-white" },
    { key: "pending", icon: AlertTriangle, label: "Pending Review", color: "text-[#F59E0B]" },
    { key: "approved", icon: Shield, label: "Approved", color: "text-[#10B981]" },
    { key: "rejected", icon: X, label: "Rejected", color: "text-[#EF4444]" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-[#1E1E1E] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Anonymous Reports</h1>
            <p className="text-xs text-[#6B7280]">
              Review and approve community-submitted reports
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      <div className="border-b border-[#1E1E1E] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto flex gap-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilter(tab.value)}
              className={`px-3 sm:px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                filter === tab.value
                  ? "text-white border-[#22C55E]"
                  : "text-[#6B7280] border-transparent hover:text-[#A1A1AA]"
              }`}
            >
              {tab.label}
              {tab.value && counts[tab.value] > 0 && (
                <span className="ml-1.5 text-[10px] text-[#6B7280]">({counts[tab.value]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-[#1E1E1E] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_CARDS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="bg-[#141414] rounded-xl border border-[#1E1E1E] p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} className={s.color} />
                  <span className="text-[10px] sm:text-[11px] text-[#6B7280] uppercase tracking-wider">{s.label}</span>
                </div>
                <span className={`text-xl sm:text-2xl font-bold ${s.color}`}>{counts[s.key]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-[1100px] mx-auto">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#141414] border border-[#1E1E1E] rounded-xl p-5 h-20">
                  <div className="skeleton-shimmer rounded h-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div className="bg-[#141414] rounded-xl border border-[#1E1E1E] p-12 text-center">
              <p className="text-sm text-[#6B7280]">No reports found.</p>
            </div>
          )}

          {!loading && reports.length > 0 && (
            <div className="space-y-3">
              {reports.map((r) => {
                const ts = TYPE_STYLES[r.type] || TYPE_STYLES.unrest;
                const ss = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                const date = r.timestamp
                  ? new Date(r.timestamp).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })
                  : "";

                return (
                  <div
                    key={r._id}
                    className="bg-[#141414] rounded-xl border border-[#1E1E1E] hover:border-[#333] transition-colors overflow-hidden"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                            <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${ts.badge}`}>
                              {ts.label}
                            </span>
                            <span className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md ${ss}`}>
                              {r.status}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-[#6B7280]">{date}</span>
                          </div>
                          <p className="text-sm text-[#A1A1AA] leading-relaxed mb-2">
                            {r.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
                            <span className="text-[#A1A1AA] font-medium">{r.state}</span>
                            <span className="text-[#333] hidden sm:inline">|</span>
                            <span>{r.lga}</span>
                            {r.evidence && (
                              <a
                                href={r.evidence}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[#3B82F6] hover:underline"
                              >
                                <ExternalLink size={10} />
                                Evidence
                              </a>
                            )}
                          </div>
                        </div>

                        {r.status === "pending" && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleApprove(r._id)}
                              className="p-2 rounded-lg text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(r._id)}
                              className="p-2 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
