import { BarChart3, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

const STATS = ["VERIFIED", "MISLEADING", "FALSE", "UNVERIFIED"];

const LABELS = {
  VERIFIED: "Verified",
  MISLEADING: "Misleading",
  FALSE: "False",
  UNVERIFIED: "Unverified",
};

const COLORS = {
  total: "text-white",
  VERIFIED: "text-[#10B981]",
  MISLEADING: "text-[#F59E0B]",
  FALSE: "text-[#EF4444]",
  UNVERIFIED: "text-[#6B7280]",
};

const ICONS = {
  total: BarChart3,
  VERIFIED: CheckCircle,
  MISLEADING: AlertTriangle,
  FALSE: XCircle,
  UNVERIFIED: HelpCircle,
};

export default function StatsRow({ counts }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[{ key: "total", label: "Total" }, ...STATS.map((k) => ({ key: k, label: LABELS[k] }))].map(
        ({ key, label }) => {
          const Icon = ICONS[key];
          return (
            <div
              key={key}
              className="bg-[#141414] rounded-xl p-4 border border-[#1E1E1E]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={COLORS[key]}>
                  <Icon size={14} strokeWidth={2} />
                </span>
                <span className="text-[11px] text-[#6B7280] uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <div className={`text-[28px] font-bold leading-none ${COLORS[key]}`}>
                {counts[key]}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
