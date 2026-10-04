import { useState } from "react";
import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { CONFIG } from "../../config/config";
import { Container, PageHeader, Section } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { ReportForm } from "../../components/reports/ReportForm";
import { TRUST_POINTS } from "../../data/content";
import { SampleBanner } from "../../components/shared/SampleBanner";
import { relativeTime } from "../../utils/formatters";

/**
 * Report page.
 *
 * The confirmation replaces the form in place rather than navigating away: a
 * reporter who has just sent something from a polling unit should not have to
 * find their way back, and the "what happened next" copy is the part they
 * actually need to read.
 *
 * Incidents only. There is no politician context here any more: a sourced
 * profile update goes through ProfileSuggestionForm, which asks for a source
 * and says up front that a submission is not published on request.
 */
export function Report() {
  const [receipt, setReceipt] = useState(null);

  return (
    <>
      <Container size="prose" className="py-12 sm:py-16">
        <PageHeader
          eyebrow="Report"
          title="Report what you saw"
          description="No name, no account, no trail. A moderator reads every report against independent reporting before anything reaches the public map."
        />

        {receipt ? (
          <Confirmation receipt={receipt} onAnother={() => setReceipt(null)} />
        ) : (
          <div className="mt-8">
            <ReportForm onSubmitted={setReceipt} />
          </div>
        )}
      </Container>

      <Section bordered>
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="flex gap-3">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-verified" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-fg">{point.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

/**
 * Post-submit state.
 *
 * The copy here is the part that must not lie. With no report server connected,
 * nothing was sent and no moderator will read it, so the confirmation leads with
 * where the report actually is: this browser. Telling someone standing at a
 * polling unit that a moderator is reading their report, when it is sitting in
 * their own localStorage, would be the single worst failure this form could have.
 */
function Confirmation({ receipt, onAnother }) {
  return (
    <div className="cs-enter mt-8 space-y-5">
      <SampleBanner>
        No report server is connected to this deployment. Your report was saved in this browser
        only. Nothing was transmitted, and no moderator has received it.
      </SampleBanner>

      <div className="cs-card border-verified/25 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-verified" aria-hidden="true" />
          <div>
            <p className="text-heading text-fg">Report saved on this device</p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-secondary">
              Your report is stored in this browser and has not been sent anywhere. Once a report
              server is connected, submissions are written to the moderation queue, a moderator
              reads each one against independent reporting, and only corroborated reports reach
              the public map. That copy, your description and the state and LGA, never anything
              about you.
            </p>
          </div>
        </div>
      </div>

      <div className="cs-card p-4">
        <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
          Your reference
        </p>
        <p className="mt-1.5 font-mono text-sm text-fg">
          {receipt?._id || receipt?.id || "submitted"}
        </p>
        <p className="cs-hint mt-1.5">
          Saved {relativeTime(receipt?.timestamp || Date.now())} to this browser only. Clearing
          site data deletes it, so copy this reference somewhere safe if you want to keep it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="cs-card p-4">
          <p className="text-sm font-medium text-fg">What happens when this is live</p>
          <ol className="mt-2 space-y-1.5 text-sm text-fg-muted">
            <li>1. The report is written to the moderation queue, not stored in your browser.</li>
            <li>2. A moderator checks it against newsroom reporting.</li>
            <li>3. If corroborated, it is approved and mapped. If not, it stays private.</li>
          </ol>
        </div>
        <div className="cs-card p-4">
          <p className="text-sm font-medium text-fg">In danger right now?</p>
          <p className="mt-2 text-sm text-fg-muted">
            Do not file from a shared or monitored device. Move somewhere safe first.
          </p>
          <Button
            href={CONFIG.WHATSAPP.chatLink}
            variant="secondary"
            size="sm"
            className="mt-3"
            fullWidth
          >
            <MessageCircle size={13} aria-hidden="true" />
            Message on WhatsApp
          </Button>
        </div>
      </div>

      <Button variant="ghost" size="md" onClick={onAnother}>
        File another report
      </Button>
    </div>
  );
}

export default Report;
