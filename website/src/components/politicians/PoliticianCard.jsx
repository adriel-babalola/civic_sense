import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { PartyBadge } from "../shared/Badge";
import { ShareButton } from "../shared/ShareButton";
import { PoliticianPhoto } from "./PoliticianPhoto";
import { truncate } from "../../utils/formatters";

/**
 * Politician card.
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
 */
export function PoliticianCard({ person, className }) {
  const href = `/politicians/${person.id}`;
  const url = typeof window !== "undefined" ? window.location.origin + href : "";
  const partner = person.role === "presidential" ? person.runningMate : person.presidentialCandidate;

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
          className="h-14 w-14 shrink-0 rounded-full"
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
        className="relative z-10 -mt-1 flex items-center gap-2 self-start rounded text-xs text-fg-muted transition-colors hover:text-fg"
      >
        <span className="shrink-0 text-2xs uppercase tracking-wide text-fg-faint">
          {person.role === "presidential" ? "Running mate" : "Presidential"}
        </span>
        <span className="truncate font-medium underline underline-offset-2">
          {partner.name}
        </span>
      </Link>

      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-fg-secondary">
        {truncate(person.bio, 130)}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-line-subtle pt-3">
        <PartyBadge party={person.party} />
        <span className="text-2xs text-fg-faint">{person.partyName}</span>
        {person.age ? <span className="text-2xs text-fg-faint">Age {person.age}</span> : null}
        {person.record.length === 0 ? (
          // Stated up front rather than implied by an empty section further down.
          <span className="ml-auto text-2xs text-fg-faint">No verified record</span>
        ) : (
          <span className="ml-auto text-2xs text-fg-faint">
            {person.record.length} sourced
          </span>
        )}
      </div>
    </article>
  );
}

export default PoliticianCard;
