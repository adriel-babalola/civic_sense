import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Filter,
  Globe,
  ListChecks,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/shared/Button";
import { VerdictBadge } from "../../components/shared/Badge";
import { fetchAdminClaims } from "../../services/adminApi";

export function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [total, setTotal] = useState(0);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminClaims({
        search,
        verdict: verdictFilter,
        channel: channelFilter,
      });
      setClaims(res.claims || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Error loading claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadClaims, 250);
    return () => clearTimeout(timer);
  }, [search, verdictFilter, channelFilter]);

  const getChannelIcon = (channel) => {
    switch (channel?.toLowerCase()) {
      case "whatsapp":
        return <MessageSquare size={13} className="text-emerald-400" />;
      case "telegram":
        return <Send size={13} className="text-sky-400" />;
      default:
        return <Globe size={13} className="text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Fact-Checks Claims Inspector</h1>
          <p className="mt-0.5 text-xs text-fg-muted">
            Audit AI fact-checks processed across WhatsApp, Telegram, and the Web platform.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadClaims}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw size={12} />
          Refresh
        </Button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#121212] p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claims, keywords, or topics…"
            className="cs-field h-9 w-full pl-9 pr-3 text-xs placeholder:text-fg-faint"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          {/* Verdict Filter */}
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="cs-field h-9 rounded-lg bg-[#181818] px-2.5 text-xs text-white"
          >
            <option value="">All Verdicts</option>
            <option value="VERIFIED">Verified</option>
            <option value="FALSE">False</option>
            <option value="MISLEADING">Misleading</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="cs-field h-9 rounded-lg bg-[#181818] px-2.5 text-xs text-white"
          >
            <option value="">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="web">Web</option>
          </select>
        </div>
      </div>

      {/* Claims List */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#121212] shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-fg-faint">
            Searching fact-check records…
          </div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center">
            <ListChecks size={24} className="mx-auto text-fg-faint" />
            <p className="mt-2 text-sm font-medium text-white">No claims matched</p>
            <p className="mt-0.5 text-xs text-fg-muted">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {claims.map((item) => (
              <div
                key={item._id}
                className="p-4 transition-colors hover:bg-white/[0.01] sm:p-5"
              >
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <VerdictBadge verdict={item.verdict} size="sm" />
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-2xs font-medium text-fg-secondary">
                      {getChannelIcon(item.channel)}
                      <span className="capitalize">{item.channel || "Web"}</span>
                    </span>
                  </div>

                  <span className="text-2xs text-fg-faint">
                    {new Date(item.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Claim Text */}
                <h3 className="mt-2.5 text-sm font-semibold text-white leading-snug">
                  "{item.claim}"
                </h3>

                {/* AI Evidence Explanation */}
                {item.evidence && (
                  <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-xs text-fg-secondary">
                    <div className="mb-1 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-fg-muted">
                      <Sparkles size={11} className="text-brand" />
                      Verification Evidence
                    </div>
                    <p className="leading-relaxed">{item.evidence}</p>
                  </div>
                )}

                {/* Cited Sources */}
                {Array.isArray(item.sources) && item.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-2xs text-fg-faint">Sources:</span>
                    {item.sources.map((src, idx) => {
                      let hostname = src;
                      try {
                        hostname = new URL(src).hostname.replace(/^www\./, "");
                      } catch {
                        // Keep raw string if not a valid URL
                      }
                      return (
                        <a
                          key={idx}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-2xs font-medium text-fg-muted transition-colors hover:border-brand/40 hover:text-white"
                        >
                          <span>{hostname}</span>
                          <ExternalLink size={9} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClaims;
