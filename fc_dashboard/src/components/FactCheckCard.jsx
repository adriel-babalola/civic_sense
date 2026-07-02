import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { parseVerdict } from "../utils/parseVerdict";

const CONFIG = {
  VERIFIED: {
    icon: CheckCircle,
    color: "text-verified",
    bg: "bg-verified/8",
    border: "border-verified/15",
    dot: "bg-verified",
  },
  FALSE: {
    icon: XCircle,
    color: "text-false",
    bg: "bg-false/8",
    border: "border-false/15",
    dot: "bg-false",
  },
  MISLEADING: {
    icon: AlertTriangle,
    color: "text-misleading",
    bg: "bg-misleading/8",
    border: "border-misleading/15",
    dot: "bg-misleading",
  },
  UNVERIFIED: {
    icon: HelpCircle,
    color: "text-unverified",
    bg: "bg-unverified/8",
    border: "border-unverified/15",
    dot: "bg-unverified",
  },
};

export default function FactCheckCard({ item }) {
  const parsed = parseVerdict(item.verdict);
  const v = parsed.verdict;
  const cfg = CONFIG[v] || CONFIG.UNVERIFIED;
  const Icon = cfg.icon;

  const timeAgo = item.timestamp
    ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
    : "";

  const sourceUrl = parsed.source?.match(/https?:\/\/[^\s]+/gi);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3 hover:border-white/[0.12] transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${cfg.dot}`} />
          <p className="text-sm font-medium text-white/90 leading-snug">
            "{item.claim}"
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
        >
          <Icon size={13} />
          {v}
        </span>
      </div>

      {parsed.evidence && (
        <p className="text-sm text-gray-500 leading-relaxed pl-5">
          {parsed.evidence}
        </p>
      )}

      {sourceUrl && sourceUrl.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-5">
          {sourceUrl.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent/70 hover:text-accent underline underline-offset-2 truncate max-w-[260px] transition-colors"
            >
              {url}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-gray-700 pt-0.5 pl-5">
        <span>{timeAgo}</span>
        {parsed.confidence > 0 && (
          <span className="text-gray-600">{parsed.confidence}% confidence</span>
        )}
      </div>
    </div>
  );
}
