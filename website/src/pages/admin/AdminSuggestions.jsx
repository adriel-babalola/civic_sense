import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  FileEdit,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../../components/shared/Button";
import { StatusBadge } from "../../components/shared/Badge";
import { fetchAdminSuggestions, updateAdminSuggestionStatus } from "../../services/adminApi";

const TABS = [
  { key: "", label: "All Corrections" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [actioningId, setActioningId] = useState(null);
  const [reviewNoteInput, setReviewNoteInput] = useState({});

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminSuggestions({ status: activeTab });
      setSuggestions(res.suggestions || []);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      console.error("Error loading suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [activeTab]);

  const handleAction = async (id, status) => {
    setActioningId(id);
    const note = reviewNoteInput[id] || "";
    try {
      await updateAdminSuggestionStatus(id, { status, reviewNotes: note });
      setSuggestions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status, reviewNotes: note } : s))
      );
      if (activeTab && activeTab !== status) {
        setSuggestions((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Error updating suggestion:", err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Politician Adjustments Review</h1>
          <p className="mt-0.5 text-xs text-fg-muted">
            Audit crowdsourced profile corrections and evidence citations submitted by citizens.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadSuggestions}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw size={12} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-[#121212] p-2 shadow-sm">
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

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#121212] shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-fg-faint">
            Loading correction suggestions…
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 size={24} className="mx-auto text-emerald-400" />
            <p className="mt-2 text-sm font-medium text-white">No suggestions in queue</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {activeTab
                ? `No submissions currently marked as "${activeTab}".`
                : "The adjustments queue is clear."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {suggestions.map((item) => {
              const isActioning = actioningId === item._id;

              return (
                <div
                  key={item._id}
                  className="p-4 transition-colors hover:bg-white/[0.01] sm:p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <User size={13} className="text-brand" />
                        {item.politicianName}
                      </span>
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-2xs font-medium uppercase tracking-wide text-fg-secondary">
                        Section: {item.field || "general"}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <span className="text-2xs text-fg-faint">
                      {new Date(item.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Proposed adjustment text */}
                  <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                    <div className="text-2xs font-semibold uppercase tracking-wider text-fg-muted">
                      Suggested Correction:
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-white">
                      {item.suggestedText}
                    </p>
                  </div>

                  {/* Source evidence */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-2xs text-fg-faint">Citation Link:</span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                    >
                      <span className="truncate max-w-xs">{item.sourceUrl}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  {/* Actions & review notes */}
                  <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.04] pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 max-w-md">
                      {item.status === "pending" ? (
                        <input
                          type="text"
                          placeholder="Optional review note / reason…"
                          value={reviewNoteInput[item._id] || ""}
                          onChange={(e) =>
                            setReviewNoteInput({ ...reviewNoteInput, [item._id]: e.target.value })
                          }
                          className="cs-field h-8 w-full text-xs placeholder:text-fg-faint"
                        />
                      ) : (
                        item.reviewNotes && (
                          <p className="text-xs text-fg-faint italic">
                            Reviewer note: "{item.reviewNotes}"
                          </p>
                        )
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleAction(item._id, "rejected")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <X size={13} />
                          Reject
                        </button>
                      )}

                      {item.status !== "approved" && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleAction(item._id, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-50"
                        >
                          <Check size={13} />
                          Approve Correction
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

export default AdminSuggestions;
