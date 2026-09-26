import { ImageOff } from "lucide-react";
import { cn } from "../../utils/cn";
import { initials } from "../../utils/formatters";

/**
 * Politician photo, or an honest placeholder.
 *
 * `person.photo` is null for most of the roster, and that is still the expected
 * state: a portrait may only ship with a recorded licence in ../data/photos.js,
 * and adding a stock or press-scraped face next to a real name would be
 * misinformation no caption can undo.
 *
 * Attribution is rendered by <PhotoCredit> below rather than baked in here,
 * because the credit is unreadable at the 56px avatar size used on cards and
 * only becomes legible at profile size.
 */
export function PoliticianPhoto({ person, className }) {
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
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
          <ImageOff size={20} className="text-fg-faint" aria-hidden="true" />
          <p className="text-sm font-semibold text-fg-muted">{initials(person.name)}</p>
          <p className="text-2xs leading-tight text-fg-faint">Photo coming soon</p>
        </div>
      )}
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
