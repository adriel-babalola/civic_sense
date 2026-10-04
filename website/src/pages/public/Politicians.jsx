import { useState } from "react";
import {
  ChevronDown,
  FileCheck2,
  LayoutGrid,
  ListFilter,
  Rows3,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { usePoliticians, ROLES, VIEWS } from "../../hooks/usePoliticians";
import { Container, PageHeader, NoResults, Section } from "../../components/shared/Layout";
import { SearchInput, Select, SegmentedControl, ViewToggle } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { PoliticianCard, PoliticianListRow } from "../../components/politicians/PoliticianCard";
import { Badge } from "../../components/shared/Badge";
import { INEC_SOURCE, ELECTION_DATE_LABEL, PRESIDENTIAL } from "../../data/politicians";
import { ALL } from "../../utils/constants";
import { cn } from "../../utils/cn";

const VIEW_OPTIONS = [
  { value: VIEWS.grid, label: "Grid view", icon: LayoutGrid },
  { value: VIEWS.list, label: "List view", icon: Rows3 },
];

const ROLE_OPTIONS = [
  { key: PRESIDENTIAL, label: ROLES[PRESIDENTIAL] },
  { key: "running-mate", label: ROLES["running-mate"] },
];

/**
 * Politician directory for the 2027 presidential election.
 *
 * The roster is generated from INEC's certified ticket list, so every card here
 * rests on one citable primary document rather than on a research pass. That is
 * why the page leads with the ticket and links the source instead of pitching
 * the product.
 *
 * The top padding is deliberately tight. This page used to open with 112-128px
 * of dead air under the header before a single word appeared, which pushed the
 * actual list below the fold on a phone. The header clearance lives on <main>,
 * so shrinking this container's top padding is the only change needed.
 *
 * WHY TWO LAYOUTS
 *
 * The grid and the list are not the same information at different widths; they
 * answer different questions. The grid compares people at a glance — good for
 * "who is on the ballot". The list is a record per line and is read straight
 * across — good for "which party, how old, running mate, what did they do". The
 * card had been asked to do both and did neither well, because the biography that
 * made it dense also made it unreadable at every size. So the layout is a choice
 * the visitor makes, and it is remembered.
 *
 * WHY THE FILTER BAR IS FULL WIDTH
 *
 * Party moved from a select to a row of chips carrying their counts. A select hid
 * the shape of the roster behind a click, and with seven parties a reader had to
 * open it to learn that any of them had three candidates. The chips answer that
 * on sight. That needs horizontal room, so the bar now spans the container rather
 * than sitting in a narrow column beside the results.
 *
 * The bar is sticky on mobile only. It is taller than a phone viewport once the
 * chips wrap, so pinning it there would leave no room for results; on desktop it
 * is short enough to pin without cost.
 */
export function Politicians() {
  const {
    results,
    total,
    parties,
    partyCounts,
    roleTotals,
    sorts,
    query,
    setQuery,
    party,
    setParty,
    role,
    setRole,
    sort,
    setSort,
    view,
    setView,
    isFiltered,
    activeLabels,
    reset,
  } = usePoliticians();

  // Collapsed by default: seventeen chips is a reference table, not a control,
  // and on a phone it pushed the first card off the screen.
  const [chipsOpen, setChipsOpen] = useState(false);

  return (
    <>
      <Container className="pb-14 pt-6 sm:pt-8">
        <PageHeader
          eyebrow="2027 general election"
          title="Presidential candidates"
          description={`Every ticket the Independent National Electoral Commission cleared for the ${ELECTION_DATE_LABEL} presidential election, with each running mate one click away.`}
          action={
            <Badge tone="neutral" size="md">
              {total} profiles
            </Badge>
          }
        >
          {/* Rendered inside the header block, directly under the description,
              so the provenance of every name on the page is visible before the
              first card rather than buried under the filters. */}
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
            <FileCheck2 size={13} aria-hidden="true" className="shrink-0 text-fg-faint" />
            <span>
              Source:{" "}
              <a
                href={INEC_SOURCE.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-fg underline underline-offset-2 hover:text-fg-muted"
              >
                {INEC_SOURCE.publisher}, final list of candidates
              </a>
              , published {INEC_SOURCE.published}.
            </span>
          </p>
        </PageHeader>

        {/* Filters */}
        <section
          aria-label="Filter candidates"
          className={cn(
            "z-30 mt-5 rounded-card border border-line bg-surface/90 p-3 backdrop-blur-md",
            // Sticky only on mobile. See the note above: the expanded chip row is
            // taller than a phone screen.
            "sticky top-20 md:static md:bg-surface md:backdrop-blur-none",
          )}
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto]">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name, party or running mate"
            />

            <SegmentedControl
              label="Filter by role"
              size="sm"
              value={role}
              onChange={setRole}
              options={[
                { value: ALL, label: "All", count: results.length },
                ...ROLE_OPTIONS.map((option) => ({
                  value: option.key,
                  label: option.label,
                  count: roleTotals[option.key],
                })),
              ]}
            />

            <div className="flex items-center gap-2">
              {/* Wrapped rather than given a className: <Select> drops
                  wrapperClassName when it has no label, so the flex sizing has to
                  live on an element in this file. */}
              <div className="min-w-0 flex-1 lg:w-48 lg:flex-none">
                <Select
                  aria-label="Sort results"
                  options={sorts}
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  placeholder=""
                />
              </div>
              <ViewToggle value={view} onChange={setView} options={VIEW_OPTIONS} />
            </div>
          </div>

          {/* Party chips, behind a disclosure.

              Was: a permanently expanded wall of seventeen chips sitting between
              the page header and the first card, on every screen. On a phone it
              pushed the roster clean off the fold before the reader had seen a
              single name, and it made the filter bar taller than the results it
              was filtering. Seventeen chips is a reference table, not a control,
              and it does not deserve to be the first thing on the page.

              Now: one row showing the current state, which expands on request.
              The trigger always shows what is active, so a reader who has not
              opened it can still see that a party filter is applied and undo it
              without hunting. Collapsed by default, and stays collapsed between
              visits via the same preference store the view toggle uses.

              Counts are the size of each party in the full roster, not the
              filtered result, so the number never shifts as you narrow down and
              start looking like a bug. */}
          <div className="mt-3 border-t border-line-subtle pt-3">
            {/* The disclosure and the clear control are siblings, not nested.
                A <button> inside a <button> is invalid HTML, and a focusable
                descendant of a button is unreachable in several screen readers,
                so the clear affordance has to sit outside the toggle. */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChipsOpen((open) => !open)}
                aria-expanded={chipsOpen}
                aria-controls="party-filters"
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-control py-1 text-left transition-colors hover:text-fg"
              >
                <span className="cs-eyebrow flex items-center gap-1.5">
                  <SlidersHorizontal size={11} aria-hidden="true" />
                  Party
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {party === ALL ? (
                    <span className="text-2xs text-fg-faint">All {total}</span>
                  ) : (
                    <span className="rounded-full border border-brand-bright/40 bg-brand-bright/10 px-2 py-0.5 text-2xs font-medium text-fg">
                      {party}
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 text-fg-faint transition-transform duration-200",
                      chipsOpen && "rotate-180",
                    )}
                  />
                </span>
              </button>

              {party !== ALL ? (
                <Button variant="ghost" size="sm" onClick={() => setParty(ALL)}>
                  Clear
                  <span className="cs-sr-only"> party filter</span>
                </Button>
              ) : null}
            </div>

            <div
              id="party-filters"
              hidden={!chipsOpen}
              className="cs-enter mt-2 flex flex-wrap gap-1.5"
            >
              <PartyChip
                active={party === ALL}
                onClick={() => setParty(ALL)}
                label="All parties"
                count={total}
              />
              {parties.map((name) => (
                <PartyChip
                  key={name}
                  active={party === name}
                  onClick={() => setParty(name)}
                  label={name}
                  count={partyCounts[name] || 0}
                />
              ))}
            </div>
          </div>

          {/* Result count and the specific filters in force, as removable tags.
              "Clear" alone tells you the filters exist; tags tell you which, so
              you can drop one without discarding the whole query. */}
          <div
            className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-subtle pt-3"
            role="status"
            aria-live="polite"
          >
            <p className="flex items-center gap-1.5 text-xs text-fg-muted">
              <ListFilter size={12} aria-hidden="true" />
              <span className="tabular-nums">
                {results.length} of {total}
              </span>
            </p>

            {activeLabels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  label === ROLES[PRESIDENTIAL]
                    ? setRole(ALL)
                    : label === ROLES["running-mate"]
                      ? setRole(ALL)
                      : setParty(ALL)
                }
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-2xs text-fg-secondary transition-colors hover:border-line-strong hover:text-fg"
              >
                {label}
                <X size={10} aria-hidden="true" />
                <span className="cs-sr-only">Remove this filter</span>
              </button>
            ))}

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex max-w-[16rem] items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-2xs text-fg-secondary transition-colors hover:border-line-strong hover:text-fg"
              >
                <span className="truncate">“{query}”</span>
                <X size={10} aria-hidden="true" />
                <span className="cs-sr-only">Clear this search</span>
              </button>
            ) : null}

            {isFiltered ? (
              <Button variant="ghost" size="sm" onClick={reset} className="ml-auto">
                Clear all
              </Button>
            ) : null}
          </div>
        </section>

        <div className="mt-5">
          {results.length > 0 ? (
            view === VIEWS.list ? (
              <div className="cs-stagger flex flex-col gap-1.5">
                {/* Column headings, so "which column is the party" is answered
                    once at the top instead of re-inferred from every row. */}
                <div
                  aria-hidden="true"
                  className="hidden items-center gap-3 px-3 pb-1 text-2xs uppercase tracking-[0.06em] text-fg-faint lg:flex"
                >
                  <span className="w-10 shrink-0" />
                  <span className="min-w-0 flex-1">Candidate</span>
                  <span className="w-44 shrink-0">Office</span>
                  <span className="w-36 shrink-0">Ticket</span>
                  <span className="w-14 shrink-0 text-right">Age</span>
                  <span className="w-8 shrink-0" />
                </div>
                {results.map((person) => (
                  <PoliticianListRow key={person.id} person={person} />
                ))}
              </div>
            ) : (
              <div className="cs-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((person) => (
                  <PoliticianCard key={person.id} person={person} />
                ))}
              </div>
            )
          ) : (
            <NoResults query={query} onClear={reset} noun="profiles" />
          )}
        </div>
      </Container>

      <Section bordered tight>
        <Container>
          <div className="cs-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Users size={17} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-fg">
                  Being on this list is not a record
                </p>
                <p className="mt-1 max-w-2xl text-sm text-fg-muted">
                  INEC clears people to contest. It does not assess them. Claims, court outcomes and
                  declared assets only appear on a profile when a primary source supports them, so a
                  profile with an empty record is one we have not finished researching, not a clean
                  bill of health.
                </p>
              </div>
            </div>
            <Button to="/report" variant="secondary" size="sm" className="shrink-0">
              Report something
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

/**
 * One party chip.
 *
 * A toggle button rather than a checkbox: party is single-select, and two radios
 * styled as chips would still allow neither to be selected.
 *
 * `aria-label` is explicit because the visible content computes to "ZLP2" — the
 * badge and the number are adjacent spans with no whitespace between them, so a
 * screen reader announces the count as part of the party code. Spelled out here,
 * it is "ZLP, 2 candidates", which is the sentence a sighted reader gets from
 * looking at the two pieces separately.
 */
function PartyChip({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${label}, ${count} ${count === 1 ? "candidate" : "candidates"}`}
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-brand-bright/40 bg-brand-bright/10 text-fg"
          : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg-secondary",
      )}
    >
      <span className="max-w-[9rem] truncate">{label}</span>
      <span
        className={cn(
          "text-2xs tabular-nums",
          active ? "text-brand-bright" : "text-fg-faint",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default Politicians;