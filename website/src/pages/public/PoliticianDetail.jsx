import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Cake,
  ExternalLink,
  FileCheck2,
  FileSearch,
  Gavel,
  Info,
  Landmark,
  MapPin,
  PartyPopper,
  Quote,
  Scale,
  GraduationCap,
  UserRound,
  Vote,
} from "lucide-react";
import {
  getPoliticianBySlug,
  ELECTION_DATE_LABEL,
  PRESIDENTIAL,
} from "../../data/politicians";
import { Container } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Badge, PartyBadge } from "../../components/shared/Badge";
import { Alert } from "../../components/shared/Field";
import { Accordion } from "../../components/shared/Input";
import { CopyButton } from "../../components/shared/FileUpload";
import { ShareButton } from "../../components/shared/ShareButton";
import { PoliticianPhoto, PhotoCredit } from "../../components/politicians/PoliticianPhoto";
import { NotFound } from "../NotFound";

/**
 * Politician profile.
 *
 * Two columns: identity on the left, evidence on the right. That split is the
 * point of the layout. Everything in the right column is a claim with a source
 * behind it; everything in the left is a fact about the person.
 *
 * WHAT CHANGED AND WHY
 *
 * Empty sections used to each render a card explaining that they were empty, and
 * with a sourced roster that meant four or five consecutive cards saying
 * "nothing here yet" before the reader reached a single piece of evidence. The
 * page read as broken rather than unfinished, and the eye skipped the whole right
 * column — including the one section that does matter. So a section with content
 * is now shown in place, and every empty one is gathered under one collapsed
 * disclosure. The research gaps are still named and still explained; they just no
 * longer outnumber the findings.
 *
 * The record section is the deliberate exception. Its empty state is not a
 * "missing data" message, it is the disclaimer that stops the page reading as an
 * all-clear, so it stays open and stays prominent. Collapsing that one would be
 * a UX win bought with a correctness loss.
 *
 * Actions moved to the top. Suggesting a correction to a candidate is a thing a
 * visitor arrives wanting to do, so it now sits directly under the name with
 * share and copy instead of at the bottom of a scrolling sidebar. It points at
 * its own form, not at the incident report: the profile is a sourced document,
 * and that is a different request from "I saw something at a polling unit".
 */
export function PoliticianDetail() {
  const { slug } = useParams();
  const person = getPoliticianBySlug(slug);
  const [pendingOpen, setPendingOpen] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (!person) return <NotFound />;

  const hasRecord = person.record.length > 0;

  // A ticket is a pair. Each profile points at the other half so a reader who
  // lands on a running mate can reach the candidate, and back, in one click.
  const isPresidential = person.role === PRESIDENTIAL;
  const partner = isPresidential ? person.runningMate : person.presidentialCandidate;

  /**
   * Sections that can hold sourced content. Split into filled and pending after
   * the fact so a newly researched section appears in place without a code
   * change.
   */
  const sections = [
    {
      key: "career",
      icon: Landmark,
      title: "Career highlights",
      items: person.experience,
      render: (items) => <BulletList items={items} />,
      emptyTitle: "Career history not yet transcribed",
      emptyBody:
        "Office history is compiled from primary sources before it is published here. The summary above is drawn from INEC's certified list, not from a career research pass.",
    },
    {
      key: "education",
      icon: GraduationCap,
      title: "Education",
      items: person.education,
      render: (items) => <BulletList items={items} />,
      emptyTitle: "Education not yet recorded",
      emptyBody:
        "We do not publish a figure we cannot cite, and an unsourced date of birth or degree is exactly the kind of detail that gets copied and repeated.",
    },
    {
      key: "positions",
      icon: Quote,
      title: "Public statements and known positions",
      items: [...person.statements, ...person.policies],
      render: (items) => <BulletList items={items} />,
      emptyTitle: "No statements transcribed yet",
      emptyBody:
        "Positions are quoted from the person's own words, with a link to where they said it. Paraphrase is avoided deliberately.",
    },
    {
      key: "investigations",
      icon: Gavel,
      title: "Investigations and court cases",
      items: person.investigations,
      render: (items) => (
        <ul className="space-y-2">
          {items.map((case_, index) => (
            <li key={index} className="cs-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-fg">{case_.title}</p>
                {case_.status ? (
                  <Badge tone="neutral" size="sm">
                    {case_.status}
                  </Badge>
                ) : null}
              </div>
              {case_.date ? (
                <p className="mt-1 text-2xs text-fg-faint">{case_.date}</p>
              ) : null}
              {case_.source ? (
                <a
                  href={case_.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-brand-bright hover:underline"
                >
                  <ExternalLink size={11} aria-hidden="true" />
                  Source
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ),
      emptyTitle: "No court cases published",
      emptyBody:
        "This means we have not published one. It does not mean there are none. Where a case exists we report its stage, including where it ended in an acquittal, a dismissal, or no charges.",
    },
  ];

  const sourced = sections.filter((section) => section.items.length > 0);
  const pending = sections.filter((section) => section.items.length === 0);

  return (
    <Container className="pb-14 pt-5 sm:pt-7">
      <Link
        to="/politicians"
        className="inline-flex items-center gap-1.5 rounded text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All politicians
      </Link>

      <div className="cs-enter mt-6 grid gap-8 lg:grid-cols-[20rem_1fr] lg:gap-10">
        {/* ---------------- Identity ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <PoliticianPhoto person={person} className="aspect-[4/5] w-full" />
          <PhotoCredit person={person} />

          <div>
            <h1 className="text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-fg sm:text-[2rem]">
              {person.name}
            </h1>
            <p className="mt-1.5 text-[0.9375rem] text-fg-secondary">{person.office}</p>

            {/* Party and certification sit directly under the name, where a
                reader checks them before anything else on the page. The state
                moves down into At a glance — it is context, not identity. */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <PartyBadge party={person.party} size="md" />
              <Badge tone="verified" size="md">
                <FileCheck2 size={11} aria-hidden="true" />
                INEC certified
              </Badge>
              <Badge tone="neutral" size="md">
                <MapPin size={11} aria-hidden="true" />
                {person.state}
              </Badge>
            </div>
          </div>

          {/* Actions grouped as one row under the name. Suggesting an update leads
              because it is the reason someone opens a profile of a specific
              person from a result they just saw elsewhere.

              This used to point at /report?politician=, which fused the two jobs:
              an anonymous incident form carrying a named subject. Incident
              reports are for polling units and are anonymous on purpose; a
              profile change needs a source and a review. Suggesting a correction
              to a profile is now its own form and its own route. */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              to={`/politicians/${person.id}/suggest`}
              variant="primary"
              size="sm"
            >
              <FileSearch size={13} aria-hidden="true" />
              Suggest an update
            </Button>
            <ShareButton
              title={person.name}
              text={`The CivicSense profile for ${person.name}.`}
              url={shareUrl}
              size="sm"
              variant="secondary"
            />
            <CopyButton value={shareUrl} label="Copy link" copiedLabel="Copied" size="sm" />
          </div>

          <Link
            to={partner.href}
            className="cs-card cs-card-interactive flex items-center gap-3 p-3"
          >
            <PoliticianPhoto
              person={getPoliticianBySlug(partner.slug) || person}
              className="h-11 w-11 shrink-0 rounded-full"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-2xs uppercase tracking-wide text-fg-faint">
                {isPresidential ? "Running mate" : "Presidential candidate"}
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium text-fg">
                {partner.name}
              </span>
            </span>
            <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-fg-faint" />
          </Link>

          <Glance person={person} isPresidential={isPresidential} hasRecord={hasRecord} />

          <div className="cs-card flex gap-2.5 p-4">
            <Info size={14} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-fg-muted">
              CivicSense publishes sourced records, not convictions. A charge is not a finding. A
              verdict here is a research aid, not a legal judgement.
            </p>
          </div>
        </aside>

        {/* ---------------- Evidence ---------------- */}
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="text-heading text-fg">Overview</h2>
            <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-secondary">
              {person.bio}
            </p>
          </section>

          {/* Only sections with sourced content, in a fixed order. */}
          {sourced.map((section) => (
            <section key={section.key}>
              <h2 className="mb-3 flex items-center gap-2 text-heading text-fg">
                <section.icon size={15} className="text-fg-faint" aria-hidden="true" />
                {section.title}
              </h2>
              {section.render(section.items)}
            </section>
          ))}

          {/* The record section stays open whether or not it is empty: see the
              note at the top of this file. */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-heading text-fg">
              <Scale size={15} className="text-fg-faint" aria-hidden="true" />
              Public record
            </h2>
            {hasRecord ? (
              <ul className="space-y-2">
                {person.record.map((entry, index) => (
                  <li key={index} className="cs-card p-3">
                    <p className="text-sm text-fg-secondary">{entry}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Alert tone="info" title="Nothing verified yet">
                We have not published any record entries for {person.name}. That is not a
                statement that the record is clean. It means our research is incomplete. Entries
                appear here only when they can be tied to a primary source and a date.
              </Alert>
            )}
          </section>

          {/* Every empty section, gathered. Still named and still explained, so
              the gap is disclosed rather than hidden — it just stops occupying
              more space than the evidence does. */}
          {pending.length > 0 ? (
            <div className="cs-card overflow-hidden px-4">
              <Accordion
                open={pendingOpen}
                onToggle={() => setPendingOpen((open) => !open)}
                question={`Not yet verified (${pending.length})`}
              >
                <p className="mb-3 text-fg-muted">
                  These sections are empty because the research is not finished. An empty section
                  is not a finding about this person.
                </p>
                <ul className="space-y-3">
                  {pending.map((section) => (
                    <li key={section.key}>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-fg-secondary">
                        <section.icon size={13} className="text-fg-faint" aria-hidden="true" />
                        {section.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                        {section.emptyTitle}. {section.emptyBody}
                      </p>
                    </li>
                  ))}
                </ul>
              </Accordion>
            </div>
          ) : null}

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-heading text-fg">
              <ExternalLink size={15} className="text-fg-faint" aria-hidden="true" />
              Sources
            </h2>
            <div className="space-y-2">
              <a
                href={person.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-card cs-card-interactive block px-3 py-2.5"
              >
                <span className="flex items-center gap-2">
                  <FileCheck2 size={13} className="shrink-0 text-fg-faint" aria-hidden="true" />
                  <span className="text-sm font-medium text-fg">
                    {person.source.publisher}: {person.source.title}
                  </span>
                </span>
                <span className="mt-1 block pl-5 text-xs text-fg-muted">
                  Published {person.source.published}. Signed by {person.source.signedBy}.
                </span>
              </a>

              {person.reference ? (
                <a
                  href={person.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cs-card cs-card-interactive flex items-center gap-2 px-3 py-2.5"
                >
                  <ExternalLink size={13} className="shrink-0 text-fg-faint" aria-hidden="true" />
                  <span className="text-sm text-fg-secondary hover:text-fg">
                    Encyclopaedia entry, check the name and party independently
                  </span>
                </a>
              ) : (
                <div className="cs-card p-3.5">
                  <p className="text-sm font-medium text-fg-secondary">No source linked</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                    Without a reference to check against, nothing on this page should be relied on.
                    That is the honest state of this profile.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}

/**
 * "At a glance", as a two-column icon grid.
 *
 * This was six rows of label-left / value-right, and the values were long enough
 * — "Presidential candidate", "All Progressives Congress" — to wrap on a phone,
 * so the list doubled in height and neither column could be scanned. A grid of
 * small labelled values wraps consistently, and the icons mean the eye can land
 * on the row it wants instead of reading all six to find the age.
 *
 * Values are clamped to two lines. Truncating a party name is acceptable; the full
 * name is in the card above and on the directory row.
 */
function Glance({ person, isPresidential, hasRecord }) {
  const partner = isPresidential ? person.runningMate : person.presidentialCandidate;

  const items = [
    { icon: UserRound, label: "Role", value: person.office },
    { icon: Vote, label: "Party", value: person.partyName, title: person.partyName },
    { icon: MapPin, label: "State", value: person.state },
    { icon: Cake, label: "Age on the INEC form", value: person.age ? String(person.age) : "Not stated" },
    { icon: CalendarDays, label: "Election", value: ELECTION_DATE_LABEL },
    {
      icon: PartyPopper,
      label: isPresidential ? "Running mate" : "Presidential candidate",
      value: partner.name,
    },
  ];

  return (
    <div className="cs-card p-4">
      <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
        At a glance
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3.5">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="flex items-center gap-1 text-2xs text-fg-faint">
              <item.icon size={10} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </dt>
            <dd
              className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-fg"
              title={item.title || item.value}
            >
              {item.value || "Not stated"}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3.5 border-t border-line-subtle pt-3 text-2xs text-fg-faint">
        {hasRecord
          ? `${person.record.length} sourced record ${person.record.length === 1 ? "entry" : "entries"}`
          : "No sourced record entries yet"}
      </p>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-2.5 text-sm leading-relaxed text-fg-secondary"
        >
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-faint" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default PoliticianDetail;