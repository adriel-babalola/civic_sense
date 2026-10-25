import { useEffect, useMemo, useState } from "react";
import { Radio } from "lucide-react";
import { CHECKS } from "../../data/demo-data";
import { CONFIG } from "../../config/config";
import { ALL, VERDICTS, VERDICT_META } from "../../utils/constants";
import { Container, PageHeader, EmptyState, NoResults } from "../../components/shared/Layout";
import { SegmentedControl } from "../../components/shared/Input";
import { LiveBadge } from "../../components/shared/Badge";
import { VerdictRow } from "../../components/sections/VerdictCard";

import { countVerdicts } from "../../utils/formatters";

/**
 * Live verdict feed.
 */
export function LiveFeed() {
  const [filter, setFilter] = useState(ALL);
  const [apiRecords, setApiRecords] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchFeed = async () => {
      try {
        const apiBase = CONFIG.API_BASE_URL || "";
        const res = await fetch(`${apiBase}/api/factchecks?limit=50`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          setApiRecords(json.data);
        }
      } catch {
        // Fall back to bundled data
      }
    };
    fetchFeed();
    return () => {
      cancelled = true;
    };
  }, []);

  const records = useMemo(() => (apiRecords && apiRecords.length ? apiRecords : CHECKS), [apiRecords]);
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
