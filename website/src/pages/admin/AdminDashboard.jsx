import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Database,
  FileText,
  ListChecks,
  Newspaper,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { getHealth, getFactChecks, getSources, getReports } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { Container, Stat, StatSkeleton, Meter, ErrorState } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { LiveBadge, VerdictBadge } from "../../components/shared/Badge";
import { Skeleton } from "../../components/shared/Skeleton";
import { parseVerdict, countVerdicts, formatDuration, relativeTime } from "../../utils/formatters";
import { usePoliticians } from "../../hooks/usePoliticians";

/**
 * Admin overview.
 *
 * A dashboard for the person deciding what to work on next: is the pipeline
 * healthy, is anything waiting in the queue, and what has the public been
 * checking. Health comes from the server; nothing here is a stored statistic,
 * so a wrong number means a wrong server rather than a stale cache.
 */
export function AdminDashboard() {
  const health = useAsync((signal) => getHealth(signal), { intervalMs: 60_000 });
  const reports = useAsync((signal) => getReports(undefined, signal), { intervalMs: 60_000 });
  const feed = useAsync((signal) => getFactChecks(signal), { intervalMs: 60_000 });
  const sources = useAsync((signal) => getSources(signal));
  const { total: politicianCount } = usePoliticians();

  const pending = (reports.data || []).filter((report) => report.status === "pending");
  const verdicts = countVerdicts(feed.data || []);

  const recentPending = [...pending]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

  const recentChecks = [...(feed.data || [])].slice(0, 6);

  return (
    <Container size="prose" className="py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="cs-eyebrow mb-2">Overview</p>
          <h1 className="text-title text-fg">Today</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            Live state of the pipeline and the moderation queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge label={health.data ? "Server up" : "No response"} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              health.reload();
              reports.reload();
              feed.reload();
            }}
          >
            <RefreshCw size={13} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {health.error ? (
        <ErrorState
          className="mt-6"
          error={health.error}
          onRetry={health.reload}
          title="The server did not answer"
        />
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {health.isLoading && !health.data ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Stat
              label="Waiting review"
              value={pending.length}
              tone={pending.length > 0 ? "misleading" : "verified"}
              icon={ShieldAlert}
              hint={pending.length > 0 ? "Needs a decision" : "Queue is clear"}
            />
            <Stat
              label="Checks run"
              value={verdicts.total}
              icon={ListChecks}
              hint="Stored fact-check records"
            />
            <Stat
              label="Articles indexed"
              value={health.data?.articles ?? 0}
              icon={Newspaper}
              hint={`${sources.data?.length ?? 0} feeds in registry`}
            />
            <Stat
              label="Profiles"
              value={politicianCount}
              icon={FileText}
              hint="Local dataset, not yet on the API"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="cs-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading text-fg">Needs review</h2>
            <Link
              to="/admin/reports"
              className="flex items-center gap-1 text-xs text-fg-muted transition-colors hover:text-fg"
            >
              Full queue
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {recentPending.length ? (
              recentPending.map((report) => (
                <div key={report._id || report.id} className="rounded-control border border-line p-3">
                  <div className="flex flex-wrap items-center gap-2 text-2xs text-fg-faint">
                    <span className="font-medium text-fg-secondary">{report.state}</span>
                    {report.lga ? <span>· {report.lga}</span> : null}
                    <span className="ml-auto">{relativeTime(report.timestamp)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-fg-secondary">{report.description}</p>
                </div>
              ))
            ) : reports.isLoading ? (
              <Skeleton className="h-16 w-full rounded-control" />
            ) : (
              <p className="py-4 text-center text-sm text-fg-muted">
                Nothing waiting. The queue is clear.
              </p>
            )}
          </div>

          {pending.length > 4 ? (
            <p className="cs-hint mt-3">and {pending.length - 4} more</p>
          ) : null}
        </section>

        <section className="cs-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading text-fg">Recent checks</h2>
            <Link
              to="/admin/feed"
              className="flex items-center gap-1 text-xs text-fg-muted transition-colors hover:text-fg"
            >
              Full feed
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {recentChecks.length ? (
              recentChecks.map((record, index) => {
                const { verdict } = parseVerdict(record.verdict);
                return (
                  <div
                    key={record._id || index}
                    className="flex items-start gap-2.5 rounded-control border border-line p-2.5"
                  >
                    <VerdictBadge verdict={verdict} size="sm" className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-fg">{record.claim || "Image claim"}</p>
                      <p className="text-2xs text-fg-faint">
                        {record.channel} · {relativeTime(record.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : feed.isLoading ? (
              <Skeleton className="h-16 w-full rounded-control" />
            ) : (
              <p className="py-4 text-center text-sm text-fg-muted">No checks recorded yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="cs-card p-4">
          <h2 className="text-heading text-fg">Verdict mix</h2>
          <div className="mt-3 space-y-3">
            {verdicts.total ? (
              [
                ["VERIFIED", "verified"],
                ["FALSE", "false"],
                ["MISLEADING", "misleading"],
                ["UNVERIFIED", "unverified"],
              ].map(([verdict, tone]) => (
                <Meter
                  key={verdict}
                  label={verdict.charAt(0) + verdict.slice(1).toLowerCase()}
                  value={verdicts[verdict]}
                  total={verdicts.total}
                  tone={tone}
                />
              ))
            ) : (
              <p className="text-sm text-fg-muted">No data yet.</p>
            )}
          </div>
        </section>

        <section className="cs-card p-4">
          <h2 className="text-heading text-fg">Server</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Uptime" value={health.data ? formatDuration(health.data.uptime * 1000) : "n/a"} />
            <Row
              label="Database"
              value={health.data ? (health.data.db ? "connected" : "offline") : "n/a"}
              tone={health.data ? (health.data.db ? "verified" : "misleading") : undefined}
            />
            <Row label="Articles" value={health.data?.articles?.toLocaleString() ?? "n/a"} />
            <Row
              label="Feeds"
              value={
                health.data?.scraper
                  ? `${health.data.scraper.healthy}/${health.data.scraper.sources} healthy`
                  : "n/a"
              }
            />
            <Row
              label="Last sync"
              value={health.data?.scraper?.lastSyncAt ? relativeTime(health.data.scraper.lastSyncAt) : "n/a"}
            />
          </dl>
          <p className="cs-hint mt-3 flex items-start gap-1.5">
            <Activity size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            Polled every 60s. Values are read live from <code className="font-mono">/api/health</code>.
          </p>
          <p className="cs-hint mt-1.5 flex items-start gap-1.5">
            <Database size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            If the database reads offline, moderation actions will fail until it reconnects.
          </p>
        </section>
      </div>
    </Container>
  );
}

function Row({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-fg-muted">{label}</dt>
      <dd
        className={
          tone === "verified"
            ? "font-medium text-verified"
            : tone === "misleading"
              ? "font-medium text-misleading"
              : "font-medium text-fg-secondary"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export default AdminDashboard;
