"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";

type Verdict = "VERIFIED" | "MISLEADING" | "FALSE" | "UNVERIFIED";

const VERDICT_STYLES: Record<
  Verdict,
  { icon: typeof CheckCircle2; className: string }
> = {
  VERIFIED: {
    icon: CheckCircle2,
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  },
  MISLEADING: {
    icon: AlertTriangle,
    className: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  },
  FALSE: {
    icon: XCircle,
    className: "border-red-500/40 bg-red-500/15 text-red-300",
  },
  UNVERIFIED: {
    icon: HelpCircle,
    className: "border-white/20 bg-white/10 text-white/50",
  },
};

const VERDICTS: Array<{
  claim: string;
  verdict: Verdict;
  evidence: string;
  source: string;
}> = [
  {
    claim: "The fuel subsidy was removed in May 2023",
    verdict: "VERIFIED",
    evidence:
      "Announced during Tinubu's inauguration speech on May 29 2023. Pump prices rose from about 185 to over 500 naira per litre.",
    source: "Premium Times, Punch",
  },
  {
    claim: "Fuel now costs 200 naira per litre",
    verdict: "FALSE",
    evidence:
      "As of 2024, petrol sells for between 600 and 700 naira per litre nationwide after the subsidy removal.",
    source: "NNPC, Premium Times",
  },
  {
    claim: "Nigeria's debt has exceeded 100 trillion naira",
    verdict: "VERIFIED",
    evidence:
      "The Debt Management Office put total public debt at approximately 121.67 trillion naira by March 2024.",
    source: "DMO, Premium Times",
  },
  {
    claim: "Workers' minimum wage is now 70,000 naira",
    verdict: "VERIFIED",
    evidence:
      "President Tinubu signed the new national minimum wage of 70,000 naira per month into law in July 2024.",
    source: "State House, NLC",
  },
  {
    claim: "Peter Obi won the 2023 election in Lagos State",
    verdict: "VERIFIED",
    evidence:
      "Obi of the Labour Party won Lagos with 582,454 votes, beating Tinubu of the APC who polled 572,606.",
    source: "INEC",
  },
  {
    claim: "Nigeria joined BRICS in 2024",
    verdict: "FALSE",
    evidence:
      "Nigeria applied for membership but has not been admitted. South Africa remains the bloc's only African member.",
    source: "Vanguard, Punch",
  },
  {
    claim: "Nigeria has free healthcare for all citizens",
    verdict: "FALSE",
    evidence:
      "The NHIA covers only a fraction of the population; most Nigerians still pay out-of-pocket for medical care.",
    source: "NHIA, WHO",
  },
  {
    claim: "SARS was disbanded after the EndSARS protests",
    verdict: "VERIFIED",
    evidence:
      "The Inspector General of Police announced the dissolution of SARS on October 11 2020 after nationwide protests.",
    source: "Nigeria Police Force",
  },
];

export function SampleVerdicts() {
  return (
    <section id="verdicts" className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-center font-medium text-4xl tracking-tighter md:text-5xl">
          Real claims. Real verdicts.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-white/70 tracking-tight md:text-xl">
          A sample of the civic facts and live news checks behind every WhatsApp
          reply. Each comes with plain-English evidence and sources.
        </p>
        <div className="mask-[linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] mt-10 flex overflow-hidden">
          <motion.div
            initial={{ x: "-50%" }}
            animate={{ x: "0" }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 70,
              ease: "linear",
            }}
            className="flex flex-none gap-5"
          >
            {[...VERDICTS, ...VERDICTS].map((item, index) => {
              const style = VERDICT_STYLES[item.verdict];
              const Icon = style.icon;
              return (
                <div
                  key={index}
                  className="flex w-[19rem] shrink-0 flex-col rounded-xl border border-muted bg-[linear-gradient(to_bottom_left,rgb(16,185,129,0.22),black)] p-6 md:w-[26rem] md:p-8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold text-xs ${style.className}`}
                    >
                      <Icon className="size-3.5" />
                      {item.verdict}
                    </span>
                    <span className="text-white/40 text-xs">
                      CivicSense verdict
                    </span>
                  </div>
                  <p className="mt-5 text-lg text-white tracking-tight md:text-2xl">
                    &ldquo;{item.claim}&rdquo;
                  </p>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed">
                    {item.evidence}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-6 text-emerald-300/80 text-xs">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span>Based on: {item.source}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
