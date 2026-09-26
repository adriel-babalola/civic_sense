import { Code, Github, Landmark, Rocket } from "lucide-react";

const TEAM = [
  {
    handle: "adriel-babalola",
    role: "Webhook & knowledge base",
    icon: Github,
  },
  {
    handle: "debugAyo",
    role: "AI pipeline & dashboards",
    icon: Code,
  },
  {
    handle: "David Adeola",
    role: "Civic research & content",
    icon: Landmark,
  },
  {
    handle: "Promise Abiodu",
    role: "Design & growth",
    icon: Rocket,
  },
];

export function TeamSection() {
  return (
    <section id="team" className="py-20 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-medium text-3xl tracking-tighter md:text-4xl">
            Meet the team
          </h2>
          <p className="mt-5 text-lg text-white/70 leading-relaxed md:text-xl">
            The people building CivicSense to make Nigerian civic life
            verifiable, one WhatsApp message at a time.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
          {TEAM.map((member) => (
            <div
              key={member.handle}
              className="flex items-center gap-3.5 rounded-2xl border border-muted bg-card/40 px-6 py-5"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                <member.icon className="size-5" />
              </div>
              <div>
                <div className="font-medium text-sm">{member.handle}</div>
                <div className="mt-0.5 text-white/50 text-xs">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}