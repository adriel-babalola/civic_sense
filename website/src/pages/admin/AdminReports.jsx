import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ExternalLink,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../../components/shared/Button";
import { StatusBadge, TypeBadge } from "../../components/shared/Badge";
import { fetchAdminReports, updateAdminReportStatus } from "../../services/adminApi";
import { STATES } from "../../data/states";

const TABS = [
  { key: "", label: "All Submissions" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [actioningId, setActioningId] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminReports({
        status: activeTab,
        type: typeFilter,
        state: stateFilter,
      });
      setReports(res.reports || []);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab, typeFilter, stateFilter]);

  const handleUpdateStatus = async (id, status) => {
    setActioningId(id);
    try {
      await updateAdminReportStatus(id, status);
      // Optimistically update local state
      setReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      if (activeTab && activeTab !== status) {
        setReports((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Incident Reports Queue</h1>
          <p className="mt-0.5 text-xs text-fg-muted">
            Moderate crowdsourced election and civic incident reports before they appear on the public map.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadReports}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw size={12} />
          Refresh
        </Button>
      </div>

      {/* Tabs & Filters bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#121212] p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const count = counts[tab.key || "total"];
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "bg-white/[0.1] text-white shadow-xs"
                    : "text-fg-muted hover:bg-white/[0.04] hover:text-white",
                )}
              >
                <span>{tab.label}</span>
                {typeof count === "number" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-2xs font-semibold",
                      selected ? "bg-white/[0.15] text-white" : "bg-white/[0.05] text-fg-faint",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Incident Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="cs-field h-8 rounded-lg bg-[#181818] px-2.5 text-xs text-white"
          >
            <option value="">All Categories</option>
            <option value="violence">Violence / Disruptions</option>
            <option value="misconduct">Electoral Misconduct</option>
            <option value="unrest">Civil Unrest</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="cs-field h-8 rounded-lg bg-[#181818] px-2.5 text-xs text-white max-w-[140px]"
          >
            <option value="">All 36 States</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table / Card List */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#121212] shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-fg-faint">
            Loading incident reports…
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 size={24} className="mx-auto text-emerald-400" />
            <p className="mt-2 text-sm font-medium text-white">No reports found</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {activeTab
                ? `No submissions currently marked as "${activeTab}".`
                : "The incident queue is completely empty."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {reports.map((report) => {
              const isActioning = actioningId === report._id;

              return (
                <div
                  key={report._id}
                  className="p-4 transition-colors hover:bg-white/[0.01] sm:p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeBadge type={report.type} size="sm" />
                      <StatusBadge status={report.status} size="sm" />
                      <span className="flex items-center gap-1 text-xs font-semibold text-white">
                        <MapPin size={12} className="text-brand" />
                        {report.state} {report.lga ? `· ${report.lga}` : ""}
                      </span>
                    </div>

                    <span className="text-2xs text-fg-faint">
                      {new Date(report.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="mt-2.5 text-sm leading-relaxed text-fg-secondary">
                    {report.description}
                  </p>

                  <div className="mt-4 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {report.evidenceUrl ? (
                        <a
                          href={report.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
                        >
                          <span>View submitted evidence link</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-fg-faint">No external evidence link provided</span>
                      )}
                    </div>

                    {/* Moderation Actions */}
                    <div className="flex items-center gap-2">
                      {report.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateStatus(report._id, "rejected")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X size={13} />
                          Reject
                        </button>
                      )}

                      {report.status !== "approved" && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateStatus(report._id, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-50"
                        >
                          <Check size={13} />
                          Approve (Publish to Map)
                        </button>
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
  );
}

export default AdminReports;
