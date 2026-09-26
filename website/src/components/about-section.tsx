import {
  Binoculars,
  Bot,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";
import { siteConfig } from "@/config/site-config";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Election Calendar",
    detail:
      "Key election dates with bot reminders you can sync to your Apple or Google calendar.",
    target: "10M+ youths on the voter roll",
    href: siteConfig.links.dashboardUrl,
    accent: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  {
    icon: ShieldAlert,
    title: "Anonymous Reporting",
    detail:
      "Submit incidents anonymously and get corroborated, journalistic stamps on them.",
    target: "every incident logged by state & LGA",
    href: siteConfig.links.reportUrl,
    accent: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  {
    icon: Binoculars,
    title: "Politician Watch",
    detail:
      "Bios, policies and track records, linked to videos, tweets and manifestos.",
    target: "50+ politician profiles",
    href: siteConfig.links.dashboardUrl,
    accent: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  },
  {
    icon: Bot,
    title: "WhatsApp Bot",
    detail: "Send a rumour and get a sourced verdict right inside WhatsApp.",
    target: "under 30-second verdicts",
    href: siteConfig.whatsappUrl,
    accent: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-medium text-3xl tracking-tighter md:text-4xl">
            What is CivicSense?
          </h2>
          <p className="mt-5 text-lg text-white/70 leading-relaxed md:text-xl">
            CivicSense puts real-time fact-checking and a persistent civic
            record right where Nigerians already are: on WhatsApp, Facebook and
            the web. Send a claim and get the truth. Keep score on what
            politicians said, promised and did. No app. No sign-up. Nothing
            disappears into the noise.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-muted bg-card/40 p-6 transition hover:border-emerald-400/40 hover:bg-card/80"
            >
              <div
                className={cn(
                  "grid size-12 place-items-center rounded-xl border transition group-hover:scale-105",
                  feature.accent,
                )}
              >
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-medium">{feature.title}</h3>
              <p className="mt-2.5 text-sm text-white/55 leading-relaxed">
                {feature.detail}
              </p>
              <div className="mt-6 border-white/10 border-t pt-4">
                <div className="font-semibold text-[10px] text-white/40 uppercase tracking-widest">
                  Target
                </div>
                <div className="mt-1.5 font-medium text-sm text-white/90">
                  {feature.target}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
