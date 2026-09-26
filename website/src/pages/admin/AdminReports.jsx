import { useMemo, useState } from "react";
import { Check, ImageIcon, ShieldAlert, X } from "lucide-react";
import { useReports } from "../../hooks/useReports";
import { ALL, REPORT_STATUS_META, INCIDENT_META } from "../../utils/constants";
import { Container, PageHeader, EmptyState, ErrorState, NoResults } from "../../components/shared/Layout";
import { SegmentedControl, SearchInput, Select } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { StatusBadge, TypeBadge } from "../../components/shared/Badge";
import { Alert } from "../../components/shared/Field";
import { Skeleton } from "../../components/shared/Skeleton";
import { formatDateTime, relativeTime } from "../../utils/formatters";

/**
 * Moderation queue.
 *
 * The only page where a click has consequences: approving a report publishes
 * it to the public incident map. So the confirm step exists, the buttons show
 * which report they are about, and a failed action says so instead of
 * optimistically disappearing the row.
 */
export function AdminReports() {
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [type, setType] = useState(ALL);
  const [pendingId, setPendingId] = useState(null);

  const {
    reports,
    counts,
    isLoading,
    error,
    approve,
    reject,
    refresh,
  } = useReports(status || undefined, { intervalMs: 60_000 });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reports.filter((report) => {
      if (type !== ALL && report.type !== type) return false;
      if (!needle) return true;
      return (
        report.description?.toLowerCase().includes(needle) ||
        report.state?.toLowerCase().includes(needle) ||
        report.lga?.toLowerCase().includes(needle)
      );
    });
  }, [reports, query, type]);

  const run = async (id, action) => {
    setPendingId(id);
    await (action === "approve" ? approve(id) : reject(id));
    setPendingId(null);
  };

  const isFiltered = Boolean(query.trim()) || type !== ALL;

  const clearFilters = () => {
    setQuery("");
    setType(ALL);
  };

  return (
    <Container size="prose" className="py-8">
      <PageHeader
        eyebrow="Moderation"
        title="Reports queue"
        description="Approving a report publishes it to the public incident map with its description, state and LGA. Rejecting keeps it private."
        action={
          <Button variant="secondary" size="sm" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Filter by status"
          value={status || ALL}
          onChange={(value) => setStatus(value === ALL ? "" : value)}
          options={[
            { value: "pending", label: "Pending", count: counts.pending },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Rejected", count: counts.rejected },
            { value: ALL, label: "All" },
          ]}
        />
        <p className="text-xs text-fg-faint">{filtered.length} shown</p>
      </div>

      {error ? <ErrorState className="mt-4" error={error} onRetry={refresh} /> : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_180px]">
        <SearchInput value={query} onChange={setQuery} placeholder="Search reports" />
        <Select
          aria-label="Filter by incident type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          options={Object.entries(INCIDENT_META).map(([value, meta]) => ({
            value,
            label: meta.label,
          }))}
          placeholder="All types"
        />
      </div>

      <div className="mt-4 space-y-2.5">
        {isLoading && !reports.length ? (
          [0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-28 w-full rounded-card" />
          ))
        ) : filtered.length ? (
          filtered.map((report) => (
            <ReportRow
              key={report._id || report.id}
              report={report}
              isPending={pendingId === (report._id || report.id)}
              onApprove={() => run(report._id || report.id, "approve")}
              onReject={() => run(report._id || report.id, "reject")}
            />
          ))
        ) : isFiltered ? (
          <NoResults query={query} noun="reports" onClear={clearFilters} />
        ) : (
          <EmptyState
            icon={ShieldAlert}
            title={
              status === "pending"
                ? "The queue is clear"
                : `No ${REPORT_STATUS_META[status]?.label.toLowerCase() || ""} reports`
            }
            description={
              status === "pending"
                ? "Nothing is waiting for a decision."
                : "Nothing has been decided in this state yet."
            }
          />
        )}
      </div>

      <Alert tone="info" className="mt-6">
        The moderation endpoints on the server are currently unauthenticated. This page hides them
        behind a browser gate, which is a usability affordance and not a security control.
      </Alert>
    </Container>
  );
}

/** One report, with the decision attached to it rather than to a toolbar. */
function ReportRow({ report, isPending, onApprove, onReject }) {
  const id = report._id || report.id;
  const [confirming, setConfirming] = useState(null);

  return (
    <article className="cs-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={report.type} />
        <StatusBadge status={report.status} />
        <span className="text-sm font-medium text-fg">
          {report.state}
          {report.lga ? ` · ${report.lga}` : ""}
        </span>
        <span className="ml-auto text-2xs text-fg-faint" title={formatDateTime(report.timestamp)}>
          {relativeTime(report.timestamp)}
        </span>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-fg-secondary">{report.description}</p>

      {report.evidence ? (
        <p className="cs-hint mt-2 flex items-center gap-1.5">
          <ImageIcon size={12} aria-hidden="true" />
          Evidence attached as {String(report.evidence).slice(0, 40)}
          {String(report.evidence).length > 40 ? "…" : ""}
        </p>
      ) : null}

      <p className="cs-hint mt-2 font-mono text-2xs">id: {id}</p>

      {report.status === "pending" ? (
        <div className="mt-3.5 border-t border-line pt-3">
          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-fg-secondary">
                {confirming === "approve"
                  ? "Publish this to the public map?"
                  : "Reject and keep this private?"}
              </p>
              <Button
                variant={confirming === "approve" ? "primary" : "danger"}
                size="sm"
                loading={isPending}
                onClick={() => {
                  setConfirming(null);
                  if (confirming === "approve") onApprove();
                  else onReject();
                }}
              >
                Yes, {confirming}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => setConfirming("approve")}>
                <Check size={13} aria-hidden="true" />
                Approve and publish
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirming("reject")}>
                <X size={13} aria-hidden="true" />
                Reject
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default AdminReports;
