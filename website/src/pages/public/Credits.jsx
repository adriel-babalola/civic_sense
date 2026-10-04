import { Container, PageHeader, SectionHeading } from "../../components/shared/Layout";
import { Alert } from "../../components/shared/Field";
import { getAllPhotos } from "../../data/photos";
import { PoliticianPhoto } from "../../components/politicians/PoliticianPhoto";
import { BOUNDARY_ATTRIBUTION, BOUNDARY_SOURCE_URL } from "../../data/nigeria-boundaries";
import { INEC_SOURCE } from "../../data/elections2027";

/**
 * Photo and data credits.
 *
 * CC BY and CC BY-SA require attribution, and "somewhere on the site" is not a
 * reasonable place to leave it when the image is a recognisable face attached to
 * a named individual. Each photo is therefore credited twice: in a caption
 * directly beneath it on the profile, and in full here.
 *
 * The map and candidate-data credits live here too, because both are licence
 * and provenance obligations rather than policy disclosures, and a reader who
 * wants to know where a fact came from should not have to read a privacy page to
 * find out.
 */
export function Credits() {
  const photos = getAllPhotos();
  const unverifiedCount = photos.filter((photo) => photo.unverified).length;

  return (
    <Container className="pb-14 pt-6 sm:pt-8">
      <PageHeader
        eyebrow="Attribution"
        title="Photo and data credits"
        description="Every image and every dataset on this site, who made it, and the licence or document it came from."
      />

      <div className="mt-6 space-y-3">
        <Alert tone="info" title="Where these photographs came from">
          A stock image or a photo scraped from a news site is not an acceptable
          substitute for a missing portrait. Putting the wrong face next to a real
          name is misinformation, and reusing a copyrighted photo without
          permission is a takedown.
        </Alert>

        {/*
          Rendered above the list rather than buried under it, because the list
          now contains two different kinds of entry and a reader has to be able to
          tell which is which. The verified rows carry a Creative Commons licence
          and a named author. The others carry the real source URL and the words
          "Licence not verified", which is the true state of a photograph found
          by image search. Nothing here claims a licence that was never confirmed,
          and nothing hides which images those are.
        */}
        {unverifiedCount > 0 ? (
          <Alert
            tone="warning"
            title={`${unverifiedCount} of these photographs have an unverified licence`}
          >
            They were assembled by image search and came from news outlets, social
            media and campaign pages. Each row below names the page it came from.
            They are published here pending permission or replacement, and the
            entries most likely to need clearing are those whose source is a
            publisher&apos;s own site.
          </Alert>
        ) : null}
      </div>

      <section className="mt-8">
        <SectionHeading title="Photographs" />
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {photos.map((photo) => (
            <li key={photo.id} className="cs-card flex gap-3 p-3">
              <PoliticianPhoto
                person={{ name: photo.title, photo: photo.url }}
                className="h-16 w-16 shrink-0 rounded-full"
              />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium text-fg">{photo.title}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  by{" "}
                  <a
                    href={photo.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-2 hover:text-fg"
                  >
                    {photo.author}
                  </a>
                  {photo.taken ? `, ${photo.taken}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-fg-faint">
                  {/*
                    A licence with no URL renders as plain text rather than as a
                    dead link. "Licence not verified" is a statement about a fact,
                    not a reference to look up, and wrapping it in an <a> to
                    nothing would read as a broken promise.
                  */}
                  {photo.licenseUrl ? (
                    <a
                      href={photo.licenseUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline underline-offset-2 hover:text-fg-muted"
                    >
                      {photo.license}
                    </a>
                  ) : (
                    <span className={photo.unverified ? "text-unverified" : undefined}>
                      {photo.license}
                    </span>
                  )}
                  {" · "}
                  <a
                    href={photo.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-2 hover:text-fg-muted"
                  >
                    {photo.sourceLabel || "source"}
                  </a>
                </p>
                {/* CC BY asks you to say whether the image was altered. Silently
                    shipping a resize is the kind of omission that gets a
                    volunteer-run project into trouble. */}
                {photo.modifications ? (
                  <p className="mt-0.5 text-2xs text-fg-faint">
                    modified: {photo.modifications}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <SectionHeading title="Candidate data" />
        <div className="cs-card mt-4 p-4 text-sm leading-relaxed text-fg-secondary">
          <p>
            Every candidacy, party, running mate, age and gender published on this
            site is transcribed from the{" "}
            <a
              href={INEC_SOURCE.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-fg underline underline-offset-2 hover:text-brand-bright"
            >
              {INEC_SOURCE.title}
            </a>
            , published by the {INEC_SOURCE.publisher} on {INEC_SOURCE.published} and
            signed by {INEC_SOURCE.signedBy}.
          </p>
          <p className="mt-3">
            Names appear in their conventional public form, which differs from the
            order INEC printed them in on the form. Being on that list means INEC
            cleared a person to contest. It is not a judgement about them, and it
            is not a public record.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading title="Map data" />
        <div className="cs-card mt-4 p-4 text-sm leading-relaxed text-fg-secondary">
          <p>{BOUNDARY_ATTRIBUTION}.</p>
          <p className="mt-3">
            Upstream dataset:{" "}
            <a
              href={BOUNDARY_SOURCE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-fg underline underline-offset-2 hover:text-brand-bright"
            >
              geoBoundaries gbOpen NGA ADM1
            </a>
            . Boundaries are simplified and generalised, so they are not precise
            enough to settle a dispute over an administrative boundary.
          </p>
        </div>
      </section>
    </Container>
  );
}

export default Credits;
