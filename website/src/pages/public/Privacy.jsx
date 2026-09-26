import { Container, PageHeader } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";

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
    body: "Text you choose to type into the evidence box: a description of what you saw, or a link to a video or post. The report form does not accept image uploads, because the server stores this field as text and we would rather offer a box that works than an upload that silently fails.",
  },
  {
    label: "Technical, unavoidable",
    body: "The server's access log records the IP address that made the request, as every web server does. It is not stored alongside your report, and it is not used to identify you.",
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
            To stop one browser flooding the moderation queue, the report form allows a limited
            number of submissions per hour, counted locally in your own browser. Clearing your
            browser data resets that counter. It is a courtesy limit, not an identity, which is
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
        </section>

        <section>
          <h2 className="text-heading text-fg">Deletion</h2>
          <p className="mt-3">
            Because we hold no identifier, we cannot look up a report to delete it by asking who
            sent it. If you filed something and need it removed, describe the report: state, LGA
            and approximate date are enough to locate it, and we will delete it.
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
              href="mailto:civic-sense@proton.me"
              className="font-medium text-brand-bright underline underline-offset-2 hover:no-underline"
            >
              civic-sense@proton.me
            </a>
            .
          </p>
          <Button
            href="mailto:civic-sense@proton.me"
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
