import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { PartyBadge } from "../shared/Badge";
import { ShareButton } from "../shared/ShareButton";
import { PoliticianPhoto } from "./PoliticianPhoto";

/**
 * Politician card, for the directory's grid view.
 *
 * The whole card is a link target, but it is NOT a <Link>. Wrapping a card in
 * a link and then putting a share button inside it nests one interactive
 * element in another: the button becomes unreachable by keyboard, and clicking
 * it can activate the surrounding navigation depending on how the padding is
 * written. So the link is an overlay pseudo-layer instead, and the share button
 * sits above it with a z-index.
 *
 * The running mate is shown on the card as a second, separately clickable
 * profile link, because a voter reads a ticket as a pair. That link is nested
 * inside a card whose heading is already a link overlay, so it carries a z-index
 * of its own to win the stacking order and reach its own destination.
 *
 * WHAT WAS CUT
 *
 * The biography used to run here at 130 characters, clamped to two lines. It was
 * the single densest thing on the page and it said almost nothing: it restated the
 * office and the party that sit two lines above it, so thirty-six cards repeated
 * the same sentence thirty-six times. It now lives only on the profile, which is
 * where someone goes precisely to read it. What is left is the name, the ticket
 * and the two numbers that differ between people — which is what a visitor
 * scanning a directory is actually comparing.
 *
 * The party is a pill carrying the INEC code, with the full name on the title
 * attribute and in the partner row. Printing "APC (All Progressives Congress)" on
 * every card put eighteen abbreviations and eighteen long names in competition.
 */
export function PoliticianCard({ person, className }) {
  const href = `/politicians/${person.id}`;
  const url = typeof window !== "undefined" ? window.location.origin + href : "";
  const isPresidential = person.role === "presidential";
  const partner = isPresidential ? person.runningMate : person.presidentialCandidate;

  return (
    <article
      className={cn(
        "cs-card cs-card-interactive group relative flex flex-col gap-3 p-4 focus-within:outline-none",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <PoliticianPhoto
          person={person}
          showCertifiedTick
          className="h-12 w-12 shrink-0 rounded-full"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-fg">
            <Link
              to={href}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {person.name}
            </Link>
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-fg-muted">{person.office}</p>
        </div>

        {/* z-10 keeps this clickable: the link overlay above is a pseudo-element
            of the heading, and without this the click lands on the navigation. */}
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <ShareButton
            title={person.name}
            text={`The CivicSense profile for ${person.name}.`}
            url={url}
            label={`Share the profile for ${person.name}`}
            iconOnly
            size="sm"
            variant="ghost"
          />
          <ArrowUpRight
            size={14}
            aria-hidden="true"
            className="mt-1 shrink-0 text-fg-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg-muted"
          />
        </div>
      </div>

      {/* The partner link must out-rank the card's own link overlay. */}
      <Link
        to={partner.href}
        title={`${person.partyName} · ${isPresidential ? "running mate" : "presidential candidate"}`}
        className="relative z-10 -mt-1 flex items-center gap-2 self-start rounded text-xs text-fg-muted transition-colors hover:text-fg"
      >
        <span className="shrink-0 text-2xs uppercase tracking-wide text-fg-faint">
          {isPresidential ? "Running mate" : "Presidential"}
        </span>
        <span className="truncate font-medium underline underline-offset-2">
          {partner.name}
        </span>
      </Link>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-line-subtle pt-3">
        <PartyBadge party={person.party} className="max-w-full truncate" />
        <span className="min-w-0 truncate text-2xs text-fg-faint" title={person.partyName}>
          {person.partyName}
        </span>
        {person.age ? (
          <span className="ml-auto shrink-0 text-2xs tabular-nums text-fg-faint">
            {person.age}
          </span>
        ) : null}

        {/* Record status, for assistive technology only.

            This used to read "No verified record" on every card. The guarantee it
            carried is real: an empty profile is unfinished research, not an
            all-clear. But with the whole roster unresearched it rendered the same
            sentence thirty-six times, which trains a reader to skip the one card
            that eventually differs. So it stays available to a screen reader, and
            for sighted readers the note directly under the grid says the same
            thing once, for everyone. A count appears visibly only when there is
            actually something to count. */}
        <span className="cs-sr-only">
          {person.record.length
            ? `${person.record.length} sourced record ${person.record.length === 1 ? "entry" : "entries"}`
            : "No verified record. This profile has not been researched yet, which is not a clean bill of health."}
        </span>
      </div>
    </article>
  );
}

/**
 * Politician row, for the directory's list view.
 *
 * A row is a scannable record, not a summary: photo, name, ticket, party, age,
 * status. This is the layout that answers "who is on the APC ticket and how old
 * are they" in one pass, which a three-column card grid cannot do at any width,
 * because the eye has to leave the card it is in to compare anything.
 *
 * On a phone the same row collapses to two lines with the party and age beneath
 * the name. Nothing is dropped: the grid becomes `Name | Party | Age`, because a
 * four-column table on a 375px screen is a worse version of the same problem.
 */
export function PoliticianListRow({ person, className }) {
  const href = `/politicians/${person.id}`;
  const url = typeof window !== "undefined" ? window.location.origin + href : "";
  const isPresidential = person.role === "presidential";
  const partner = isPresidential ? person.runningMate : person.presidentialCandidate;

  return (
    <article
      className={cn(
        "cs-card cs-card-interactive group relative flex items-center gap-3 p-3 focus-within:outline-none",
        className,
      )}
    >
      <PoliticianPhoto
        person={person}
        showCertifiedTick
        className="h-10 w-10 shrink-0 rounded-full"
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-fg">
          <Link
            to={href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {person.name}
          </Link>
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <PartyBadge party={person.party} />
          <span className="truncate text-2xs text-fg-faint" title={person.partyName}>
            {person.partyName}
          </span>
        </div>

        {/* Party and role are already legible on wide screens, so below `sm` the
            row needs the ticket's other half spelled out rather than abbreviated. */}
        <p className="mt-1 truncate text-2xs text-fg-muted sm:hidden">
          {person.office} · with {partner.name}
        </p>
      </div>

      <span className="hidden w-44 shrink-0 truncate text-xs text-fg-muted lg:block">
        {person.office}
      </span>

      <span className="hidden w-36 shrink-0 truncate text-xs text-fg-muted xl:block">
        with {partner.name}
      </span>

      <span className="w-14 shrink-0 text-right text-xs tabular-nums text-fg-muted">
        {person.age ? `${person.age} yrs` : "n/a"}
      </span>

      <span className="sr-only">{person.record.length ? "Has a published record" : "No verified record"}</span>

      <div className="relative z-10 flex shrink-0 items-center">
        <ShareButton
          title={person.name}
          text={`The CivicSense profile for ${person.name}.`}
          url={url}
          label={`Share the profile for ${person.name}`}
          iconOnly
          size="sm"
          variant="ghost"
        />
      </div>
    </article>
  );
}

export default PoliticianCard;