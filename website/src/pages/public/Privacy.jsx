import { Link } from "react-router-dom";
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
 *
 * Two rules govern the claims below, and they are not stylistic:
 *
 * 1. Nothing here says data is anonymised, hashed, redacted or stripped unless
 *    the code demonstrably does it. The report form asks for no name, which is
 *    true because it has no field for one. The fact-check records do carry a
 *    channel sender identifier in a field named `hashedFrom`, and that field is
 *    not hashed today, so this page describes it as the raw identifier it is.
 *    Overstating that is the single fastest way to lose a privacy review, and
 *    understating it is the kind of thing that ends up in a finding.
 *
 * 2. Service providers are named. OpenRouter, Tavily, MongoDB Atlas and Twilio
 *    are the four that receive user data, and a policy that says "our partners"
 *    tells a reviewer nothing they can check.
 *
 * The effective date is a constant rather than prose so the update policy has
 * something true to point at.
 */
const EFFECTIVE_DATE = "8 October 2026";

/** Analytics and advertising. We run neither, so this list can be short. */
const NOT_COLLECTED = [
  "Advertising pixels, marketing tags, or session recording.",
  "Your precise location. The report form asks for a state and a local government area because that is the granularity an incident report needs, nothing more.",
  "Files from the report form. It has no upload control, so there is nothing for you to attach and nothing for us to receive.",
  "An account or a profile. There is no sign-up, so there is no identity for us to build a record of you from.",
];

/**
 * Two record types, because they are genuinely different and a single merged
 * paragraph is what produced the old page's overclaim.
 *
 * `Report` (server/services/db.js) holds the incident form fields and no
 * identifier of any kind.
 *
 * `FactCheck` (same file) holds the claim, verdict, channel, timestamp, and
 * `hashedFrom`. The name promises a hash. The code assigns the sender value
 * straight into it, so it currently holds a raw WhatsApp number or Telegram
 * chat ID.
 */
const REPORT_FIELDS =
  "type, description, state, local government area, any evidence text you typed, a moderation status, and a timestamp";

const FACTCHECK_FIELDS =
  "the claim text, the verdict, the channel it arrived on, a timestamp, and a sender identifier for the channel";

const PROVIDERS = [
  {
    label: "OpenRouter",
    body: "Runs the language model that produces the verdict and summarises the sources we retrieve. It receives the claim text and any image you submitted with it.",
  },
  {
    label: "Tavily",
    body: "Performs the live web search that supplies reference material. It receives the search query derived from the claim.",
  },
  {
    label: "MongoDB Atlas",
    body: "Stores fact-check results and incident reports in a hosted database. It holds the record fields described above.",
  },
  {
    label: "Twilio",
    body: "Delivers the WhatsApp conversation and carries message delivery metadata under Twilio's own privacy policy.",
  },
  {
    label: "A global content delivery network",
    body: "Serves this site's static files. The host records the IP address that made each request, as every web server does.",
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
            We store the text you send us and, when you use WhatsApp or Telegram, the identifier
            your messaging app gives us for you. We do not ask for your name, we run no analytics
            and no advertising trackers, and we are not building a profile of you across visits.
          </p>
        </section>

        {/* Sits directly under the summary because it changes what the rest of the
            page means. The sections below describe the platform, which runs as a
            WhatsApp and Telegram bot alongside a backend. This website build is
            static: a report submitted here goes to the visitor's own browser
            storage and is not transmitted, so nobody receives it and nothing is
            added to a moderation queue. */}
        <Alert tone="info" title="What this website does and does not send">
          CivicSense runs as a WhatsApp and Telegram bot backed by a database. That is what the
          sections below describe. The website you are reading is a static build with no backend
          attached, so an incident report submitted on it is written to your own browser's local
          storage and is not transmitted to us. Nothing you type on this site reaches the bot, and
          the incidents shown on the map are a small bundled demonstration set rather than live
          reports.
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
          <h2 className="text-heading text-fg">What a fact-check record contains</h2>
          <p className="mt-3">
            When you send a claim to us on WhatsApp or Telegram, we save a record holding{" "}
            {FACTCHECK_FIELDS}.
          </p>
          <p className="mt-3">
            On the sender identifier, be clear with yourself about what the code does. It is stored
            in a database field named <code>hashedFrom</code>. Despite that name it is not hashed at
            present, so for a WhatsApp submission it holds your phone number in international
            format, and for a Telegram submission it holds your chat ID. We are describing it as
            what it is rather than as the hash its field name implies.
          </p>
          <p className="mt-3">
            The claim text itself is stored in full, because it is the subject of the fact-check.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">What an incident report contains</h2>
          <p className="mt-3">
            A report holds the {REPORT_FIELDS}. There is no sender identifier field on a report at
            all, and the form has no control for a name, an email address or a phone number, so
            those are never collected here.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Images</h2>
          <p className="mt-3">
            If you send an image with a claim, it is used for analysis to work out what the claim
            is, and it is not intended for permanent storage. We are not describing any
            redaction or metadata removal beyond that, because we would rather state the
            behaviour we have than promise a cleaner one we have not built.
          </p>
          <p className="mt-3">
            The report form on this website takes text only. It has no upload control, so there is
            no image for it to receive.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">How a verdict is produced</h2>
          <p className="mt-3">
            Two automated services handle a fact-check request. OpenRouter runs the language model
            that reads the claim and produces the verdict. Tavily runs the live web search that
            supplies the reference material behind it. Both receive the claim text, and the model
            also receives an image if you sent one.
          </p>
          <p className="mt-3">
            A verdict is a research aid produced from retrieved sources. It is not a legal
            judgement and it is not a substitute for reading the reporting. Every verdict lists its
            sources so you can disagree with it on the evidence.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Service providers</h2>
          <dl className="mt-3 space-y-4">
            {PROVIDERS.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-semibold text-fg">{item.label}</dt>
                <dd className="mt-1 text-fg-secondary">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-heading text-fg">Rate limiting</h2>
          <p className="mt-3">
            To stop one client making an unbounded number of submissions, the report form allows a
            limited number per hour, counted in your own browser. Clearing your browser data resets
            that counter. It is a courtesy limit rather than an identity, which is the trade-off we
            have chosen deliberately, because the alternative is asking you to identify yourself.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Published reports</h2>
          <p className="mt-3">
            A report appears on the public incident map only after a moderator has corroborated it
            against independent reporting. Published reports carry the description and the state
            and LGA. They do not carry a sender identifier, because the report record does not hold
            one.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Keeping and deleting your data</h2>
          <p className="mt-3">
            Fact-check records and incident reports are kept while the service is running. You can
            ask for either to be deleted at any time, and we will do it once we have matched the
            request to the record. The procedure is set out on the{" "}
            <Link
              to="/data-deletion"
              className="font-medium text-brand-bright underline underline-offset-2 hover:no-underline"
            >
              data deletion page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Effective date and updates</h2>
          <p className="mt-3">
            Effective {EFFECTIVE_DATE}. If we change what we collect or what we do with it, we
            will update this page and change the date above to say when the change took effect. The
            version you are reading is the one in force on the date shown.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Privacy contact</h2>
          <p className="mt-3">
            Questions about this policy, and requests to see or delete your data, go to one
            address, forwarded to a small team:{" "}
            <a
              href={`mailto:${CONFIG.PRIVACY_EMAIL}`}
              className="font-medium text-brand-bright underline underline-offset-2 hover:no-underline"
            >
              {CONFIG.PRIVACY_EMAIL}
            </a>
            .
          </p>
          <Button
            href={`mailto:${CONFIG.PRIVACY_EMAIL}`}
            variant="secondary"
            size="md"
            className="mt-5"
          >
            Contact us about your data
          </Button>
        </section>
      </div>
    </Container>
  );
}

export default Privacy;
