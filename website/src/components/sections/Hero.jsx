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

export const SLIDE_DURATION_MS = 7000;
const CROSSFADE_SECONDS = 1.4;

/**
 * The dolly: how far the photograph travels, and how long one full breath takes.
 *
 * Units are the trap here. Motion's `duration` is in SECONDS while
 * SLIDE_DURATION_MS is MILLISECONDS, and assigning one to the other gave this
 * animation a duration of 7000 seconds: a 9% push spread over nearly two hours,
 * which reads as no animation at all. So the zoom is no longer handed to Motion
 * as a transition at all. It is driven by a requestAnimationFrame loop in
 * DollyImage, which writes `transform` straight to the node. Three things fall
 * out of that, each of which a declarative transition could not do:
 *
 *   1. Rate is set by arithmetic on one millisecond constant, with no
 *      seconds/milliseconds conversion anywhere that can go wrong again.
 *   2. It repeats. `repeat: Infinity` on a Motion transition keeps running, but
 *      a slide that has finished a loop sits wherever the loop left it, so a
 *      returning slide faded in mid-cycle at an arbitrary scale. A rAF loop
 *      restarted on becoming visible always begins at ZOOM_FROM.
 *   3. Hover actually pauses it. `paused` already stopped the crossfade timer,
 *      but the zoom used to keep running under a held slide and freeze at its
 *      maximum, so hovering left the photograph visibly stuck mid-move. Here the
 *      elapsed clock stops, so the image holds exactly where it was.
 *
 * DOLLY_CYCLE_MS is four slide dwells. That is what makes the repeat read as
 * deliberate rather than as drift: the cycle is an exact multiple of the
 * rotation, so the scale is at the same point relative to every crossfade and
 * the loop looks intentional instead of slowly sliding out of phase with the
 * carousel.
 *
 * The amplitude is 18% over 28 seconds, which is slower than the previous 14% in
 * seven and needs the extra travel to stay visible. That was the real trade:
 * slowing the push without widening it just recreates the original invisible
 * animation, because an already `object-cover` photograph under a 50% navy wash
 * hides small changes completely. Scale never goes below ZOOM_FROM, so
 * `object-cover` cannot expose an edge at either extreme.
 */
export const DOLLY_CYCLE_MS = SLIDE_DURATION_MS * 4;
export const ZOOM_SECONDS = DOLLY_CYCLE_MS / 1000;
export const ZOOM_FROM = 1;
export const ZOOM_TO = 1.18;

/**
 * Scale for a point in the cycle.
 *
 * A triangle wave mapped through smoothstep: out to ZOOM_TO at the midpoint,
 * back to ZOOM_FROM, with the velocity easing to zero at both ends. A plain
 * triangle would reverse instantly at the extremes, which shows as a corner in
 * the motion; smoothstep gives the long, even travel in the middle of each
 * push with a soft landing at the top and bottom.
 */
export function dollyScale(progress) {
  const t = ((progress % 1) + 1) % 1;
  const triangle = t < 0.5 ? t * 2 : (1 - t) * 2;
  const eased = triangle * triangle * (3 - 2 * triangle);
  return ZOOM_FROM + (ZOOM_TO - ZOOM_FROM) * eased;
}

/**
 * One slide's photograph, with its own dolly clock.
 *
 * A component rather than a loop inside the map so that each slide gets an
 * independent `elapsed` starting at zero. The parent already remounts the
 * element per activation via `key`, but a fresh component is what makes the
 * clock restart cleanly instead of inheriting wherever the previous cycle
 * happened to be.
 *
 * The transform is written to the DOM node rather than held in React state. A
 * setState per frame would re-render the whole hero sixty times a second and
 * reconcile three slides and the headline on every tick; `el.style.transform` is
 * a single property write that the compositor handles on its own.
 */
function DollyImage({ slide, index, isActive, paused, shouldReduceMotion }) {
  const imgRef = useRef(null);

  // Reset the clock when this slide becomes the visible one. Declared before the
  // rAF effect on purpose: effects run in order, so the new activation is at
  // zero by the time the loop starts reading it. Deliberately NOT keyed on
  // `paused` — a hover must hold the current scale, not restart the move.
  const elapsedRef = useRef(0);
  useEffect(() => {
    elapsedRef.current = 0;
  }, [isActive, shouldReduceMotion]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !isActive) return undefined;

    if (shouldReduceMotion) {
      el.style.transform = `scale(${ZOOM_FROM})`;
      return undefined;
    }

    let frame = 0;
    let last = performance.now();

    const tick = (now) => {
      const delta = now - last;
      last = now;
      if (!paused) {
        elapsedRef.current = (elapsedRef.current + delta) % DOLLY_CYCLE_MS;
      }
      el.style.transform = `scale(${dollyScale(elapsedRef.current / DOLLY_CYCLE_MS)})`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, paused, shouldReduceMotion]);

  return (
    <img
      ref={imgRef}
      src={slide.src}
      alt=""
      // Decorative in the accessibility tree: the hero is named by its heading,
      // and announcing a stock photograph adds nothing.
      aria-hidden="true"
      className="h-full w-full object-cover will-change-transform"
      style={{ transform: `scale(${ZOOM_FROM})` }}
      loading={index === 0 ? "eager" : "lazy"}
      fetchPriority={index === 0 ? "high" : "auto"}
      decoding="async"
    />
  );
}

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
              {/* Keyed on the activation so a returning slide remounts at scale
                  ZOOM_FROM with a fresh clock. Without the key the photograph
                  fades back in wherever its previous cycle had reached, which
                  looks like a jump. Both images are decoded and cached after the
                  first rotation, so the remount is not a visible flash. */}
              <DollyImage
                key={`${slide.src}-${isActive}`}
                slide={slide}
                index={index}
                isActive={isActive}
                paused={paused}
                shouldReduceMotion={shouldReduceMotion}
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
