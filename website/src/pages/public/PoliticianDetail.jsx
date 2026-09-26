import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  FileCheck2,
  FileWarning,
  Gavel,
  Info,
  Landmark,
  MapPin,
  Quote,
  Scale,
  GraduationCap,
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
 * The record sections are built to fail visibly. With nothing sourced they say
 * so, and the copy says explicitly that this is not an all-clear, because a
 * reassuring empty state reads as a clean bill of health and would be the single
 * most misleading thing this page could show.
 */
export function PoliticianDetail() {
  const { slug } = useParams();
  const person = getPoliticianBySlug(slug);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (!person) return <NotFound />;

  const hasRecord = person.record.length > 0;
  const hasInvestigations = person.investigations.length > 0;
  const hasPolicies = person.policies.length + person.statements.length > 0;
  const hasExperience = person.experience.length > 0;
  const hasEducation = person.education.length > 0;

  // A ticket is a pair. Each profile points at the other half so a reader who
  // lands on a running mate can reach the candidate, and back, in one click.
  const isPresidential = person.role === PRESIDENTIAL;
  const partner = isPresidential ? person.runningMate : person.presidentialCandidate;

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

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PartyBadge party={person.party} size="md" />
              <Badge tone="neutral" size="md">
                <MapPin size={11} aria-hidden="true" />
                {person.state}
              </Badge>
              <Badge tone="verified" size="md">
                <FileCheck2 size={11} aria-hidden="true" />
                INEC certified
              </Badge>
            </div>
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

          <div className="flex gap-2">
            <ShareButton
              title={person.name}
              text={`The CivicSense profile for ${person.name}.`}
              url={shareUrl}
              className="flex-1"
            />
            <CopyButton value={shareUrl} label="Copy link" copiedLabel="Copied" size="md" />
          </div>

          <div className="cs-card p-4">
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
              At a glance
            </p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row label="Role" value={person.office} />
              <Row label="Party" value={`${person.party} (${person.partyName})`} />
              {person.age ? <Row label="Age on the INEC form" value={String(person.age)} /> : null}
              <Row label="Election" value={ELECTION_DATE_LABEL} />
              <Row
                label={isPresidential ? "Running mate" : "Presidential candidate"}
                value={partner.name}
              />
              <Row
                label="Record entries"
                value={hasRecord ? String(person.record.length) : "None verified"}
              />
            </dl>
          </div>

          <div className="cs-card p-4">
            <FileWarning size={16} className="text-misleading" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-fg">Know something we do not?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
              Report misconduct, a court case or a documented broken promise. No name required.
            </p>
            <Button
              to={`/report?politician=${encodeURIComponent(person.name)}`}
              variant="primary"
              size="sm"
              className="mt-3"
              fullWidth
            >
              Report about {person.name.split(" ").slice(-1)[0]}
            </Button>
          </div>

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
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-fg-secondary">
              {person.bio}
            </p>
          </section>

          <Section icon={Landmark} title="Career highlights">
            {hasExperience ? (
              <BulletList items={person.experience} />
            ) : (
              <Empty
                title="Career history not yet transcribed"
                body="Office history is compiled from primary sources before it is published here. The summary above is drawn from INEC's certified list, not from a career research pass."
              />
            )}
          </Section>

          <Section icon={GraduationCap} title="Education">
            {hasEducation ? (
              <BulletList items={person.education} />
            ) : (
              <Empty
                title="Education not yet recorded"
                body="We do not publish a figure we cannot cite, and an unsourced date of birth or degree is exactly the kind of detail that gets copied and repeated."
              />
            )}
          </Section>

          <Section icon={Quote} title="Public statements and known positions">
            {hasPolicies ? (
              <BulletList items={[...person.statements, ...person.policies]} />
            ) : (
              <Empty
                title="No statements transcribed yet"
                body="Positions are quoted from the person's own words, with a link to where they said it. Paraphrase is avoided deliberately."
              />
            )}
          </Section>

          <Section icon={Scale} title="Public record">
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
          </Section>

          <Section icon={Gavel} title="Investigations and court cases">
            {hasInvestigations ? (
              <ul className="space-y-2">
                {person.investigations.map((case_, index) => (
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
            ) : (
              <Empty
                title="No court cases published"
                body="This means we have not published one. It does not mean there are none. Where a case exists we report its stage, including where it ended in an acquittal, a dismissal, or no charges."
              />
            )}
          </Section>

          <Section icon={ExternalLink} title="Sources">
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
                className="cs-card cs-card-interactive inline-flex items-center gap-2 px-3 py-2.5"
              >
                <ExternalLink size={13} className="text-fg-faint" aria-hidden="true" />
                <span className="text-sm text-fg-secondary hover:text-fg">
                  Encyclopaedia entry, check the name and party independently
                </span>
              </a>
            ) : (
              <Empty
                title="No source linked"
                body="Without a reference to check against, nothing on this page should be relied on. That is the honest state of this profile."
              />
            )}
          </Section>
        </div>
      </div>
    </Container>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-heading text-fg">
        {Icon ? <Icon size={15} className="text-fg-faint" aria-hidden="true" /> : null}
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Neutral empty state for a researched section.
 *
 * Says what is missing and what it means. The wording matters more than the
 * styling: an unfilled section must never be readable as a positive finding.
 */
function Empty({ title, body }) {
  return (
    <div className="cs-card p-3.5">
      <p className="text-sm font-medium text-fg-secondary">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{body}</p>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-fg-secondary">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-faint" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-fg-muted">{label}</dt>
      <dd className="text-right font-medium text-fg">{value}</dd>
    </div>
  );
}

export default PoliticianDetail;
