import { useMemo, useState } from "react";
import { Radio } from "lucide-react";
import { CHECKS, SAMPLE_NOTICE } from "../../data/demo-data";
import { CONFIG } from "../../config/config";
import { ALL, VERDICTS, VERDICT_META } from "../../utils/constants";
import { Container, PageHeader, EmptyState, NoResults } from "../../components/shared/Layout";
import { SegmentedControl } from "../../components/shared/Input";
import { LiveBadge } from "../../components/shared/Badge";
import { VerdictRow } from "../../components/sections/VerdictCard";
import { SampleBanner } from "../../components/shared/SampleBanner";
import { countVerdicts } from "../../utils/formatters";

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

  // Bundled sample records, in place of GET /api/factchecks. See
  // ../data/demo-data.js for why there is no request here.
  const records = useMemo(() => CHECKS, []);
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
        description="Every claim checked through the CivicSense pipeline, newest first. This is the same record the WhatsApp bot writes to."
        action={<LiveBadge />}
      />

      <SampleBanner className="mt-5">{SAMPLE_NOTICE}</SampleBanner>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          {filtered.length} shown
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {filtered.length ? (
          filtered.map((record, index) => (
            <VerdictRow key={record._id || record.id || index} record={record} />
          ))
        ) : records.length ? (
          <NoResults noun="checks in this verdict" onClear={() => setFilter(ALL)} />
        ) : (
          <EmptyState
            icon={Radio}
            title="Nothing checked yet"
            description="Once someone forwards a claim to the bot, it appears here."
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
