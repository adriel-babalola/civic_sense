import { cn } from "../../utils/cn";

/** Base skeleton block. Compose these to describe the shape of what is loading. */
export function Skeleton({ className, ...props }) {
  return <div className={cn("cs-skeleton rounded", className)} aria-hidden="true" {...props} />;
}

/** Skeleton that mirrors a text line at a given width. */
export function SkeletonText({ lines = 3, className }) {
  // A deterministic descending pattern reads more like real content than a
  // random width per line.
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-2/3", "w-full", "w-5/6"];
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-3", widths[index % widths.length])} />
      ))}
    </div>
  );
}

/** Skeleton card used by every list surface while data loads. */
export function SkeletonCard({ className }) {
  return (
    <div className={cn("cs-card space-y-3 p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/** Grid of skeleton cards. */
export function SkeletonGrid({ count = 6, className, itemClassName }) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} className={itemClassName} />
      ))}
    </div>
  );
}

/** Skeleton shaped like a page header. */
export function SkeletonHeader() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="h-3 w-full max-w-md" />
    </div>
  );
}

/**
 * Announced loading state.
 *
 * A skeleton alone is invisible to a screen reader, so every skeleton surface
 * is paired with one of these — visually hidden, but present in the tree.
 */
export function LoadingRegion({ label = "Loading", className }) {
  return (
    <p role="status" aria-live="polite" className={cn("cs-sr-only", className)}>
      {label}…
    </p>
  );
}

export default Skeleton;
