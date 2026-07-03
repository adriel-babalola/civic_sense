import { useState } from "react";
import { MapPin, X, ExternalLink, RefreshCw, Newspaper } from "lucide-react";

const INITIAL_FEEDS = [
  { id: 1, headline: "APC primary election turns violent in Igabi LGA, Kaduna", source: "Daily Post", date: "2026-05-16", type: "violence" },
  { id: 2, headline: "Police station set ablaze in Isan-Ekiti hours before governorship election", source: "Premium Times", date: "2026-06-19", type: "unrest" },
  { id: 3, headline: "Political thugs kill three near Government House in Kano", source: "Daily Trust", date: "2026-05-06", type: "violence" },
  { id: 4, headline: "Boko Haram JAS faction launches deadly attacks in Borno", source: "HumAngle", date: "2026-01-15", type: "violence" },
  { id: 5, headline: "CSO warns of rising pre-election violence in Osun State", source: "Daily Post", date: "2026-06-25", type: "unrest" },
  { id: 6, headline: "By-election marred by voter intimidation in Enugu North", source: "Punch", date: "2026-06-20", type: "misconduct" },
  { id: 7, headline: "Low turnout marks Zuru State Constituency by-election in Kebbi", source: "The Nation", date: "2026-06-20", type: "misconduct" },
  { id: 8, headline: "NDC boycotts by-election in Dawakin Kudu over security fears", source: "Vanguard", date: "2026-06-20", type: "unrest" },
  { id: 9, headline: "Bandits expand operations into Kwara and Kano states", source: "Guardian", date: "2026-02-12", type: "violence" },
  { id: 10, headline: "BVAS malfunction disrupts voting in Nasarawa by-election", source: "Premium Times", date: "2026-06-20", type: "misconduct" },
  { id: 11, headline: "4654 casualties recorded nationwide in 2025 — report", source: "Nextier", date: "2026-02-12", type: "violence" },
  { id: 12, headline: "Ekiti governorship election peaceful despite isolated incidents", source: "Channels TV", date: "2026-06-20", type: "misconduct" },
  { id: 13, headline: "Farmers-herder clashes rise 50% in North-Central Nigeria", source: "ICIR", date: "2026-01-20", type: "violence" },
  { id: 14, headline: "Kidnapping surges with 3141 victims recorded in 2025", source: "Guardian", date: "2026-02-12", type: "violence" },
  { id: 15, headline: "Political tension escalates ahead of 2027 general elections", source: "ThisDay", date: "2026-06-15", type: "unrest" },
];

const TYPE_STYLES = {
  violence: { badge: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20", label: "Violence" },
  misconduct: { badge: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20", label: "Misconduct" },
  unrest: { badge: "bg-[#E8650A]/10 text-[#E8650A] border-[#E8650A]/20", label: "Unrest" },
};

export default function ConflictTracker() {
  const [feeds, setFeeds] = useState(INITIAL_FEEDS);
  const [filter, setFilter] = useState("all");

  function removeFeed(id) {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
  }

  function resetFeeds() {
    setFeeds(INITIAL_FEEDS);
  }

  const filtered = filter === "all" ? feeds : feeds.filter((f) => f.type === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-[#1E1E1E] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Conflict Tracker</h1>
            <p className="text-xs text-[#6B7280]">
              RSS-style feed of verified incidents across Nigeria
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-[#141414] rounded-lg border border-[#1E1E1E] p-0.5">
              {["all", "violence", "misconduct", "unrest"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    filter === t ? "bg-[#1E1E1E] text-white" : "text-[#6B7280] hover:text-[#A1A1AA]"
                  }`}
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={resetFeeds}
              className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
              title="Reset feeds"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-[1100px] mx-auto">
          {filtered.length === 0 && (
            <div className="bg-[#141414] rounded-xl border border-[#1E1E1E] p-12 text-center">
              <p className="text-sm text-[#6B7280]">No feeds match this filter.</p>
              <button
                onClick={resetFeeds}
                className="mt-3 text-xs text-[#22C55E] hover:underline"
              >
                Reset all feeds
              </button>
            </div>
          )}

          <div className="space-y-2">
            {filtered.map((feed) => {
              const ts = TYPE_STYLES[feed.type] || TYPE_STYLES.unrest;
              return (
                <div
                  key={feed.id}
                  className="bg-[#141414] rounded-xl border border-[#1E1E1E] px-5 py-4 flex items-start gap-4 hover:border-[#333] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] flex items-center justify-center shrink-0 mt-0.5">
                    <Newspaper size={14} className="text-[#6B7280]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${ts.badge}`}>
                        {ts.label}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">{feed.source}</span>
                      <span className="text-[11px] text-[#525252]">{feed.date}</span>
                    </div>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      {feed.headline}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeFeed(feed.id)}
                      className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                      title="Remove feed"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
