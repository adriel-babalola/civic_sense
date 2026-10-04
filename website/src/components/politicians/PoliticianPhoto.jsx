import { BadgeCheck } from "lucide-react";
import { cn } from "../../utils/cn";
import { initials, slugify } from "../../utils/formatters";

/**
 * Tint for a portrait-less profile.
 *
 * Thirty of the thirty-six profiles have no photograph, and thirty identical grey
 * circles made the directory read as a wall of the same missing thing. The tint is
 * derived from the name, so a given person keeps the same colour on the card, the
 * list row and the profile page, and two adjacent entries do not collide.
 *
 * Deliberately desaturated. These are placeholders standing in for a photo, not
 * decoration, so they sit close to the surface and never compete with the
 * candidates who do have a face.
 */
function tintFor(name = "") {
  const hash = [...slugify(name)].reduce((total, char) => total + char.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

/** Muted, low-chroma tints that sit between the surface and the card. */
const PALETTES = [
  "from-[#161b22] to-[#11151b]",
  "from-[#1a1712] to-[#141210]",
  "from-[#121a18] to-[#0f1514]",
  "from-[#1b1418] to-[#150f13]",
  "from-[#141a1f] to-[#101418]",
  "from-[#181a14] to-[#131410]",
];

/**
 * Politician photo, or an honest placeholder.
 *
 * `person.photo` is null for most of the roster, and that is still the expected
 * state: a portrait may only ship with a recorded licence in ../data/photos.js,
 * and adding a stock or press-scraped face next to a real name would be
 * misinformation no caption can undo.
 *
 * The certification tick is an overlay rather than a line of text below the
 * image. On a card the line cost as much vertical space as the name, and thirty
 * repetitions of the words "INEC certified" told a scanning reader nothing that a
 * tick did not. It is paired with `title` and an sr-only label, because a tick that
 * only exists as a shape is not an accessible signal.
 *
 * Attribution is rendered by <PhotoCredit> rather than baked in here, because the
 * credit is unreadable at avatar size and only becomes legible at profile size.
 */
export function PoliticianPhoto({ person, className, showCertifiedTick = false }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-control border border-line bg-surface",
        className,
      )}
    >
      {person.photo ? (
        <img
          src={person.photo}
          alt={person.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br px-2 text-center",
            tintFor(person.name),
          )}
        >
          <span className="text-sm font-semibold tracking-wide text-fg-muted">
            {initials(person.name)}
          </span>
          {/* Hidden at avatar size: the words do not fit and the icon carries it. */}
          <span className="hidden text-2xs leading-tight text-fg-faint sm:block">
            No photo yet
          </span>
        </div>
      )}

      {showCertifiedTick ? (
        <span
          className="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-control border-l border-t border-line bg-surface/95 px-1.5 py-0.5 backdrop-blur-sm"
          title="Certified by INEC to contest in the 2027 presidential election"
        >
          <BadgeCheck size={12} className="text-verified" aria-hidden="true" />
          <span className="cs-sr-only">INEC certified candidate</span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * Photo attribution, shown under a profile photo.
 *
 * CC BY and CC BY-SA both require credit, and "somewhere on the site" is not
 * good enough for a face attached to a named individual, so the author,
 * licence and source are printed next to the image they describe and repeated
 * in full on /credits.
 */
export function PhotoCredit({ person, className }) {
  const credit = person.photoCredit;
  if (!credit) return null;

  return (
    <p className={cn("text-2xs leading-relaxed text-fg-faint", className)}>
      Photo:{" "}
      <a
        href={credit.source}
        target="_blank"
        rel="noreferrer noopener"
        className="underline underline-offset-2 hover:text-fg-muted"
      >
        {credit.author}
      </a>{" "}
      /{" "}
      <a
        href={credit.licenseUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="underline underline-offset-2 hover:text-fg-muted"
      >
        {credit.license}
      </a>
    </p>
  );
}

export default PoliticianPhoto;
