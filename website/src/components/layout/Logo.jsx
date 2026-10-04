import { cn } from "../../utils/cn";

/**
 * CivicSense mark.
 *
 * A shield outline with a tick — the two ideas the product is about: something
 * you can rely on, and a claim that survived being checked. Drawn inline as SVG
 * so it inherits `currentColor`, needs no request, and stays crisp at any size.
 */
export function LogoMark({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.75 4.5 5.5v6.1c0 4.55 3.08 8.16 7.5 9.65 4.42-1.49 7.5-5.1 7.5-9.65V5.5L12 2.75Z" />
      <path d="m8.75 11.9 2.35 2.4 4.4-4.75" />
    </svg>
  );
}

/**
 * Full wordmark.
 *
 * The tagline sits after a middot, so it reads as a second clause of the name
 * rather than as a button. It was "verify what you forward", which described a
 * feature; it is now "Truth awareness. Vote informed.", which is the two things
 * the product is actually for.
 */
export function Logo({ compact = false, className, markClassName, textClassName, ...props }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} {...props}>
      <LogoMark className={cn("h-7 w-7 text-brand-bright", markClassName)} />
      <span className={cn("text-xl font-bold tracking-[-0.02em] text-fg", textClassName)}>
        CivicSense
      </span>
      {!compact ? (
        <span className="hidden text-[0.8125rem] text-fg-muted xl:inline">
          · Truth awareness. Vote informed.
        </span>
      ) : null}
    </span>
  );
}

export default Logo;
