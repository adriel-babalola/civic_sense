"use client";

import { BadgeCheck, Search, Send } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type ValueAnimationTransition,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icons } from "@/components/icons";

const tabs = [
  {
    icon: Send,
    title: "Send any claim",
  },
  {
    icon: Search,
    title: "AI gathers the evidence",
  },
  {
    icon: BadgeCheck,
    title: "Get a sourced verdict",
  },
];

type FeatureTabProps = (typeof tabs)[number] &
  ComponentPropsWithoutRef<"div"> & { selected: boolean };

const FeatureTab = (props: FeatureTabProps) => {
  const tabRef = useRef<HTMLDivElement>(null);
  const xPercentage = useMotionValue(0);
  const yPercentage = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const maskImage = useMotionTemplate`radial-gradient(80px 80px at ${xPercentage}% ${yPercentage}%, black, transparent)`;

  useEffect(() => {
    if (!tabRef.current || !props.selected || shouldReduceMotion) return;

    xPercentage.set(0);
    yPercentage.set(0);
    const { height, width } = tabRef.current.getBoundingClientRect();

    const circumference = height * 2 + width * 2;
    const times = [
      0,
      width / circumference,
      (width + height) / circumference,
      (width * 2 + height) / circumference,
      1,
    ];

    const options: ValueAnimationTransition = {
      times,
      duration: 5,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "linear",
    };

    animate(xPercentage, [0, 100, 100, 0, 0], options);
    animate(yPercentage, [0, 0, 100, 100, 0], options);
  }, [props.selected, xPercentage, yPercentage, shouldReduceMotion]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <div> element required for the animation to work
    <div
      className="relative flex cursor-pointer items-center gap-2.5 rounded-xl border border-muted p-2.5 hover:bg-muted/30"
      ref={tabRef}
      onClick={props.onClick}
    >
      {props.selected && (
        <motion.div
          style={{ maskImage }}
          className="absolute inset-0 -m-px rounded-xl border border-[#34d399]"
        />
      )}
      <div className="inline-flex size-12 items-center justify-center rounded-lg border border-muted">
        <props.icon className="size-5" />
      </div>
      <div className="font-medium">{props.title}</div>
    </div>
  );
};

export function HowItWorks() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <section id="how-it-works" className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-center font-medium text-4xl tracking-tighter md:text-5xl">
          How it works.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-white/70 tracking-tight md:text-xl">
          From rumour to the truth in three steps, right inside WhatsApp, where
          100 million Nigerians already talk.
        </p>
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {tabs.map((tab, index) => (
            <FeatureTab
              {...tab}
              key={tab.title}
              onClick={() => setSelectedTab(index)}
              selected={selectedTab === index}
            />
          ))}
        </div>
        <motion.div className="mt-3 rounded-xl border border-muted p-2.5">
          <div className="min-h-[340px] overflow-hidden rounded-lg border border-muted bg-[#070b09] md:min-h-[380px]">
            <AnimatePresence mode="wait">
              <Panel key={selectedTab} tab={selectedTab} />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Panel({ tab }: { tab: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {tab === 0 && <SendClaimPanel />}
      {tab === 1 && <EvidencePanel />}
      {tab === 2 && <VerdictPanel />}
    </motion.div>
  );
}

const whatsAppBar = (
  <div className="flex items-center gap-3 border-emerald-500/20 border-b bg-[#0a381f] px-4 py-3">
    <div className="grid size-9 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
      <Icons.whatsapp className="size-5" />
    </div>
    <div>
      <div className="font-semibold text-sm text-white">CivicSense</div>
      <div className="text-emerald-300/80 text-xs">online</div>
    </div>
  </div>
);

function SendClaimPanel() {
  return (
    <div className="flex h-full flex-col">
      {whatsAppBar}
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-6">
        <p className="text-sm text-white/60 md:text-base">
          Forward any rumour, headline or screenshot. Text or image, it
          doesn&apos;t matter.
        </p>
        <div className="max-w-[85%] self-end rounded-xl rounded-tr-sm border border-emerald-500/30 bg-[#0a3d2c] px-4 py-2.5 text-sm text-white md:text-base">
          Did Tinubu remove the fuel subsidy?
        </div>
        <div className="max-w-[85%] self-start rounded-xl rounded-tl-sm border border-muted bg-card px-4 py-3">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-semibold text-[10px] text-emerald-300">
            <BadgeCheck className="size-3" />
            VERDICT: VERIFIED
          </div>
          <p className="text-sm text-white/85 leading-relaxed">
            Yes. President Tinubu announced the removal of the petrol subsidy
            during his inauguration speech on May 29 2023, and pump prices rose
            from about 185 naira to over 500 naira per litre.
          </p>
          <div className="mt-2 text-emerald-300/80 text-xs">
            Source: Premium Times, The Punch
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidencePanel() {
  const steps = [
    {
      title: "Civic knowledge base",
      detail:
        "25 curated facts covering fuel subsidy, INEC results, CBN policy, budgets",
    },
    {
      title: "Live news index",
      detail: "17 Nigerian newsrooms synced via RSS every 30 minutes",
    },
    {
      title: "Live web search",
      detail: "Tavily search across 16 Nigerian news domains",
    },
  ];
  return (
    <div className="flex h-full flex-col">
      {whatsAppBar}
      <div className="flex flex-1 flex-col justify-center gap-3 p-4 md:p-8">
        <p className="text-sm text-white/60 md:text-base">
          Retrieval runs in parallel, then the evidence is scored by Gemini in a
          single call.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.12 }}
              className="rounded-xl border border-muted bg-card/60 p-4"
            >
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-emerald-300" />
                <span className="font-medium text-sm text-white">
                  {step.title}
                </span>
              </div>
              <p className="mt-2 text-white/55 text-xs leading-relaxed">
                {step.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VerdictPanel() {
  return (
    <div className="flex h-full flex-col">
      {whatsAppBar}
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-6">
        <p className="text-sm text-white/60 md:text-base">
          The reply lands in seconds. Structured, plain-English and sourced.
        </p>
        <div className="max-w-[90%] rounded-xl rounded-tl-sm border border-muted bg-card px-4 py-3.5">
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-300 text-xs">
            <BadgeCheck className="size-3.5" />
            VERDICT: VERIFIED
          </div>
          <p className="text-sm text-white/85 leading-relaxed">
            President Tinubu announced the removal of the petrol subsidy during
            his inauguration speech on May 29 2023. Pump prices rose from about
            185 naira to over 500 naira per litre.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-emerald-300/80 text-xs">
            <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5">
              Source: Premium Times &amp; Punch
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-white/60">
              ~4s reply
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
