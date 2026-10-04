import { Link } from "react-router-dom";
import { Archive, ArrowRight, BarChart3, MessageCircle, Search, Zap } from "lucide-react";
import { FEATURES, SAMPLE_VERDICTS, TRUST_POINTS } from "../../data/content";
import { CONFIG, FEATURES as FEATURE_FLAGS } from "../../config/config";
import { Button } from "../shared/Button";
import { Container, Section, SectionHeading } from "../shared/Layout";
import { VerdictExplainer } from "./VerdictCard";

const ICONS = {
  factcheck: MessageCircle,
  profiles: Search,
  reports: BarChart3,
};

const ACCENTS = {
  verified: "text-verified border-verified/20 bg-verified/5",
  brand: "text-brand-bright border-brand-bright/20 bg-brand-bright/5",
  misleading: "text-misleading border-misleading/20 bg-misleading/5",
};

/** The three core products. */
export function Features() {
  // Hide a card whose surface is switched off, so the grid never advertises a
  // route that is not there. `flag` is the config key; `id` is a content key and
  // the two are not the same string.
  const features = FEATURES.filter((feature) => FEATURE_FLAGS[feature.flag] !== false);

  return (
    <Section bordered>
      <Container>
        <SectionHeading
          eyebrow="What you can do"
          title="Three tools for making up your own mind"
          description="Check a claim before you forward it, see who is deciding and what has been documented about them, and report what you see at the polling unit."
        />

        <div className="cs-stagger mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = ICONS[feature.id] || MessageCircle;
            return (
              <Card
                key={feature.id}
                to={feature.href}
                title={feature.title}
                body={feature.body}
                cta={feature.cta}
                Icon={Icon}
                accent={ACCENTS[feature.accent] || ACCENTS.brand}
              />
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function Card({ to, title, body, cta, Icon, accent }) {
  return (
    <Link
      to={to}
      className="cs-card cs-card-interactive group flex flex-col p-5 focus-visible:outline-none"
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-control border ${accent}`}
      >
        <Icon size={16} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-heading text-fg">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-secondary">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-bright">
        {cta}
        <ArrowRight
          size={14}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

/** What the verdicts mean. Sits directly under the sample output. */
export function VerdictExplainerSection() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="The output"
          title="Four verdicts, and we only give a confident one when the evidence earns it"
          description="If only one source backs a claim, we say so. An honest UNVERIFIED is more useful than a confident guess."
        />
        <VerdictExplainer className="mt-10" />
      </Container>
    </Section>
  );
}

/** Sample verdicts, clearly labelled as samples. */
export function SampleVerdicts() {
  return (
    <Section bordered>
      <Container>
        <SectionHeading
          eyebrow="Examples"
          title="What an answer looks like"
          description="Illustrative output, shown so you know what to expect before you send anything."
          action={
            <Button to="/fact-check" variant="secondary" size="sm">
              Try it yourself
              <ArrowRight size={13} aria-hidden="true" />
            </Button>
          }
        />

        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          {SAMPLE_VERDICTS.map((sample) => (
            <article key={sample.claim} className="cs-card flex flex-col p-4">
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
                Claim
              </p>
              <p className="mt-1.5 text-sm leading-snug text-fg">&ldquo;{sample.claim}&rdquo;</p>

              <div className="mt-3 rounded-control border border-line-subtle bg-surface p-3">
                <p className="text-2xs font-bold tracking-[0.06em] text-fg-muted">
                  {sample.verdict}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{sample.summary}</p>
                <p className="mt-2 text-2xs text-fg-faint">Source: {sample.source}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/** Privacy and trust commitments. */
export function TrustSection() {
  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="cs-eyebrow mb-2.5">Why you can check us</p>
            <h2 className="text-title text-fg">
              We ask you to trust nothing. We ask you to read the sources.
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-secondary">
              We publish what we collect, what we deliberately do not collect, and how a report
              gets verified before it reaches the public map. If we ask for something we do not
              need, we do not ask for it.
            </p>
            <Button to="/privacy" variant="secondary" size="md" className="mt-6">
              Read the privacy policy
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="cs-card p-4">
                <dt className="text-sm font-semibold text-fg">{point.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-fg-secondary">{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Mission statement. No team names, by policy.
 *
 * WAS: four centred paragraphs inside a prose column, under a headline that was
 * itself a sentence long. The whole block was one 40-character-wide ribbon of
 * text: no line ended where the eye wanted it to, and the reading had to start
 * again at the top of a 600px column every few words. At a phone width it was
 * worse — a single tall grey block with nothing to anchor on.
 *
 * NOW: a headline column and an argument column side by side, which is the shape
 * the argument actually has. The headline is the problem, stated once. The right
 * column is the three reasons, each with an icon and its own short heading, so the
 * reader can take the section in at a glance and go read the one they care about
 * instead of scanning four undifferentiated paragraphs.
 *
 * The trust statement is pulled out beneath both, in its own bordered card, at
 * quote size. It is the only part of this section that a sceptical visitor really
 * needs, so it gets the emphasis rather than being the fourth paragraph.
 *
 * The measure is capped at 560px on the right column. Uncapped, these paragraphs
 * ran to 100 characters and the eye lost the start of the next line.
 */
export function Mission() {
  return (
    <Section bordered>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* Left: the problem, stated once, at heading scale. */}
          <div>
            <p className="cs-eyebrow">Why we built this</p>
            <h2 className="mt-2.5 text-[1.25rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg sm:text-[1.5rem]">
              Most Nigerians are not apathetic about their country.{" "}
              <span className="text-brand-bright">They are misinformed about it.</span>
            </h2>
            {/* A rule, not a quote mark. The accent line marks the sentence as the
                argument's premise without quoting anyone, which matters when the
                point is that nothing here is attributed. */}
            <div aria-hidden="true" className="mt-6 h-px w-16 bg-brand-bright/50" />
          </div>

          {/* Right: the three reasons, as discrete units. */}
          <div className="max-w-[36rem] space-y-7">
            {[
              {
                icon: MessageCircle,
                title: "The Misinformation Crisis",
                body: "A screenshot lands in a group chat. Nobody can tell whether it is real, and it gets forwarded anyway. By the time a newsroom has checked it, the claim has shaped what a hundred thousand people believe.",
              },
              {
                icon: Zap,
                title: "Truth in Seconds",
                body: "CivicSense puts truth awareness in the path of the rumour. You forward the claim and get an answer with the reporting attached, so you judge the evidence yourself instead of taking our word for it.",
              },
              {
                icon: Archive,
                title: "The Memory Gap",
                body: "Politicians make promises, get elected, and the record is never assembled in one place. So we keep it: who holds office, what they said, and what has been documented since.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-brand-bright"
                >
                  <item.icon size={16} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-fg">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The trust statement, as a card rather than a paragraph. This is the
            line that answers "who are you and why should I believe you", and it
            was previously the fourth paragraph of a block nobody scrolled to. */}
        <figure className="cs-card mt-10 border-l-2 border-l-brand-bright/60 p-5 sm:p-6">
          <blockquote className="max-w-[46rem] text-[0.9375rem] font-medium leading-relaxed text-fg sm:text-base">
            Our aim is not to tell young Nigerians what to think. It is to make sure that whatever
            they think, they arrived at it from evidence.
          </blockquote>
          <figcaption className="mt-2 text-xs leading-relaxed text-fg-muted">
            We are a small team of Nigerian engineers and researchers. We do not publish
            individual names on this site, and we answer to one email address:{" "}
            <a
              href={`mailto:${CONFIG.CONTACT_EMAIL}`}
              className="font-medium text-brand-bright hover:underline"
            >
              {CONFIG.CONTACT_EMAIL}
            </a>
            .
          </figcaption>
        </figure>
      </Container>
    </Section>
  );
}

/** Closing call to action, repeated before the footer. */
export function CallToAction() {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-card border border-line bg-card px-6 py-12 text-center sm:px-12">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-brand-bright/[0.08] blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-title text-fg">
              The next claim is already in your inbox
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-fg-secondary">
              Forward it and find out before you forward it on. One message, and it is free.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href={CONFIG.WHATSAPP.joinLink} variant="primary" size="lg">
                <MessageCircle size={16} aria-hidden="true" />
                Open WhatsApp
              </Button>
              <Button to="/report" variant="secondary" size="lg">
                Report misconduct
              </Button>
            </div>
            <p className="mt-4 text-xs text-fg-faint">
              Or{" "}
              <a
                href={`mailto:${CONFIG.CONTACT_EMAIL}`}
                className="underline underline-offset-2 hover:text-fg-secondary"
              >
                email us
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default Features;
