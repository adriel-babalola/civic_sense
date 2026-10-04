import { cn } from "../../utils/cn";
import { AlertCircle, Inbox, SearchX } from "lucide-react";
import { Button } from "./Button";
import { Skeleton } from "./Skeleton";

/** Page container. */
export function Container({ size = "default", className, children, ...props }) {
  return (
    <div
      className={cn(size === "prose" ? "cs-container-prose" : "cs-container", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Vertical rhythm for a page section.
 * `tight` is used inside cards, `default` between page blocks, `loose` for the
 * major marketing sections.
 */
export function Section({ tight = false, loose = false, bordered = false, className, children, ...props }) {
  return (
    <section
      className={cn(
        tight ? "py-6" : loose ? "py-16 sm:py-24" : "py-12 sm:py-16",
        bordered && "border-y border-line",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Section heading.
 *
 * `eyebrow` is the small uppercase label above the title. It is not decoration:
 * it names the section, which helps a scanning reader and reads correctly in
 * a document outline.
 */
export function SectionHeading({ eyebrow, title, description, align = "left", action, className, children }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="cs-eyebrow mb-2.5">{eyebrow}</p> : null}
        <h2 className="text-title text-fg">{title}</h2>
        {description ? (
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-secondary">{description}</p>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Standard page title block.
 *
 * The rule under the header was removed. It was here because most pages used to
 * end their header block there and needed something to close the block, but it
 * turned out to be doing the opposite on the pages with a control directly
 * underneath: a full-width rule 8px above a filter bar reads as a divider
 * between two halves of one thing, and makes the gap look like an accident.
 *
 * `pb-6` stays. The header still needs to breathe before whatever follows it,
 * it just no longer draws a line under itself. Pass `className` if a page wants
 * a different rhythm.
 */
export function PageHeader({ eyebrow, title, description, action, className, children }) {
  return (
    <div className={cn("pb-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <p className="cs-eyebrow mb-2.5">{eyebrow}</p> : null}
          <h1 className="text-[1.75rem] font-bold tracking-[-0.03em] text-fg sm:text-[2.25rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-secondary">{description}</p>
          ) : null}
          {children}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

/**
 * Empty state.
 *
 * Always offers a way forward. An empty state with no action is a dead end,
 * and on a filtered list the action is almost always "clear the filters".
 */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn("cs-card flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface">
        <Icon size={17} className="text-fg-faint" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium text-fg">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Nothing matched the current filters. */
export function NoResults({ query, onClear, noun = "results" }) {
  return (
    <EmptyState
      icon={SearchX}
      title="No matches"
      description={
        query ? `Nothing matched “${query}”. Try a shorter or different search.` : `No ${noun} found.`
      }
      action={
        onClear ? (
          <Button variant="secondary" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        ) : null
      }
    />
  );
}

/** Inline error with a retry, for failed reads. */
export function ErrorState({ error, onRetry, title = "Something went wrong", className }) {
  return (
    <div className={cn("cs-card border-false/25 p-5", className)} role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-false" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-fg">{title}</p>
          <p className="mt-1 text-sm text-fg-secondary">
            {error?.message || "The request could not be completed."}
          </p>
          {onRetry ? (
            <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * A labelled number.
 *
 * `tabular-nums` comes from the body font settings, so a row of stats does not
 * jitter as the values change.
 */
export function Stat({ label, value, tone = "neutral", icon: Icon, hint, className }) {
  const tones = {
    neutral: "text-fg",
    verified: "text-verified",
    false: "text-false",
    misleading: "text-misleading",
    unverified: "text-fg-muted",
    brand: "text-brand-bright",
    live: "text-live",
  };

  return (
    <div className={cn("cs-card p-4", className)}>
      <div className="flex items-center gap-1.5">
        {Icon ? <Icon size={13} className={tones[tone] || tones.neutral} aria-hidden="true" /> : null}
        <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-muted">
          {label}
        </span>
      </div>
      <p className={cn("mt-1.5 text-2xl font-bold leading-none", tones[tone] || tones.neutral)}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-2xs text-fg-faint">{hint}</p> : null}
    </div>
  );
}

/** Skeleton in the shape of a Stat, for dashboards. */
export function StatSkeleton() {
  return (
    <div className="cs-card space-y-2 p-4" aria-hidden="true">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-7 w-12" />
    </div>
  );
}

/** Proportional bar used in the analytics breakdown. */
export function Meter({ value, total, tone = "brand", label, className }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const tones = {
    verified: "bg-verified",
    false: "bg-false",
    misleading: "bg-misleading",
    unverified: "bg-fg-muted",
    brand: "bg-brand-bright",
  };

  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-xs text-fg-secondary">{label}</span>
          <span className="text-xs font-medium text-fg">{pct}%</span>
        </div>
      ) : null}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-card-active"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default Container;
