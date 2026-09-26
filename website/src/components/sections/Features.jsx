import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, MessageCircle, Search } from "lucide-react";
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

/** Mission statement. No team names, by policy. */
export function Mission() {
  return (
    <Section bordered>
      <Container size="prose" className="text-center">
        <p className="cs-eyebrow mb-2.5">Why we built this</p>
        <h2 className="text-title text-fg">
          Most Nigerians are not apathetic about their country. They are misinformed about it.
        </h2>
        <div className="mt-5 space-y-4 text-left">
          <p>
            Young Nigerians are handed more political information in a day than their parents saw
            in a year, and almost all of it arrives unverified. A screenshot lands in a group
            chat, nobody can tell whether it is real, and it gets forwarded anyway. By the time a
            newsroom has checked it, the claim has already shaped what a hundred thousand people
            believe.
          </p>
          <p>
            That is a sensitisation problem before it is a technology problem. CivicSense exists to
            put truth awareness in the path of the rumour. You forward the claim, and within
            seconds you get an answer with the reporting attached, so you can judge the evidence
            yourself and decide what to do with it.
          </p>
          <p>
            The second half of the problem is memory. Politicians make promises, get elected, and
            the record is never assembled in one place. So we keep it: who holds office, what they
            said, and what has been documented since.
          </p>
          <p>
            The aim is not to tell young Nigerians what to think. It is to make sure that whatever
            they think, they arrived at it from evidence. We are a small team of Nigerian engineers
            and researchers. We do not publish individual names on this site, and we answer to one
            anonymous email address.
          </p>
        </div>
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
