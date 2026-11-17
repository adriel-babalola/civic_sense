import { useEffect, useMemo, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { CONFIG } from "../../config/config";
import { ALL, VERDICTS, VERDICT_META } from "../../utils/constants";
import { Container, PageHeader, EmptyState, NoResults } from "../../components/shared/Layout";
import { SegmentedControl } from "../../components/shared/Input";
import { LiveBadge } from "../../components/shared/Badge";
import { VerdictRow } from "../../components/sections/VerdictCard";
import { Button } from "../../components/shared/Button";

import { countVerdicts, parseVerdict } from "../../utils/formatters";

/**
 * Live verdict feed.
 *
 * Production only: it reads GET /api/factchecks and nothing else. There is no
 * bundled fallback, because a fallback is how sample rows end up on a page that
 * presents itself as a record of real checks. An empty API means an empty feed,
 * which is the honest state.
 *
 * The server already returns CIVIC-tagged responses only, so everything that
 * arrives here belongs on the page. The verdict filter parses each record's
 * verdict (the stored field is the formatted message, not the bare verdict) so
 * the tabs actually partition the list.
 */
export function LiveFeed() {
  const [filter, setFilter] = useState(ALL);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const load = async () => {
    const apiBase = CONFIG.API_BASE_URL || "";
    try {
      setStatus("loading");
      const res = await fetch(`${apiBase}/api/factchecks?limit=100`);
      if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
      const json = await res.json();
      if (!json?.success || !Array.isArray(json.data)) throw new Error("Malformed feed response");
      setRecords(json.data);
      setStatus("ready");
    } catch {
      setRecords([]);
      setStatus("error");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const apiBase = CONFIG.API_BASE_URL || "";
      try {
        const res = await fetch(`${apiBase}/api/factchecks?limit=100`);
        if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
        const json = await res.json();
        if (cancelled) return;
        if (!json?.success || !Array.isArray(json.data)) throw new Error("Malformed feed response");
        setRecords(json.data);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setRecords([]);
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => countVerdicts(records), [records]);

  const filtered = useMemo(
    () =>
      filter === ALL
        ? records
        : records.filter((record) => parseVerdict(record.verdict).verdict === filter),
    [records, filter],
  );

  return (
    <Container size="prose" className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Live"
        title="Verification feed"
        description="Every response that carries the CivicSense civic tag: checks about Nigerian civic and political life, newest first. Off-topic requests are tagged out and never appear here. This is the same record the WhatsApp bot writes to."
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
        {status === "loading" ? (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="cs-skeleton h-14 w-full rounded-card" />
            ))}
          </div>
        ) : filtered.length ? (
          filtered.map((record, index) => (
            <VerdictRow key={record._id || record.id || index} record={record} />
          ))
        ) : records.length ? (
          <NoResults noun="checks in this verdict" onClear={() => setFilter(ALL)} />
        ) : (
          <EmptyState
            icon={status === "error" ? RefreshCw : Radio}
            title={status === "error" ? "The feed did not load" : "Nothing checked yet"}
            description={
              status === "error"
                ? "The verification service could not be reached. This is a load failure, not an empty feed."
                : "Once someone forwards a Nigerian civic or political claim to the bot, the tagged response appears here."
            }
            action={
              status === "error" ? (
                <Button variant="secondary" size="sm" onClick={load}>
                  <RefreshCw size={13} aria-hidden="true" />
                  Try again
                </Button>
              ) : (
                <a
                  href={CONFIG.WHATSAPP.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cs-btn cs-btn-primary cs-btn-sm"
                >
                  Start with WhatsApp
                </a>
              )
            }
          />
        )}
      </div>
    </Container>
  );
}

export default LiveFeed;
