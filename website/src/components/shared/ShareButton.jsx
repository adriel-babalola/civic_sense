import { Check, Share2 } from "lucide-react";
import { useShare } from "../../hooks/useShare";
import { cn } from "../../utils/cn";

/**
 * Share control, with a clipboard fallback.
 *
 * `useShare` already tries `navigator.share` and falls back to copying, so this
 * component is only the button chrome and the resolved-state label. Both paths
 * have to stay: `navigator.share` is missing on desktop browsers, and the
 * clipboard API is missing on anything served over plain HTTP.
 */
export function ShareButton({
  title,
  text,
  url,
  label = "Share",
  variant = "secondary",
  size = "md",
  iconOnly = false,
  className,
}) {
  const { share, copied } = useShare({ title, text, url });

  return (
    <button
      type="button"
      onClick={share}
      aria-label={iconOnly ? label : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-control font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright",
        variant === "secondary"
          ? "border border-line bg-surface text-fg-secondary hover:bg-card-active hover:text-fg"
          : "text-fg-muted hover:text-fg",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
        iconOnly && "h-8 w-8 shrink-0 px-0",
        className,
      )}
    >
      {copied ? (
        <Check size={14} className="text-verified" aria-hidden="true" />
      ) : (
        <Share2 size={14} aria-hidden="true" />
      )}
      {iconOnly ? (
        <span className="sr-only">{copied ? "Link copied" : label}</span>
      ) : (
        copied ? "Link copied" : label
      )}
    </button>
  );
}

export default ShareButton;
