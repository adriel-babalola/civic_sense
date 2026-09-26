import { Check, Clock, FileText, Link2, Quote, ShieldCheck, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { VerdictBadge } from "../shared/Badge";
import { parseVerdict, relativeTime, truncate } from "../../utils/formatters";

/**
 * A fact-check rendered as a card.
 *
 * Used on the home page, the live feed and the admin feed, so the verdict
 * format is identical everywhere. The verdict is derived from the stored text
 * rather than trusted blindly, because records written before the structured
 * field existed carry no `structured` object.
 */
export function VerdictCard({ record, className, showClaim = true, showSource = true, compact = false }) {
  const { verdict, evidence, source } = parseVerdict(record?.verdict);
  const structured = record?.structured;

  // The pipeline returns the actual finding as `structured.whatWeFound`. The
  // parsed `evidence` is only a fallback for older records, which were stored
  // as the WhatsApp-formatted string and carry no structured object at all.
  const finding = structured?.whatWeFound || evidence;

  return (
    <article className={cn("cs-card cs-card-interactive p-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <VerdictBadge verdict={verdict} />
        {record?.channel && record.channel !== "test" ? (
          <span className="text-2xs text-fg-faint">{record.channel}</span>
        ) : null}
        <span className="ml-auto text-2xs text-fg-faint">
          {relativeTime(record?.timestamp)}
        </span>
      </div>

      {showClaim ? (
        <h3 className="mt-2.5 text-sm font-medium leading-snug text-fg">
          <Quote size={11} className="mr-1 inline text-fg-faint" aria-hidden="true" />
          {record?.claim ? truncate(record.claim, 140) : "Image claim"}
        </h3>
      ) : null}

      {finding && !compact ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-secondary">{finding}</p>
      ) : null}

      {structured?.confidence && !compact ? (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-1 w-20 overflow-hidden rounded-full bg-card-active">
            <div
              className={cn(
                "h-full rounded-full",
                verdict === "VERIFIED" && "bg-verified",
                verdict === "FALSE" && "bg-false",
                verdict === "MISLEADING" && "bg-misleading",
                verdict === "UNVERIFIED" && "bg-fg-muted",
              )}
              style={{ width: `${Math.min(100, structured.confidence)}%` }}
            />
          </div>
          <span className="text-2xs text-fg-faint">{structured.confidence}% confidence</span>
        </div>
      ) : null}

      {showSource ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line-subtle pt-2.5 text-2xs text-fg-muted">
          {source ? (
            <span className="inline-flex items-center gap-1">
              <FileText size={10} aria-hidden="true" />
              {truncate(source, 48)}
            </span>
          ) : null}
          {structured?.sources?.length ? (
            <span className="inline-flex items-center gap-1">
              <Link2 size={10} aria-hidden="true" />
              {structured.sources.length} source{structured.sources.length === 1 ? "" : "s"}
            </span>
          ) : null}
          {record?.latencyMs ? (
            <span className="inline-flex items-center gap-1">
              <Clock size={10} aria-hidden="true" />
              {(record.latencyMs / 1000).toFixed(1)}s
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/** Compact one-line verdict row, for dense lists. */
export function VerdictRow({ record, className }) {
  const { verdict, source } = parseVerdict(record?.verdict);
  return (
    <div className={cn("flex items-start gap-3 border-b border-line-subtle py-2.5 last:border-b-0", className)}>
      <VerdictBadge verdict={verdict} size="sm" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg">{record?.claim || "Image claim"}</p>
        <p className="truncate text-2xs text-fg-faint">
          {source ? truncate(source, 60) : "No source listed"}
          {record?.timestamp ? ` · ${relativeTime(record.timestamp)}` : ""}
        </p>
      </div>
    </div>
  );
}

/** The four verdict types, explained. */
export function VerdictExplainer({ className }) {
  const items = [
    {
      verdict: "VERIFIED",
      body: "Two or more independent sources confirm it.",
      icon: Check,
      color: "text-verified",
    },
    {
      verdict: "FALSE",
      body: "Independent sources contradict it.",
      icon: X,
      color: "text-false",
    },
    {
      verdict: "MISLEADING",
      body: "True in part, but framed to deceive.",
      icon: ShieldCheck,
      color: "text-misleading",
    },
    {
      verdict: "UNVERIFIED",
      body: "Not enough evidence to say.",
      icon: Clock,
      color: "text-fg-muted",
    },
  ];

  return (
    <dl className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.verdict} className="cs-card p-4">
          <dt className="flex items-center gap-2">
            <item.icon size={14} className={item.color} aria-hidden="true" />
            <span className="text-sm font-semibold text-fg">{item.verdict}</span>
          </dt>
          <dd className="mt-1.5 text-sm text-fg-muted">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

export default VerdictCard;
