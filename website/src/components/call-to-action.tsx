"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import BackgroundGrid from "@/assets/grid-lines.png";
import BackgroundStars from "@/assets/stars.png";
import { ActionButton } from "@/components/action-button";
import { siteConfig } from "@/config/site-config";
import { useRelativeMousePosition } from "@/hooks/use-relative-mouse-position";

export function CallToAction() {
  const sectionRef = useRef<HTMLElement>(null);
  const borderedDivRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const backgroundPositionY = useTransform(
    scrollYProgress,
    [0, 1],
    [-300, 300],
  );

  const [mouseX, mouseY] = useRelativeMousePosition(borderedDivRef);
  const maskImage = useMotionTemplate`radial-gradient(50% 50% at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <section className="py-20 md:py-24" ref={sectionRef}>
      <div className="container">
        <motion.div
          animate={{ backgroundPositionX: BackgroundStars.width }}
          transition={{
            duration: 120,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="group relative overflow-hidden rounded-xl border border-muted px-6 py-24"
          style={{
            backgroundImage: `url(${BackgroundStars.src})`,
            backgroundPositionY,
          }}
        >
          <div
            className="mask-[radial-gradient(50%_50%_at_50%_35%,black,transparent)] absolute inset-0 bg-[rgb(6,78,59)] bg-blend-overlay transition duration-700 group-hover:opacity-0"
            style={{ backgroundImage: `url(${BackgroundGrid.src})` }}
          />
          <motion.div
            className="absolute inset-0 bg-[rgb(6,78,59)] opacity-0 bg-blend-overlay transition duration-700 group-hover:opacity-100"
            style={{
              backgroundImage: `url(${BackgroundGrid.src})`,
              maskImage: maskImage,
            }}
            ref={borderedDivRef}
          />
          <div className="relative">
            <h2 className="text-center font-medium text-4xl tracking-tighter md:text-5xl">
              Send a rumour to WhatsApp. Get the truth back.
            </h2>
            <p className="mt-5 px-4 text-center text-lg text-white/70 tracking-tight md:text-xl">
              Try it right now and get a sourced verdict in under 20 seconds. No
              app. No sign-up. Any Nigerian can use it today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ActionButton
                label="Start Fact-Checking Now"
                href={siteConfig.whatsappUrl}
              />
              <a
                href={siteConfig.links.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/15 px-4 py-2.5 font-medium text-sm text-white/80 transition hover:border-emerald-400/40 hover:text-white"
              >
                View incident map
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
