import { Link } from "react-router-dom";
import { Map } from "lucide-react";

const TYPE_STYLES = {
  violence: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "Violence" },
  misconduct: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Misconduct" },
  unrest: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", label: "Unrest" },
};

export default function IncidentCard({ incident }) {
  const style = TYPE_STYLES[incident.type] || TYPE_STYLES.unrest;
  const date = incident.timestamp
    ? new Date(incident.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-5 backdrop-blur-sm hover:border-neutral-700/60 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg ${style.bg} ${style.text} ${style.border} border`}>
          {style.label}
        </span>
        <span className="text-xs text-neutral-500">{date}</span>
      </div>
      <p className="text-sm text-neutral-400 leading-relaxed mb-3 line-clamp-3">
        {incident.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span>{incident.state}</span>
        <span className="text-neutral-800">|</span>
        <span>{incident.lga}</span>
      </div>
    </div>
  );
}
