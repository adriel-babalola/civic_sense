import { useMemo } from "react";
import { getFactChecks, getIncidents, getReports, getHealth, getSources } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { UNIQUE_POLITICIANS } from "../../data/politicians";
import { STATES } from "../../data/states";
import { VERDICTS, VERDICT_META, INCIDENT_TYPES, INCIDENT_META } from "../../utils/constants";
import {
  Container,
  PageHeader,
  Stat,
  StatSkeleton,
  Meter,
  ErrorState,
} from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Alert } from "../../components/shared/Field";
import { formatNumber, formatDuration, parseVerdict } from "../../utils/formatters";

/**
 * Analytics.
 *
 * Everything here is computed in the browser from what the public endpoints
 * already return. There is no event pipeline and no tracking script, so these
 * numbers describe the server's contents, not visitor behaviour — a distinction
 * the page states rather than hides.
 */
export function AdminAnalytics() {
  const health = useAsync((signal) => getHealth(signal));
  const checks = useAsync((signal) => getFactChecks(signal));
  const reports = useAsync((signal) => getReports(undefined, signal));
  const incidents = useAsync((signal) => getIncidents(signal));
  const sources = useAsync((signal) => getSources(signal));

  const isLoading =
    health.isLoading || checks.isLoading || reports.isLoading || incidents.isLoading;

  const stats = useMemo(() => {
    const factChecks = checks.data || [];
    const reportList = reports.data || [];
    const incidentList = incidents.data || [];

    const verdicts = Object.fromEntries(VERDICTS.map((verdict) => [verdict, 0]));
    let totalLatency = 0;
    let latencySamples = 0;

    for (const record of factChecks) {
      const { verdict } = parseVerdict(record.verdict);
      if (verdict in verdicts) verdicts[verdict] += 1;
      if (typeof record.latencyMs === "number" && record.latencyMs > 0) {
        totalLatency += record.latencyMs;
        latencySamples += 1;
      }
    }

    const reportStatuses = { pending: 0, approved: 0, rejected: 0 };
    for (const report of reportList) {
      if (report.status in reportStatuses) reportStatuses[report.status] += 1;
    }

    const incidentTypes = Object.fromEntries(INCIDENT_TYPES.map((type) => [type, 0]));
    const stateCounts = {};
    for (const incident of incidentList) {
      if (incident.type in incidentTypes) incidentTypes[incident.type] += 1;
      if (incident.state) {
        stateCounts[incident.state] = (stateCounts[incident.state] || 0) + 1;
      }
    }

    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      factChecks,
      reportList,
      incidentList,
      verdicts,
      reportStatuses,
      incidentTypes,
      topStates,
      averageLatency: latencySamples ? totalLatency / latencySamples : null,
    };
  }, [checks.data, reports.data, incidents.data]);

  const totalChecks = stats.factChecks.length;
  const approvalRate = stats.reportList.length
    ? Math.round((stats.reportStatuses.approved / stats.reportList.length) * 100)
    : 0;

  return (
    <Container size="prose" className="py-8">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Derived on every load from the public API. No visitor tracking exists in this product, so these numbers count server contents, not people."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              health.reload();
              checks.reload();
              reports.reload();
              incidents.reload();
              sources.reload();
            }}
          >
            Recalculate
          </Button>
        }
      />

      {checks.error ? (
        <ErrorState className="mt-5" error={checks.error} onRetry={checks.reload} />
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Stat
              label="Fact-checks"
              value={formatNumber(totalChecks)}
              icon={ListChecksIcon}
              hint="Most recent 50 records"
            />
            <Stat
              label="Reports"
              value={formatNumber(stats.reportList.length)}
              icon={ShieldIcon}
              hint={`${stats.reportStatuses.pending} awaiting review`}
            />
            <Stat
              label="Approval rate"
              value={`${approvalRate}%`}
              tone={approvalRate > 70 ? "misleading" : "verified"}
              hint="Approved of all decisions taken"
            />
            <Stat
              label="Avg latency"
              value={stats.averageLatency ? formatDuration(stats.averageLatency) : "n/a"}
              hint={stats.averageLatency ? "Where the pipeline records it" : "Not recorded on these rows"}
            />
          </>
        )}
      </div>

      {approvalRate > 70 && stats.reportStatuses.approved > 0 ? (
        <Alert tone="warning" className="mt-4" title="High approval rate">
          Over {approvalRate}% of decided reports were approved. That is worth a second look, because either
          reporters are unusually accurate, or the moderation bar is too low. Compare the rejected
          queue before assuming the first.
        </Alert>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="cs-card p-4">
          <h2 className="text-heading text-fg">Verdicts issued</h2>
          <div className="mt-3 space-y-3">
            {totalChecks ? (
              [
                ["VERIFIED", "verified"],
                ["FALSE", "false"],
                ["MISLEADING", "misleading"],
                ["UNVERIFIED", "unverified"],
              ].map(([verdict, tone]) => (
                <Meter
                  key={verdict}
                  label={VERDICT_META[verdict].label}
                  value={stats.verdicts[verdict]}
                  total={totalChecks}
                  tone={tone}
                />
              ))
            ) : (
              <p className="text-sm text-fg-muted">No fact-check records.</p>
            )}
          </div>
        </section>

        <section className="cs-card p-4">
          <h2 className="text-heading text-fg">Report decisions</h2>
          <div className="mt-3 space-y-3">
            {stats.reportList.length ? (
              [
                ["approved", "verified"],
                ["rejected", "false"],
                ["pending", "unverified"],
              ].map(([status, tone]) => (
                <Meter
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  value={stats.reportStatuses[status]}
                  total={stats.reportList.length}
                  tone={tone}
                />
              ))
            ) : (
              <p className="text-sm text-fg-muted">No reports submitted.</p>
            )}
          </div>
        </section>

        <section className="cs-card p-4">
          <h2 className="text-heading text-fg">Incident types published</h2>
          <div className="mt-3 space-y-3">
            {stats.incidentList.length ? (
              INCIDENT_TYPES.map((type) => (
                <Meter
                  key={type}
                  label={INCIDENT_META[type].label}
                  value={stats.incidentTypes[type]}
                  total={stats.incidentList.length}
                  tone={type === "violence" ? "false" : "brand"}
                />
              ))
            ) : (
              <p className="text-sm text-fg-muted">No published incidents.</p>
            )}
          </div>
        </section>

        <section className="cs-card p-4">
          <h2 className="text-heading text-fg">States represented</h2>
          <div className="mt-3 space-y-2.5">
            {stats.topStates.length ? (
              <>
                {stats.topStates.map(([name, count]) => (
                  <div key={name} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-fg-secondary">{name}</span>
                    <span className="font-medium text-fg">{count}</span>
                  </div>
                ))}
                <p className="cs-hint mt-2">
                  {STATES.length - stats.topStates.length} of {STATES.length} states plus the capital
                  territory have no published incident. A gap in reporting is not evidence of calm.
                </p>
              </>
            ) : (
              <p className="text-sm text-fg-muted">No incidents to place.</p>
            )}
          </div>
        </section>
      </div>

      <section className="cs-card mt-5 p-4">
        <h2 className="text-heading text-fg">Content inventory</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Item label="Articles indexed" value={health.data?.articles ?? 0} />
          <Item label="Sources in registry" value={sources.data?.length ?? 0} />
          <Item label="Politician profiles" value={UNIQUE_POLITICIANS.length} />
          <Item label="Public incidents" value={stats.incidentList.length} />
        </dl>
        <Alert tone="info" className="mt-4">
          Only the most recent 50 fact-checks are available from the API, so the verdict mix is a
          sample of recent activity, not lifetime totals. Persisted analytics need a rollup
          collection on the server.
        </Alert>
      </section>
    </Container>
  );
}

function Item({ label, value }) {
  return (
    <div className="rounded-control border border-line p-3">
      <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-fg">{formatNumber(value)}</dd>
    </div>
  );
}

function ListChecksIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="m3 6 2 2 3-3M3 13l2 2 3-3M12 7h9M12 14h9M12 20h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M12 2.75 4.5 5.5v6.1c0 4.55 3.08 8.16 7.5 9.65 4.42-1.49 7.5-5.1 7.5-9.65V5.5L12 2.75Z" strokeLinejoin="round" />
    </svg>
  );
}

export default AdminAnalytics;
