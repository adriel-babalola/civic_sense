"use client";

import { motion } from "motion/react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import BusinessDay from "@/assets/sources/businessday.png";
import Channels from "@/assets/sources/channels.png";
import Dailypost from "@/assets/sources/dailypost.png";
import DailyTrust from "@/assets/sources/dailytrust.png";
import Dubawa from "@/assets/sources/dubawa.png";
import FactCheckAfrica from "@/assets/sources/factcheckafrica.png";
import FactCheckHub from "@/assets/sources/factcheckhub.png";
import Guardian from "@/assets/sources/guardian.png";
import InformationNGA from "@/assets/sources/informationng.png";
import Leadership from "@/assets/sources/leadership.png";
import PMNews from "@/assets/sources/pmnews.png";
import PremiumTimes from "@/assets/sources/premiumtimes.png";
import Punch from "@/assets/sources/punch.png";
import Ripples from "@/assets/sources/ripples.png";
import TheCable from "@/assets/sources/thecable.png";
import Tribune from "@/assets/sources/tribune.png";
import Vanguard from "@/assets/sources/vanguard.png";

const SOURCES = [
  { name: "Premium Times", icon: PremiumTimes },
  { name: "The Punch", icon: Punch },
  { name: "Vanguard", icon: Vanguard },
  { name: "Daily Trust", icon: DailyTrust },
  { name: "Leadership", icon: Leadership },
  { name: "Channels TV", icon: Channels },
  { name: "Daily Post", icon: Dailypost },
  { name: "Nigerian Tribune", icon: Tribune },
  { name: "BusinessDay", icon: BusinessDay },
  { name: "PM News", icon: PMNews },
  { name: "Ripples Nigeria", icon: Ripples },
  { name: "Information Nigeria", icon: InformationNGA },
  { name: "TheCable", icon: TheCable },
  { name: "The Guardian NG", icon: Guardian },
  { name: "Dubawa", icon: Dubawa },
  { name: "FactCheckHub", icon: FactCheckHub },
  { name: "FactCheck Africa", icon: FactCheckAfrica },
] satisfies Array<{
  name: string;
  icon: StaticImageData;
}>;

export function SourcesTicker() {
  return (
    <section id="sources" className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-center font-medium text-4xl tracking-tighter md:text-5xl">
          Grounded in Nigeria&apos;s newsrooms.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-white/70 tracking-tight md:text-xl">
          Every verdict is cross-checked against a curated civic knowledge base
          and live feeds from these news outlets and IFCN-registered
          fact-checkers.
        </p>
        <div className="mask-[linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] mt-10 overflow-hidden">
          <motion.div
            initial={{ x: "-50%" }}
            animate={{ x: 0 }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 50,
              ease: "linear",
            }}
            className="flex flex-none -translate-x-1/2 gap-4 pr-4"
          >
            {[...SOURCES, ...SOURCES].map((source, index) => (
              <div
                key={index}
                className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3"
              >
                <span className="flex shrink-0 items-center rounded-lg bg-white/[0.08] p-1.5">
                  <Image
                    src={source.icon}
                    alt={`${source.name} logo`}
                    width={44}
                    height={44}
                    className="h-10 w-10 rounded-lg object-contain"
                  />
                </span>
                <span className="whitespace-nowrap font-medium text-base text-white/85">
                  {source.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
