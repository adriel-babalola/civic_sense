import { Container, PageHeader } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Alert } from "../../components/shared/Field";
import { CONFIG } from "../../config/config";

/**
 * Privacy policy.
 *
 * Written to be read by someone on a phone over data, not to be defensible in
 * a tribunal. Short sentences, concrete lists, and no clause that hides a
 * practice the code does not already follow.
 */
const NOT_COLLECTED = [
  "Your name, email address or phone number. The report form has no field for any of them.",
  "Analytics, advertising pixels, session recording or any third-party tracking script.",
  "Your precise location. The report form asks for a state and a local government area because that is the granularity an incident report needs, nothing more.",
  "Files from the report form. It has no upload control, so there is nothing for you to attach and nothing for us to receive.",
  "A profile. There is no account system, so there is nothing to build a profile from.",
];

const COLLECTED = [
  {
    label: "What happened",
    body: "The incident type, your description, and the state and local government area you selected.",
  },
  {
    label: "Optional evidence",
    body: "Text you choose to type into the evidence box: a description of what you saw, or a link to a video or post. The report form does not accept image uploads, because the field is stored as text and we would rather offer a box that works than an upload that silently fails.",
  },
  {
    label: "Technical, unavoidable",
    body: "The host serving this page records the IP address that made the request, as every web server does. Your report is not sent with it. In this deployment the report never leaves your browser at all. See the notice below.",
  },
];

export function Privacy() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Privacy"
        title="What we collect, and mostly what we don't"
        description="A short policy, because a long one is a way of hiding the same thing."
      />

      <div className="cs-prose mt-10 space-y-10">
        <section>
          <h2 className="text-heading text-fg">The short version</h2>
          <p className="mt-3">
            The report form collects only what an incident report needs. Everything else is left
            out on purpose. We run no analytics and no advertising trackers, and we are not
            building a profile of you across visits.
          </p>
        </section>

        {/* Sits directly under the summary because it changes what the rest of the
            page means. The sections below describe how reports are handled once a
            report server is connected; right now none of that is true, and a
            visitor reading "we will delete it" needs to know we currently cannot. */}
        <Alert tone="info" title="This deployment has no report server">
          This copy describes the intended behaviour of CivicSense. The version you are using has
          no report server connected. A report you submit is written to your own browser's local
          storage and is not transmitted to us, so nobody on our side receives it, nothing is
          added to a moderation queue, and nothing reaches the public incident map. You can
          inspect or remove what you have saved at any time from your browser settings.
        </Alert>

        <section>
          <h2 className="text-heading text-fg">What we do not collect</h2>
          <ul className="mt-3 space-y-2.5">
            {NOT_COLLECTED.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-faint" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-heading text-fg">What we do collect</h2>
          <dl className="mt-3 space-y-4">
            {COLLECTED.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-semibold text-fg">{item.label}</dt>
                <dd className="mt-1 text-fg-secondary">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-heading text-fg">Images, and where they do and do not go</h2>
          <p className="mt-3">
            A photo taken on a phone usually records where and when it was taken, and often which
            device. That is exactly the information someone reporting from a polling unit does not
            want attached to what they saw.
          </p>
          <p className="mt-3">
            So this website does not offer an image upload on the report form. What it collects
            there is text, and text carries no location data. If you have a screenshot, forward it
            to the WhatsApp number instead: that is the one route where an image is actually read
            and checked, and it is handled by the bot rather than by this site.
          </p>
          <p className="mt-3">
            The fact-check form does accept an image, and there the same rule applies. Before it
            leaves your browser we strip the location and device metadata and re-encode the pixel
            data. The form tells you which of the two methods ran, because telling you it was
            removed when it might not have been would be worse than saying nothing.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Rate limiting</h2>
          <p className="mt-3">
            To stop one browser saving an unbounded pile of reports, the report form allows a
            limited number of submissions per hour, counted locally in your own browser. Clearing
            your browser data resets that counter. It is a courtesy limit, not an identity, which is
            the trade-off we have chosen deliberately, because the alternative is asking you to
            identify yourself.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Published reports</h2>
          <p className="mt-3">
            A report only appears on the public incident map after a moderator has corroborated it
            against independent reporting. Published reports contain the description and the state
            and LGA, never anything about the person who filed it, because we never had it.
          </p>
          <p className="mt-3">
            In this deployment nothing is published, because nothing is received. The incidents
            shown on the map are a small bundled demonstration set, not reports from the public.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Deletion</h2>
          <p className="mt-3">
            Because we hold no identifier, we cannot look up a report to delete it by asking who
            sent it. Once a report server is connected, describing a report by state, LGA and
            approximate date is enough to locate it, and we will delete it.
          </p>
          <p className="mt-3">
            Until then, deletion is something you do yourself, which is arguably better: clearing
            this site's data in your browser removes everything it has stored, with nothing to
            request from us and nothing left behind.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Verdicts, not legal advice</h2>
          <p className="mt-3">
            A verdict is a research aid produced from retrieved sources. It is not a legal
            judgement and it is not a substitute for reading the reporting. Every verdict lists
            its sources so you can disagree with it on the evidence.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Contact</h2>
          <p className="mt-3">
            One address, forwarded to a small team:{" "}
            <a
              href={`mailto:${CONFIG.CONTACT_EMAIL}`}
              className="font-medium text-brand-bright underline underline-offset-2 hover:no-underline"
            >
              {CONFIG.CONTACT_EMAIL}
            </a>
            .
          </p>
          <Button
            href={`mailto:${CONFIG.CONTACT_EMAIL}`}
            variant="secondary"
            size="md"
            className="mt-5"
          >
            Send us a question
          </Button>
        </section>
      </div>
    </Container>
  );
}

export default Privacy;
