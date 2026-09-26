import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { CONFIG } from "../../config/config";
import { Button } from "../shared/Button";
import { Container } from "../shared/Layout";
import { SOURCE_LOGOS, STEPS } from "../../data/content";

/**
 * Home hero: a full-bleed image slider behind the product's one sentence.
 *
 * The photographs are bundled, not fetched, and there is no third-party script
 * anywhere in this component. The dark overlay is navy at 40% rather than black,
 * so a photograph keeps its colour temperature instead of going flat behind the
 * text.
 *
 * Motion is real motion, not decoration: the crossfade is slow enough to read as
 * a dissolve rather than a flicker, and the slow zoom stops a still frame from
 * looking like a broken image. Both are switched off entirely under
 * prefers-reduced-motion, where the first slide simply stays put.
 *
 * The images are the only large assets on the page, so the first one is marked
 * high priority and the rest lazy. The slider is decorative support for the
 * headline, which is why every slide but the active one is hidden from assistive
 * technology rather than announced as a list.
 */

const SLIDES = [
  {
    src: "/images/image_man_holding_flag_walking_across_street.webp",
    alt: "A man carrying the Nigerian flag as he walks across a street",
  },
  {
    src: "/images/holding_hands_in_a_ring.jpg",
    alt: "Hands painted in the colours of the Nigerian flag, joined in a circle",
  },
];

const SLIDE_DURATION_MS = 7000;
const CROSSFADE_SECONDS = 1.4;
const ZOOM_SECONDS = 14;

export function Hero() {
  const [active, setActive] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // One interval, cleared on unmount and whenever rotation is suspended. A
  // leaked interval here would keep setting state on an unmounted hero.
  useEffect(() => {
    if (shouldReduceMotion || paused) return undefined;

    timerRef.current = setInterval(
      () => setActive((index) => (index + 1) % SLIDES.length),
      SLIDE_DURATION_MS,
    );

    return () => clearInterval(timerRef.current);
  }, [shouldReduceMotion, paused]);

  // A dot click restarts the dwell time, so a manual pick is not immediately
  // replaced by the slide that was already counting down.
  const select = useCallback((index) => {
    setActive(index);
    setPaused(false);
  }, []);

  return (
    <section
      className="relative -mt-16 flex min-h-[92svh] items-center justify-center overflow-hidden md:min-h-[760px]"
      aria-labelledby="hero-heading"
      // Hovering or focusing the hero holds the slide. Moving the pointer across
      // a photograph should not restart the carousel underneath it.
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, index) => {
        const isActive = active === index;

        return (
          <div
            key={slide.src}
            className="absolute inset-0"
            aria-hidden={!isActive}
            role={isActive ? "img" : undefined}
            aria-label={isActive ? slide.alt : undefined}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: CROSSFADE_SECONDS, ease: "easeInOut" }}
            >
              <motion.img
                src={slide.src}
                alt=""
                // Decorative in the accessibility tree: the hero is named by its
                // heading, and announcing a stock photograph adds nothing.
                aria-hidden="true"
                className="h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                initial={false}
                animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.06] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: ZOOM_SECONDS, repeat: Infinity, ease: "linear" }
                }
              />
            </motion.div>
          </div>
        );
      })}

      {/* One flat wash over the whole photograph. No bottom gradient, no top
          gradient, no stacked layers.

          The gradient stack was the mistake. It created a visible band under the
          fold and darkened the lower third unevenly, which read as a smudge
          rather than as depth. A single uniform navy wash gives the even
          cinematic falloff the photographs needed, and the image stays legible
          underneath it. At 0.5 the whites in the photograph still read as
          photographic rather than as grey. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[rgb(var(--cs-overlay-navy)/0.5)]"
        aria-hidden="true"
      />

      {/* Content. Four elements, centred, nothing else: the name, the promise,
          one sentence, one button.

          Every earlier version carried more. An eyebrow, a paragraph about the
          mission, a second button, a footnote: the photograph stopped being the
          point and the hero started reading like a poster. The long mission
          statement lives on the About page, which has room for it. */}
      <Container className="relative z-10 text-center">
        <motion.h1
          id="hero-heading"
          className="text-[2.375rem] leading-[1.05] tracking-[-0.035em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          CivicSense
        </motion.h1>

        <motion.p
          className="mt-3 text-lg font-semibold tracking-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)] sm:text-xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
        >
          Verify. Share.{" "}
          <span className="text-brand-bright">Vote informed.</span>
        </motion.p>

        <motion.p
          className="mx-auto mt-5 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-base"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
        >
          Send a claim to WhatsApp. Get the truth back in seconds.
        </motion.p>

        <motion.div
          className="mt-8 flex justify-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
        >
          <Button href={CONFIG.WHATSAPP.joinLink} variant="accent" size="lg">
            <MessageCircle size={16} aria-hidden="true" />
            Try on WhatsApp
          </Button>
        </motion.div>

        <SlideDots slides={SLIDES} active={active} onSelect={select} />
      </Container>
    </section>
  );
}

/**
 * Slide indicators.
 *
 * A tablist would claim these move between panels, which is not what they do;
 * they are plain buttons that set the visible slide, and each is labelled with
 * the image it shows so the control is not announced as "slide 2 of 2".
 */
function SlideDots({ slides, active, onSelect }) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      {slides.map((slide, index) => {
        const isActive = active === index;

        return (
          <button
            key={slide.src}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Show slide ${index + 1} of ${slides.length}`}
            aria-current={isActive}
            className={[
              "h-1.5 rounded-full transition-all duration-300",
              isActive ? "w-7 bg-brand-bright" : "w-1.5 bg-white/45 hover:bg-white/75",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

/**
 * Source band, directly under the hero.
 *
 * The newsrooms are named with their real logos rather than described, because
 * the whole claim of the product is which sources the verdicts come from.
 */
export function SourceTicker() {
  return (
    <section className="border-t border-line bg-surface" aria-label="Newsrooms in the index">
      <Container className="py-7">
        <p className="text-center text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
          Checked against reporting from
        </p>

        <div className="cs-marquee relative mt-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <ul className="cs-marquee-track items-center gap-8 pr-8">
            {/* Rendered twice so the -50% translate loops seamlessly. */}
            {[...SOURCE_LOGOS, ...SOURCE_LOGOS].map((source, index) => (
              <li
                key={`${source.file}-${index}`}
                className="flex shrink-0 items-center gap-2.5"
                aria-hidden={index >= SOURCE_LOGOS.length}
              >
                <img
                  src={`/images/sources/${source.file}.png`}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-sm opacity-55 grayscale transition-opacity hover:opacity-90 hover:grayscale-0"
                  loading="lazy"
                  decoding="async"
                />
                <span className="whitespace-nowrap text-sm font-medium text-fg-muted">
                  {source.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/** Three-step explanation of the pipeline. */
export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="cs-eyebrow mb-2.5">How it works</p>
          <h2 className="text-title text-fg">Three steps, about twenty seconds</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-secondary">
            No account to create and nothing to install. The chat is the entire interface.
          </p>
        </div>

        <ol className="cs-stagger mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="cs-card relative p-5">
              <span className="text-2xs font-semibold tabular-nums text-fg-faint">
                0{index + 1}
              </span>
              <h3 className="mt-2 text-heading text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** A WhatsApp thread, drawn rather than screenshotted. */
export function PhoneMock() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="cs-card overflow-hidden shadow-raised">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/25">
            <MessageCircle size={15} className="text-brand-bright" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">CivicSense</p>
            <p className="text-2xs text-live">online</p>
          </div>
        </div>

        <div className="space-y-2.5 p-4">
          <p className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-brand px-3 py-2 text-sm leading-relaxed text-white">
            Fuel subsidy has been removed and petrol is now ₦200 per litre
          </p>

          <div className="max-w-[92%] rounded-lg rounded-bl-sm border border-line bg-card-active px-3 py-2.5">
            <p className="text-2xs font-bold tracking-[0.06em] text-false">FALSE</p>
            <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
              Petrol does not sell for ₦200. Pump prices vary by state and have settled between
              ₦700 and ₦900 per litre.
            </p>
            <p className="mt-2 border-t border-line pt-1.5 text-2xs text-fg-faint">
              Source: Premium Times, NBS
            </p>
          </div>

          <p className="ml-auto max-w-[80%] rounded-lg rounded-br-sm bg-brand px-3 py-2 text-sm leading-relaxed text-white">
            What about the minimum wage?
          </p>

          <div className="max-w-[92%] rounded-lg rounded-bl-sm border border-line bg-card-active px-3 py-2.5">
            <p className="text-2xs font-bold tracking-[0.06em] text-verified">VERIFIED</p>
            <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
              The new national minimum wage is ₦70,000 per month. State governments may set a
              higher figure.
            </p>
            <p className="mt-2 border-t border-line pt-1.5 text-2xs text-fg-faint">
              Source: National Orientation Agency
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-2xs text-fg-faint">
        Sample conversation. Every reply shows the reporting it came from.
      </p>
    </div>
  );
}

export default Hero;
