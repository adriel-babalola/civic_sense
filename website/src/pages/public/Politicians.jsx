import { FileCheck2, ListFilter, Users } from "lucide-react";
import { usePoliticians, ROLES } from "../../hooks/usePoliticians";
import { Container, PageHeader, NoResults, Section } from "../../components/shared/Layout";
import { SearchInput, Select, SegmentedControl } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { PoliticianCard } from "../../components/politicians/PoliticianCard";
import { Badge } from "../../components/shared/Badge";
import { INEC_SOURCE, ELECTION_DATE_LABEL, PRESIDENTIAL } from "../../data/politicians";
import { ALL } from "../../utils/constants";

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
 */
export function Politicians() {
  const {
    results,
    total,
    parties,
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
    isFiltered,
    reset,
  } = usePoliticians();

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

        <div className="sticky top-20 z-30 -mx-5 mt-5 border-b border-line bg-surface/90 px-5 py-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none sm:py-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name, party or running mate"
            />
            <Select
              aria-label="Filter by party"
              options={parties}
              value={party}
              onChange={(event) => setParty(event.target.value)}
              placeholder="All parties"
            />
            <Select
              aria-label="Sort results"
              options={sorts}
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              placeholder=""
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl
              label="Filter by role"
              size="sm"
              value={role}
              onChange={setRole}
              options={[
                { value: ALL, label: "All", count: results.length },
                {
                  value: PRESIDENTIAL,
                  label: ROLES[PRESIDENTIAL],
                  count: roleTotals[PRESIDENTIAL],
                },
                {
                  value: "running-mate",
                  label: ROLES["running-mate"],
                  count: roleTotals["running-mate"],
                },
              ]}
              className="w-auto"
            />

            <p
              className="flex items-center gap-1.5 text-xs text-fg-muted"
              role="status"
              aria-live="polite"
            >
              <ListFilter size={12} aria-hidden="true" />
              {results.length} of {total}
              {isFiltered ? (
                <Button variant="ghost" size="sm" onClick={reset} className="ml-1">
                  Clear
                </Button>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-5">
          {results.length > 0 ? (
            <div className="cs-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((person) => (
                <PoliticianCard key={person.id} person={person} />
              ))}
            </div>
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

export default Politicians;
