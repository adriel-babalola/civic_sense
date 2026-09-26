"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/action-button";
import { siteConfig } from "@/config/site-config";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/image_man_holding_flag_walking_across_street.webp",
    alt: "A man carrying the Nigerian flag walking across a street",
  },
  {
    src: "/holding_hands_in_a_ring.jpg",
    alt: "Hands painted in Nigerian flag colours joined in a circle",
  },
];

const SLIDE_DURATION_MS = 7000;

export function HeroSection() {
  const [active, setActive] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(
      () => setActive((index) => (index + 1) % SLIDES.length),
      SLIDE_DURATION_MS,
    );
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden md:min-h-[800px]">
      {/* Slideshow background */}
      {SLIDES.map((slide, index) => (
        <motion.div
          key={slide.src}
          initial={false}
          animate={{ opacity: active === index ? 1 : 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0"
          role="img"
          aria-label={slide.alt}
          aria-hidden={active !== index}
        >
          <motion.div
            initial={false}
            animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.06] }}
            transition={
              shouldReduceMotion
                ? undefined
                : {
                    duration: 14,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }
            }
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${slide.src})` }}
          />
        </motion.div>
      ))}
      {/* Navy overlay so the text pops */}
      <div className="absolute inset-0 bg-[rgba(13,27,42,0.4)]" />
      {/* Bottom blend into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-background/50 to-transparent" />
      {/* Hero content */}
      <div className="container relative">
        <h1 className="text-center font-semibold text-white tracking-tight leading-none text-[13vw] md:text-[96px]">
          CivicSense
        </h1>
        <p className="mt-2 text-center font-semibold text-white tracking-tight text-base md:text-[20px]">
          Verify. Share.{" "}
          <span className="text-[#2ECC71] drop-shadow-[0_0_18px_rgba(46,204,113,0.35)] underline decoration-[#2ECC71] decoration-2 underline-offset-4">
            Vote informed.
          </span>
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-center text-base text-white/80 md:text-[20px] leading-[1.6]">
          Reclaim your voice. Restore accountability. Build the Nigeria you
          deserve.
        </p>
        <div className="mt-5 flex justify-center">
          <ActionButton label="Try on WhatsApp" href={siteConfig.whatsappUrl} />
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                active === index
                  ? "w-6 bg-emerald-400"
                  : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
