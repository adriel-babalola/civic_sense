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

  return (
    <Container className="pb-14 pt-6 sm:pt-8">
      <PageHeader
        eyebrow="Attribution"
        title="Photo and data credits"
        description="Every image and every dataset on this site, who made it, and the licence or document it came from."
      />

      <div className="mt-6">
        <Alert tone="info" title="Why there are only a few photographs">
          A stock image or a photo scraped from a news site is not an acceptable
          substitute for a missing portrait. Putting the wrong face next to a real
          name is misinformation, and reusing a copyrighted photo without
          permission is a takedown. Everyone without a cleared licence shows their
          initials instead.
        </Alert>
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
                  <a
                    href={photo.licenseUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-2 hover:text-fg-muted"
                  >
                    {photo.license}
                  </a>
                  {" · "}
                  <a
                    href={photo.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-2 hover:text-fg-muted"
                  >
                    source
                  </a>
                </p>
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
