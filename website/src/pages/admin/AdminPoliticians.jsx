import { useMemo, useState } from "react";
import { Database, Download, TriangleAlert, Users } from "lucide-react";
import { usePoliticians } from "../../hooks/usePoliticians";
import {
  UNIQUE_POLITICIANS,
  PRESIDENTIAL,
  RUNNING_MATE,
} from "../../data/politicians";
import { LGAS } from "../../data/lgas";
import { ALL } from "../../utils/constants";
import { Container, PageHeader, Meter, Stat } from "../../components/shared/Layout";
import { SearchInput, Select } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { Alert } from "../../components/shared/Field";
import { Badge, PartyBadge } from "../../components/shared/Badge";

/**
 * Politician dataset management.
 *
 * There is no `POST /api/politicians` yet, so this screen cannot honestly
 * offer create/edit/delete. Two options were rejected: faking a form that
 * writes to localStorage and calling it a database, and hiding the gap. So
 * this is a read-only review tool — plus the two things that genuinely help the
 * team grow the roster: a quality report on the file as it stands, and a CSV
 * export to work from offline.
 */
export function AdminPoliticians() {
  const {
    results,
    total,
    parties,
    roleTotals,
    query,
    setQuery,
    party,
    setParty,
    role,
    setRole,
    isFiltered,
    reset,
  } = usePoliticians();

  const [format, setFormat] = useState("csv");

  /** Data-quality checks. Each one maps to a real editorial failure mode. */
  const checks = useMemo(() => {
    const slugs = UNIQUE_POLITICIANS.map((person) => person.id);
    const missingReference = UNIQUE_POLITICIANS.filter((person) => !person.reference);
    // Candidacy is certified against a primary document, so "unverified" no
    // longer describes this roster. What can still be wrong is a profile that
    // renders a photo with no licence behind it, which is the check that
    // actually protects readers here.
    const unlicensedPhotos = UNIQUE_POLITICIANS.filter(
      (person) => person.photo && !person.photoCredit,
    );
    const unsourced = UNIQUE_POLITICIANS.filter((person) => !person.source?.url);
    const lgaStates = Object.keys(LGAS).length;

    return [
      {
        label: "Duplicate slugs",
        value: slugs.length - new Set(slugs).size,
        ok: slugs.length === new Set(slugs).size,
        hint: "A duplicate produces two cards and two identical profile URLs.",
      },
      {
        label: "Missing reference link",
        value: missingReference.length,
        ok: missingReference.length === 0,
        hint: "Every entry needs a citable source before it is published.",
      },
      {
        label: "Photos without a licence",
        value: unlicensedPhotos.length,
        ok: unlicensedPhotos.length === 0,
        hint: "A portrait of a living person must carry its author, licence and source.",
      },
      {
        label: "Profiles without a source",
        value: unsourced.length,
        ok: unsourced.length === 0,
        hint: "Every candidacy claim has to point at the INEC document it came from.",
      },
      {
        label: "States with an LGA roster",
        value: lgaStates,
        ok: lgaStates > 0,
        hint: "The report form falls back to a text input until this is populated from the INEC gazette.",
      },
    ];
  }, []);

  const exportCsv = () => {
    const header = ["id", "name", "party", "state", "level", "office", "since", "reference"];
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = UNIQUE_POLITICIANS.map((person) =>
      [
        person.id,
        person.name,
        person.party,
        person.state,
        person.level,
        person.office,
        person.since,
        person.reference,
      ]
        .map(escape)
        .join(","),
    );

    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "civicsense-politicians.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(UNIQUE_POLITICIANS, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "civicsense-politicians.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container size="prose" className="py-8">
      <PageHeader
        eyebrow="Dataset"
        title="Politicians"
        description="The profile directory ships with the bundle. Editing it still means a pull request, because there is no CRUD API behind this screen."
        action={
          <div className="flex items-center gap-2">
            <Select
              aria-label="Export format"
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              options={[
                { value: "csv", label: "CSV" },
                { value: "json", label: "JSON" },
              ]}
              placeholder=""
            />
            <Button variant="secondary" size="sm" onClick={format === "csv" ? exportCsv : exportJson}>
              <Download size={13} aria-hidden="true" />
              Export
            </Button>
          </div>
        }
      />

      <Alert tone="warning" className="mt-5" title="Read-only by necessity">
        There is no <code className="font-mono">POST /api/politicians</code> on the server, so
        there is nowhere for an edit made here to be stored. Adding, editing or deleting a
        profile is a change to{" "}
        <code className="font-mono">src/data/politicians.js</code> and needs the editorial checks
        below to pass first.
      </Alert>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Profiles" value={total} icon={Users} />
        <Stat
          label="Presidential candidates"
          value={roleTotals[PRESIDENTIAL]}
          tone="brand"
        />
        <Stat label="Running mates" value={roleTotals[RUNNING_MATE]} tone="brand" />
      </div>

      <section className="cs-card mt-5 p-4">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-fg-muted" aria-hidden="true" />
          <h2 className="text-heading text-fg">Data quality</h2>
        </div>

        <ul className="mt-3 space-y-2.5">
          {checks.map((check) => (
            <li key={check.label} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={
                  check.ok
                    ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-verified"
                    : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-misleading"
                }
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-fg">
                  {check.label}{" "}
                  <span className={check.ok ? "text-verified" : "text-misleading"}>
                    {check.value}
                  </span>
                </p>
                <p className="text-2xs text-fg-faint">{check.hint}</p>
              </div>
            </li>
          ))}
        </ul>

        {checks.some((check) => !check.ok) ? (
          <p className="cs-hint mt-3 flex items-start gap-1.5">
            <TriangleAlert size={12} className="mt-0.5 shrink-0 text-misleading" aria-hidden="true" />
            Public profiles render an explicit "not verified" state, so none of this is hidden from
            a reader, but none of it is a publishable roster yet.
          </p>
        ) : null}
      </section>

      <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_150px_150px_130px]">
        <SearchInput value={query} onChange={setQuery} placeholder="Search profiles" />
        <Select
          aria-label="Filter by party"
          value={party}
          onChange={(event) => setParty(event.target.value)}
          options={parties}
          placeholder="All parties"
        />
        <Select
          aria-label="Filter by role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          options={[
            { value: ALL, label: "All roles" },
            { value: PRESIDENTIAL, label: "Presidential candidate" },
            { value: RUNNING_MATE, label: "Running mate" },
          ]}
          placeholder=""
        />
      </div>

      <p className="cs-hint mt-2" role="status" aria-live="polite">
        {results.length} of {total}
        {isFiltered ? " " : ""}
        {isFiltered ? (
          <button
            type="button"
            onClick={reset}
            className="ml-1 text-brand-bright underline underline-offset-2"
          >
            clear filters
          </button>
        ) : null}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-2xs uppercase tracking-[0.08em] text-fg-faint">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Name
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Role
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Party
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Ticket partner
              </th>
              <th scope="col" className="py-2 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((person) => (
              <tr key={person.id} className="border-b border-line-subtle">
                <td className="py-2.5 pr-3 text-fg">{person.name}</td>
                <td className="py-2.5 pr-3 text-fg-secondary">{person.office}</td>
                <td className="py-2.5 pr-3">
                  <PartyBadge party={person.party} />
                </td>
                <td className="py-2.5 pr-3 text-fg-secondary">
                  {person.role === PRESIDENTIAL
                    ? person.runningMate.name
                    : person.presidentialCandidate.name}
                </td>
                <td className="py-2.5">
                  <Badge tone={person.verification} size="sm">
                    {person.verification}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length ? (
        <div className="mt-4 space-y-2">
          {parties.slice(0, 6).map((name) => (
            <Meter
              key={name}
              label={name}
              value={UNIQUE_POLITICIANS.filter((person) => person.party === name).length}
              total={total}
            />
          ))}
        </div>
      ) : null}
    </Container>
  );
}

export default AdminPoliticians;
