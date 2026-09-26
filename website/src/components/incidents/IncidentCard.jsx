import { cn } from "../../utils/cn";
import { TypeBadge } from "../shared/Badge";
import { formatDate, relativeTime } from "../../utils/formatters";

/**
 * One incident in a list.
 *
 * Renders as a button rather than a div so keyboard users can move through the
 * feed and select an incident, which is what the map does with a mouse.
 */
export function IncidentCard({ incident, isActive, onSelect, className }) {
  const description =
    incident.description?.length > 180
      ? `${incident.description.slice(0, 180).trimEnd()}…`
      : incident.description;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        "cs-card cs-card-interactive w-full p-3 text-left",
        isActive && "border-brand-bright/40 bg-card-active",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={incident.type} />
        <span className="text-sm font-medium text-fg">{incident.state}</span>
        {incident.lga ? <span className="text-xs text-fg-muted">{incident.lga}</span> : null}
      </div>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-secondary">{description}</p>

      <p className="mt-2 text-2xs text-fg-faint">
        <time dateTime={incident.timestamp} title={formatDate(incident.timestamp)}>
          {relativeTime(incident.timestamp)}
        </time>
      </p>
    </button>
  );
}

export default IncidentCard;
