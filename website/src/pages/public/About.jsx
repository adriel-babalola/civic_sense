import { Github, Mail, MessageCircle, PlayCircle, ShieldCheck } from "lucide-react";
import { CONFIG } from "../../config/config";
import { Container, PageHeader, Section } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { STEPS, TRUST_POINTS } from "../../data/content";
import { PhoneMock } from "../../components/sections/Hero";

/**
 * About.
 *
 * No team photographs, no names, no founder story. That is a deliberate
 * editorial choice for a platform that asks people to send evidence about
 * powerful people: the people behind it stay anonymous for the same reason
 * reporters do. It also means this page has to earn trust with method rather
 * than with a personality.
 */
export function About() {
  return (
    <>
      <Container size="prose" className="py-12 sm:py-16">
        <PageHeader
          eyebrow="About"
          title="CivicSense"
          description="Truth awareness for youth and the public, so decisions are informed."
        />

        <div className="cs-prose mt-8 space-y-6">
          {/* This was the hero's closing line when the hero carried the whole
              pitch. It outgrew a photograph, so it lives here, where there is
              room to set it as a statement rather than a slogan. */}
          <p className="text-[1.375rem] font-semibold leading-snug tracking-[-0.02em] text-fg sm:text-[1.5rem]">
            Reclaim your voice. Restore accountability. Build the Nigeria you
            deserve.
          </p>

          <p className="text-[1.0625rem] leading-relaxed text-fg">
            CivicSense is a truth awareness and civic sensitisation platform. Its work is youth and
            mass sensitisation: helping young Nigerians and the wider public check what reaches
            them, and reach decisions they can stand behind.
          </p>
          <p>
            The framing is deliberate. A fact-checker answers one question about one claim. What
            actually decides an election in Nigeria is a habit: whether people pause before they
            forward, and whether they learn to want the source rather than the summary. So
            fact-checking is the tool here, and truth awareness is the goal.
          </p>
          <p>
            The barrier to that habit is time. Checking is slow, the tools are in English, and the
            moment you need to check something is usually the moment you are on WhatsApp with two
            hundred other people forwarding it. So the first version of this was a bot, not a
            website: forward anything, get a verdict back in under thirty seconds.
          </p>
          <p>
            The website exists for the other half. Claims get checked in private, but a
            corroboration that a thousand people saw forwarded should be standing on the public
            record too. That is the incident map, and it is the part only a website can do.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Button to="/fact-check" variant="primary" size="lg" fullWidth>
            Check a claim
          </Button>
          <Button to="/report" variant="secondary" size="lg" fullWidth>
            Report misconduct
          </Button>
          <Button href={CONFIG.WHATSAPP.joinLink} variant="secondary" size="lg" fullWidth>
            <MessageCircle size={15} aria-hidden="true" />
            Use the bot
          </Button>
        </div>
      </Container>

      <Section bordered>
        <Container>
          <div className="max-w-2xl">
            <p className="cs-eyebrow mb-2.5">What it does</p>
            <h2 className="text-title text-fg">Three steps, no account, any phone</h2>
          </div>

          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="cs-card p-5">
                <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-brand-bright">
                  Step {index + 1}
                </span>
                <h3 className="mt-2 text-heading text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              {/* The WhatsApp thread lives here now that the hero is a photograph.
                  It is the same proof the hero used to carry: this is the actual
                  output format, not a description of it. */}
              <PhoneMock />

              <p className="cs-eyebrow mb-2.5 mt-10">Why we are anonymous</p>
              <h2 className="text-title text-fg">The people behind this are not named</h2>
              <div className="cs-prose mt-4 space-y-4">
                <p>
                  No team page, no founder biography, no photographs. If you build a tool that asks
                  people to report misconduct by politicians, the people who run it are an obvious
                  target, and a name and a face make that target easier to find.
                </p>
                <p>
                  So contact goes to a single address, and it reaches whoever is on call. That is
                  the whole arrangement. It also means there is nobody to pressure if a verdict is
                  unpopular, which is the property we actually want.
                </p>
                <p>
                  This is not a black box, though. Nothing about how a verdict is produced is
                  secret. The sources are listed, the method is described, the code is open, and
                  anyone can run the same pipeline.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {TRUST_POINTS.map((point) => (
                <div key={point.title} className="cs-card flex gap-3 p-4">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-verified" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-fg">{point.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fg-muted">{point.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container size="prose">
          <p className="cs-eyebrow mb-2.5">Get in touch</p>
          <h2 className="text-title text-fg">One inbox</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-secondary">
            Corrections, takedown requests, questions about a verdict, or a report you need
            deleted. All of it goes to the same address, and a person reads it.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button href={`mailto:${CONFIG.CONTACT_EMAIL}`} variant="primary" size="md">
              <Mail size={14} aria-hidden="true" />
              {CONFIG.CONTACT_EMAIL}
            </Button>
            <Button href={CONFIG.GITHUB_URL} variant="secondary" size="md">
              <Github size={14} aria-hidden="true" />
              Read the code
            </Button>
            {CONFIG.DEMO_VIDEO_URL ? (
              <Button href={CONFIG.DEMO_VIDEO_URL} variant="secondary" size="md">
                <PlayCircle size={14} aria-hidden="true" />
                Watch the demo
              </Button>
            ) : null}
          </div>

          <p className="cs-hint mt-6">
            A verdict is a research aid, not a legal judgement. If you intend to act on one, in
            court, in a newspaper or in a campaign, read the sources first.
          </p>
        </Container>
      </Section>
    </>
  );
}

export default About;
