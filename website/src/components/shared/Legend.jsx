import { cn } from "../../utils/cn";
import { INCIDENT_TYPES, INCIDENT_META, REPORT_STATUS_META } from "../../utils/constants";

/**
 * Maps a token name to Tailwind classes.
 *
 * Kept as static strings rather than interpolated, so Tailwind's scanner can
 * see the class names and ship them. Building them at runtime
 * (`bg-${tone}/10`) would produce classes the compiler never generated.
 */

const DOT = {
  verified: "bg-verified",
  false: "bg-false",
  misleading: "bg-misleading",
  unverified: "bg-fg-muted",
  unrest: "bg-unrest",
  neutral: "bg-fg-muted",
  brand: "bg-brand-bright",
  live: "bg-live",
};

/** Compact legend for the incident map. */
export function IncidentLegend({ counts, className, onSelect, selected }) {
  return (
    <ul className={cn("space-y-1.5", className)}>
      {INCIDENT_TYPES.map((type) => {
        const meta = INCIDENT_META[type];
        const active = selected === type;
        const interactive = typeof onSelect === "function";

        return (
          <li key={type}>
            <button
              type="button"
              disabled={!interactive}
              onClick={interactive ? () => onSelect(active ? null : type) : undefined}
              aria-pressed={interactive ? active : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-xs transition-colors",
                interactive && "hover:bg-card-active",
                !interactive && "cursor-default",
                active && "bg-card-active",
              )}
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-sm", DOT[meta.token])} aria-hidden="true" />
              <span className={cn("flex-1", active ? "text-fg" : "text-fg-secondary")}>{meta.label}</span>
              {typeof counts?.[type] === "number" ? (
                <span className="font-medium text-fg-muted">{counts[type]}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Legend for verdict colours. */
export function VerdictLegend({ className, counts, onSelect, selected }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-1.5", className)}>
      {Object.entries(REPORT_STATUS_META).map(([status, meta]) => {
        const active = selected === status;
        const interactive = typeof onSelect === "function";

        return (
          <li key={status}>
            <button
              type="button"
              disabled={!interactive}
              onClick={interactive ? () => onSelect(active ? null : status) : undefined}
              aria-pressed={interactive ? active : undefined}
              className={cn(
                "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-xs transition-colors",
                interactive && "hover:bg-card-active",
                !interactive && "cursor-default",
                active && "bg-card-active",
              )}
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-sm", DOT[meta.token])} aria-hidden="true" />
              <span className={cn("truncate", active ? "text-fg" : "text-fg-secondary")}>
                {meta.label}
              </span>
              {typeof counts?.[status] === "number" ? (
                <span className="ml-auto font-medium text-fg-muted">{counts[status]}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default IncidentLegend;
