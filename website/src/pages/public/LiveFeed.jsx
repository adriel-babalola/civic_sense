import { useMemo, useState } from "react";
import { Radio } from "lucide-react";
import { getFactChecks } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { CONFIG } from "../../config/config";
import { ALL, VERDICTS, VERDICT_META } from "../../utils/constants";
import { Container, PageHeader, ErrorState, EmptyState, NoResults } from "../../components/shared/Layout";
import { SegmentedControl } from "../../components/shared/Input";
import { LiveBadge } from "../../components/shared/Badge";
import { VerdictRow } from "../../components/sections/VerdictCard";
import { Skeleton } from "../../components/shared/Skeleton";
import { countVerdicts, relativeTime } from "../../utils/formatters";

/**
 * Live verdict feed.
 *
 * Polls on the same interval as the incident map. The source records come from
 * GET /api/factchecks, which stores the claim and verdict — not the full
 * reasoning — so this feed is a list of what was checked, not a second
 * fact-check surface.
 */
export function LiveFeed() {
  const [filter, setFilter] = useState(ALL);

  const { data, error, isLoading, updatedAt, refresh } = useAsync(
    (signal) => getFactChecks(signal),
    { intervalMs: CONFIG.POLL_INTERVAL_MS },
  );

  const records = useMemo(() => data || [], [data]);
  const counts = useMemo(() => countVerdicts(records), [records]);

  const filtered = useMemo(
    () => (filter === ALL ? records : records.filter((record) => record.verdict === filter)),
    [records, filter],
  );

  return (
    <Container size="prose" className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Live"
        title="Verification feed"
        description="Every claim checked through the CivicSense pipeline, newest first. This is the same backend the WhatsApp bot writes to."
        action={<LiveBadge />}
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Filter by verdict"
          value={filter}
          onChange={setFilter}
          options={[
            { value: ALL, label: "All", count: records.length },
            ...VERDICTS.map((verdict) => ({
              value: verdict,
              label: VERDICT_META[verdict].label,
              count: counts[verdict] || 0,
            })),
          ]}
        />

        <p className="text-xs text-fg-faint" role="status" aria-live="polite">
          {updatedAt ? `Updated ${relativeTime(updatedAt)}` : "Loading"} ·{" "}
          {filtered.length} shown
        </p>
      </div>

      {error ? (
        <ErrorState
          className="mt-6"
          error={error}
          onRetry={refresh}
          title="The feed did not load"
        />
      ) : null}

      <div className="mt-6 space-y-2">
        {isLoading && !records.length ? (
          [0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 w-full rounded-card" />
          ))
        ) : filtered.length ? (
          filtered.map((record, index) => (
            <VerdictRow key={record._id || record.id || index} record={record} />
          ))
        ) : records.length ? (
          <NoResults noun="checks in this verdict" onClear={() => setFilter(ALL)} />
        ) : (
          <EmptyState
            icon={Radio}
            title="Nothing checked yet"
            description="Once someone forwards a claim to the bot, it appears here within a poll cycle."
            action={
              <a
                href={CONFIG.WHATSAPP.joinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-btn cs-btn-primary cs-btn-sm"
              >
                Start with WhatsApp
              </a>
            }
          />
        )}
      </div>
    </Container>
  );
}

export default LiveFeed;
