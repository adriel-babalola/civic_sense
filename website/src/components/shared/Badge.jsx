import { cn } from "../../utils/cn";
import { VERDICT_META, INCIDENT_META, REPORT_STATUS_META } from "../../utils/constants";

/**
 * Badge.
 *
 * Colour is carried by a token name, never a raw hex, so a badge can never
 * drift from the palette. Every variant is a 10%-opacity fill with a matching
 * 25%-opacity border, which keeps the grid of badges calm when many are shown
 * at once.
 */

const TONES = {
  neutral: "bg-card-active text-fg-secondary border-line-strong",
  verified: "bg-verified/10 text-verified border-verified/25",
  false: "bg-false/10 text-false border-false/25",
  misleading: "bg-misleading/10 text-misleading border-misleading/25",
  unverified: "bg-unverified/10 text-fg-muted border-unverified/25",
  unrest: "bg-unrest/10 text-unrest border-unrest/25",
  brand: "bg-brand-bright/10 text-brand-bright border-brand-bright/25",
  live: "bg-live/10 text-live border-live/25",
};

const SIZES = {
  sm: "px-1.5 py-0.5 text-2xs gap-1",
  md: "px-2 py-0.5 text-xs gap-1.5",
};

export function Badge({ tone = "neutral", size = "md", icon: Icon, className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        TONES[tone] || TONES.neutral,
        SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon size={size === "sm" ? 10 : 12} strokeWidth={2} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** Verdict stamp. Falls back to UNVERIFIED for anything unrecognised. */
export function VerdictBadge({ verdict, size = "md", className }) {
  const meta = VERDICT_META[verdict] || VERDICT_META.UNVERIFIED;
  return (
    <Badge tone={meta.token} size={size} className={className}>
      {meta.label}
    </Badge>
  );
}

/** Incident type chip. */
export function TypeBadge({ type, size = "md", className }) {
  const meta = INCIDENT_META[type] || { label: type, token: "neutral" };
  return (
    <Badge tone={meta.token} size={size} className={className}>
      {meta.label}
    </Badge>
  );
}

/** Moderation status chip. */
export function StatusBadge({ status, size = "md", className }) {
  const meta = REPORT_STATUS_META[status] || { label: status, token: "neutral" };
  return (
    <Badge tone={meta.token} size={size} className={className}>
      {meta.label}
    </Badge>
  );
}

/** Party affiliation. Neutral by design — party is not a verdict. */
export function PartyBadge({ party, size = "sm", className }) {
  return (
    <Badge tone="neutral" size={size} className={className}>
      {party}
    </Badge>
  );
}

/** "Live" indicator: a pulsing dot plus a word. Never colour alone. */
export function LiveBadge({ label = "Live", className }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-fg-muted", className)}>
      <span className="cs-live-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export default Badge;
