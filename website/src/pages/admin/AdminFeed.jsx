import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { getFactChecks } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { CONFIG } from "../../config/config";
import { ALL, CHANNELS, VERDICTS, VERDICT_META } from "../../utils/constants";
import {
  Container,
  PageHeader,
  EmptyState,
  ErrorState,
  NoResults,
  Meter,
} from "../../components/shared/Layout";
import { SearchInput, SegmentedControl, Select } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { VerdictBadge } from "../../components/shared/Badge";
import { Skeleton } from "../../components/shared/Skeleton";
import { countVerdicts, parseVerdict, relativeTime, formatDateTime } from "../../utils/formatters";

/**
 * Fact-check feed.
 *
 * The internal view of GET /api/factchecks: what was checked, through which
 * channel, and with what verdict. The server stores the claim and the verdict
 * string only — there is no stored evidence trail to show, so this page does
 * not pretend there is one.
 */
export function AdminFeed() {
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState(ALL);
  const [channel, setChannel] = useState(ALL);

  const { data, error, isLoading, reload } = useAsync((signal) => getFactChecks(signal), {
    intervalMs: 30_000,
  });

  const records = useMemo(() => data || [], [data]);
  const counts = useMemo(() => countVerdicts(records), [records]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      const parsed = parseVerdict(record.verdict);
      if (verdict !== ALL && parsed.verdict !== verdict) return false;
      if (channel !== ALL && record.channel !== channel) return false;
      if (needle && !record.claim?.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [records, query, verdict, channel]);

  return (
    <Container size="prose" className="py-8">
      <PageHeader
        eyebrow="Pipeline"
        title="Fact-check feed"
        description="The 50 most recent checks, newest first. These are the same records the public live feed reads."
        action={
          <Button variant="secondary" size="sm" onClick={reload}>
            Refresh
          </Button>
        }
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="cs-card p-4">
          <h2 className="text-heading text-fg">Verdict mix</h2>
          <div className="mt-3 space-y-3">
            {counts.total ? (
              [
                ["VERIFIED", "verified"],
                ["FALSE", "false"],
                ["MISLEADING", "misleading"],
                ["UNVERIFIED", "unverified"],
              ].map(([key, tone]) => (
                <Meter
                  key={key}
                  label={VERDICT_META[key].label}
                  value={counts[key]}
                  total={counts.total}
                  tone={tone}
                />
              ))
            ) : (
              <p className="text-sm text-fg-muted">No records.</p>
            )}
          </div>
        </div>
        <div className="cs-card p-4">
          <h2 className="text-heading text-fg">Channels</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(CHANNELS).map(([key, label]) => {
              const count = records.filter((record) => record.channel === key).length;
              if (!count) return null;
              return (
                <div key={key} className="flex items-baseline justify-between gap-4">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd className="font-medium text-fg-secondary">{count}</dd>
                </div>
              );
            })}
            {!records.length ? (
              <p className="text-sm text-fg-muted">No channel data.</p>
            ) : null}
          </dl>
          <p className="cs-hint mt-3">
            Polls every {Math.round(CONFIG.POLL_INTERVAL_MS / 1000)}s.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <SegmentedControl
          label="Filter by verdict"
          value={verdict}
          onChange={setVerdict}
          options={[
            { value: ALL, label: "All", count: counts.total },
            ...VERDICTS.map((key) => ({
              value: key,
              label: VERDICT_META[key].label,
              count: counts[key] || 0,
            })),
          ]}
        />

        <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
          <SearchInput value={query} onChange={setQuery} placeholder="Search claims" />
          <Select
            aria-label="Filter by channel"
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            options={Object.entries(CHANNELS).map(([value, label]) => ({ value, label }))}
            placeholder="All channels"
          />
        </div>
      </div>

      {error ? <ErrorState className="mt-4" error={error} onRetry={reload} /> : null}

      <div className="mt-4 space-y-2">
        {isLoading && !records.length ? (
          [0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-14 w-full rounded-card" />
          ))
        ) : filtered.length ? (
          filtered.map((record, index) => {
            const parsed = parseVerdict(record.verdict);
            return (
              <div
                key={record._id || index}
                className="cs-card flex items-start gap-3 p-3"
              >
                <VerdictBadge verdict={parsed.verdict} size="sm" className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-fg">{record.claim || "Image claim"}</p>
                  <p className="text-2xs text-fg-faint">
                    {CHANNELS[record.channel] || record.channel || "unknown"} ·{" "}
                    <time dateTime={record.timestamp} title={formatDateTime(record.timestamp)}>
                      {relativeTime(record.timestamp)}
                    </time>
                    {record.latencyMs ? ` · ${Math.round(record.latencyMs / 100) / 10}s` : ""}
                  </p>
                  {parsed.source ? (
                    <p className="mt-1 truncate text-2xs text-fg-muted">
                      Source: {parsed.source}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : records.length ? (
          <NoResults query={query} noun="checks" onClear={() => setQuery("")} />
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No checks recorded"
            description="The pipeline has not written a record yet. Send a claim to the bot to populate this."
          />
        )}
      </div>
    </Container>
  );
}

export default AdminFeed;
