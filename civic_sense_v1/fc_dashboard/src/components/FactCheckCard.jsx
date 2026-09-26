import { formatDistanceToNow } from "date-fns";
import { parseVerdict } from "../utils/parseVerdict";

const BADGE_STYLES = {
  VERIFIED: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  FALSE: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  MISLEADING: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  UNVERIFIED: "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20",
};

export default function FactCheckCard({ item, first }) {
  const parsed = parseVerdict(item.verdict);
  const v = parsed.verdict;
  const badge = BADGE_STYLES[v] || BADGE_STYLES.UNVERIFIED;

  const timeAgo = item.timestamp
    ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
    : "";

  const sourceUrl = parsed.source?.match(/https?:\/\/[^\s]+/gi);
  const hasEvidence = parsed.evidence && parsed.evidence.length > 0;

  return (
    <div
      className={`rounded-xl border bg-[#141414] overflow-hidden ${
        first ? "border-[#22C55E]/30" : "border-[#1E1E1E]"
      }`}
    >
      {/* Top row: badge + timestamp */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${badge}`}
        >
          {v}
        </span>
        <span className="text-xs text-[#6B7280]">{timeAgo}</span>
      </div>

      <div className="border-t border-[#1E1E1E]/50" />

      {/* Claim headline */}
      <div className="px-5 py-3">
        <p className="text-sm font-semibold text-white leading-snug">
          &ldquo;{item.claim}&rdquo;
        </p>
      </div>

      {/* Evidence (only if present) */}
      {hasEvidence && (
        <>
          <div className="border-t border-[#1E1E1E]/50" />
          <div className="px-5 py-3">
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              {parsed.evidence}
            </p>
          </div>
        </>
      )}

      {/* Sources as pills */}
      {(sourceUrl?.length > 0 || parsed.source) && (
        <>
          <div className="border-t border-[#1E1E1E]/50" />
          <div className="px-5 py-3 flex flex-wrap gap-1.5">
            {sourceUrl?.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-[#0A0A0A] text-[#6B7280] px-2.5 py-1 rounded-md border border-[#1E1E1E] hover:text-[#A1A1AA] hover:border-[#333] transition-all"
              >
                {new URL(url).hostname.replace("www.", "")}
              </a>
            ))}
            {!sourceUrl?.length && parsed.source && (
              <span className="text-xs text-[#6B7280]">{parsed.source}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
