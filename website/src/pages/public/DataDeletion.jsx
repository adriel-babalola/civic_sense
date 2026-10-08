import { Link } from "react-router-dom";
import { Container, PageHeader } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { CONFIG } from "../../config/config";

/**
 * Data deletion instructions.
 *
 * A standalone page rather than a section of the privacy policy, because Meta's
 * Data Deletion Instructions reviewer wants a URL a user can be pointed at and
 * act on without finding the right paragraph first. It is linked from the
 * footer and from /privacy, so it is reachable from every page.
 *
 * The awkward part of writing this honestly is that a deletion request cannot
 * be matched by an account, because there is no account. So the page has to
 * tell someone how to identify a record without one. Describing the claim text
 * and the approximate date is the workable answer, and saying so is better than
 * implying a lookup that does not exist.
 */

/**
 * Prefilled subject line. Encoding is handled by the browser's mail client from
 * the href, so the value here stays readable in the source.
 */
const SUBJECT = "Data deletion request";

const STEPS = [
  {
    title: "Email the privacy address",
    body: "Send a message to the address below. The button opens your mail app with the subject already filled in. Any mail client works; the address is a plain inbox, so nothing needs configuring.",
  },
  {
    title: "Tell us which record to remove",
    body: "There is no account to log in to, so we cannot look a record up by your name. Describe the claim or report in your own words and give the approximate date you sent it. The wording you used is usually enough to find it, because the claim text is stored in full.",
  },
  {
    title: "We confirm and delete",
    body: "A person reads the request. If more than one record could match, we will ask which one you mean rather than delete the wrong thing. Once matched, the record is removed from the database.",
  },
];

const ALSO_DELETED = [
  "Fact-check records, including the claim text, the verdict, the channel and the stored sender identifier.",
  "Incident reports, including the description, the state and LGA, and any evidence text.",
  "Images submitted with a claim. These are held for analysis and are not intended for permanent storage, so there is normally nothing retained to remove.",
];

const NOT_IN_THIS_REQUEST = [
  "Anything this website stored in your own browser. Reports you submitted on the site build are saved to your browser's local storage, and that copy is yours to remove directly. No request is needed, and none would reach it.",
  "The rate limit counter in your browser, which resets when you clear site data.",
  "A correction to a verdict. That is not a deletion, and it is better handled by telling us what the verdict got wrong so the record can be fixed.",
];

export function DataDeletion() {
  const mailto = `mailto:${CONFIG.PRIVACY_EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Data deletion"
        title="Ask us to delete your data"
        description="You can request deletion of any fact-check or report record at any time. Here is how to do it, and what happens next."
      />

      <div className="cs-prose mt-10 space-y-10">
        <section>
          <h2 className="text-heading text-fg">How to request deletion</h2>
          <ol className="mt-4 space-y-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-2xs font-semibold text-brand-bright">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">{step.title}</p>
                  <p className="mt-1.5 text-fg-secondary">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Button href={mailto} variant="primary" size="md" className="mt-6">
            Email a deletion request
          </Button>
        </section>

        <section>
          <h2 className="text-heading text-fg">What a request covers</h2>
          <ul className="mt-3 space-y-2.5">
            {ALSO_DELETED.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-faint" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Deletion removes the record rather than anonymising it, because a verdict with the
            claim text still removed does not identify anyone either. If you want a record kept but
            with the sender identifier cleared, ask for that instead and it can be done.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">What a request does not cover</h2>
          <ul className="mt-3 space-y-2.5">
            {NOT_IN_THIS_REQUEST.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-faint" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-heading text-fg">Deleting the copy in your browser</h2>
          <p className="mt-3">
            Because this website has no backend connected, anything you submitted through it sits in
            your own browser rather than on a server we control. That copy is removed by clearing
            this site's data in your browser settings, which is immediate and leaves nothing behind.
          </p>
          <p className="mt-3">
            Worth doing if you reported from a shared phone, since the local copy is only as private
            as the device it is on.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Timing and what to expect</h2>
          <p className="mt-3">
            Requests go to a small team and are actioned as soon as they are read. We will not put
            a fixed deadline on this page, because a number nobody here has committed to would be a
            promise we could not keep, and a broken promise about deletion is worse than an honest
            absence of one.
          </p>
          <p className="mt-3">
            If a request is unclear we will write back and ask a question rather than guess. If a
            record cannot be found we will say so instead of reporting it deleted.
          </p>
        </section>

        <section>
          <h2 className="text-heading text-fg">Privacy contact</h2>
          <p className="mt-3">
            Deletion requests, and any question about what we hold about you, go to{" "}
            <a
              href={`mailto:${CONFIG.PRIVACY_EMAIL}`}
              className="font-medium text-brand-bright underline underline-offset-2 hover:no-underline"
            >
              {CONFIG.PRIVACY_EMAIL}
            </a>
            . A person reads it.
          </p>
          <p className="mt-3">
            What we collect and why is set out in the{" "}
            <Link
              to="/privacy"
              className="font-medium text-brand-bright underline underline-offset-2 hover:no-underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}

export default DataDeletion;
