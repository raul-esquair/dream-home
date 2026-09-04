"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { Reveal } from "./Reveal";
import { testimonials } from "@/lib/content";

/**
 * Horizontal offset per paper layer, in px.
 *
 * The reference uses 1.1, which put the gilt edge at 18-30px — six to ten times
 * the ~3px edge on the listings cards, and heavy enough to read as a bar rather
 * than a border. At 0.2 the same page counts give 2.8-6.0px, which sits at the
 * listings' scale while still varying card to card.
 */
const PAGE_STEP = 0.2;

/**
 * Gilt edge, sampled from the palette: --color-gold-pale nearest the cover,
 * the deep end of the shimmer ramp at the outer edge, where the stack turns
 * away from the light.
 *
 * The colour has to be set per sheet rather than left to one gradient across
 * the stack. A sheet is only ever visible as a PAGE_STEP-wide strip at its own
 * right edge — the least-translated sheet is on top — so a gradient's middle
 * stops are unreachable and every strip would render the same end colour.
 * Shading them with filter: brightness() instead just walks the gold toward
 * khaki, which is what put the edges off-palette to begin with.
 */
const GILT_NEAR = [247, 231, 180];
const GILT_FAR = [169, 130, 31];

function gilt(t: number) {
  const [r, g, b] = GILT_NEAR.map((near, i) => Math.round(near + (GILT_FAR[i] - near) * t));
  return `rgb(${r} ${g} ${b})`;
}

/**
 * One quote rendered as a book: a cover with a stack of pages fanned out along
 * its right edge, the whole object sheared 30deg. Sheets only offset along X —
 * the shear is applied once to the card in CSS so cover and pages flatten
 * together when the card is reached for.
 *
 * `focusable` is false for the duplicate track copy, which is aria-hidden and
 * must not take a tab stop.
 */
function TestimonialCard({
  quote,
  attribution,
  pages,
  focusable,
}: (typeof testimonials)[number] & { focusable: boolean }) {
  const depth = PAGE_STEP * pages;

  return (
    <figure
      className="tm-card"
      /* Flattening a card is a pointer gesture; this is how it is also a
         keyboard one. Devices without hover get the flat grid instead, so
         nothing is gated behind a gesture they cannot make. */
      tabIndex={focusable ? 0 : -1}
      style={{ "--tm-depth": `${depth}px` } as React.CSSProperties}
    >
      {/* Paper stack. Rendered back to front so each sheet overlaps the one
          behind it; `hidden` from a11y since it is pure material. */}
      <div aria-hidden className="tm-stack">
        <div className="tm-sheet tm-sheet--back" />
        {Array.from({ length: pages }, (_, i) => {
          const t = (i + 1) / pages;
          return (
            <div
              key={i}
              className="tm-sheet tm-sheet--paper"
              style={{
                transform: `translateX(${PAGE_STEP * (i + 1)}px)`,
                backgroundColor: gilt(t),
                zIndex: pages - i,
              }}
            />
          );
        })}
      </div>

      <div className="tm-face">
        <span aria-hidden className="tm-spine" />
        <div className="tm-body">
          <div aria-hidden className="tm-stars">
            &#9733;&#9733;&#9733;&#9733;&#9733;
          </div>
          <blockquote className="tm-quote">{quote}</blockquote>
        </div>
        <figcaption className="tm-attribution tm-body">{attribution}</figcaption>
      </div>
    </figure>
  );
}

/**
 * Client quotes as an overlapping, slowly drifting shelf of cards.
 *
 * The track is two identical copies translating to -50%, so the loop is
 * seamless; the second copy is `aria-hidden` so the quotes are announced once.
 * At rest every card is sheared 30deg, as in the reference — the quote is
 * texture on a cover, not yet something to read. Hovering or focusing one
 * flattens the shear to 0, lifts it clear and parts its neighbours, all in CSS
 * via `:has()`. Devices with no hover, and anyone on prefers-reduced-motion,
 * get an upright wrapped grid instead (see globals.css); the duplicate track
 * copy is dropped there too.
 *
 * The explicit pause button is why this is a client component. Unlike the
 * service-area <Marquee>, which is decorative and aria-hidden, these are words
 * a visitor is meant to read — moving indefinitely with no way to stop it
 * fails WCAG 2.2.2, and hovering only helps people using a mouse.
 */
/** Momentum decay per frame after a flick. */
const FRICTION = 0.94;
/** Below this the flick is spent, in px per frame. */
const STILL = 0.06;

export function Testimonials() {
  const track = [0, 1].flatMap((copy) =>
    testimonials.map((testimonial) => ({ testimonial, copy })),
  );

  const [paused, setPaused] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const velocity = useRef(0);
  const drag = useRef({ on: false, lastX: 0, lastT: 0 });
  const frame = useRef(0);

  /* Drag is meaningless where the shelf is a wrapped grid rather than a
     scrolling track, which is the same media condition globals.css flattens
     it on. Resolved after mount: the server has no matchMedia. */
  const [flat, setFlat] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)");
    const sync = () => setFlat(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /**
   * Entrance and exit twist, as on the listings ring: the shelf turns as the
   * section crosses the viewport and sits level through the middle. Read
   * straight off scroll — a lagging twist reads as sluggishness, not weight.
   *
   * The angles are smaller here, and Z smaller still. This shelf is wider than
   * the listings ring, and rolling a wide row sweeps its outer cards vertically
   * against a viewport that clips.
   */
  const { scrollYProgress } = useScroll({
    target: viewportRef,
    offset: ["start end", "end start"],
  });
  const IN = [0, 0.3, 0.44, 0.56, 0.7, 1];
  const twistX = useTransform(scrollYProgress, IN, [-10, -3.2, 0, 0, 3.2, 10]);
  const twistY = useTransform(scrollYProgress, IN, [7, 2.2, 0, 0, -2.2, -7]);
  const twistZ = useTransform(scrollYProgress, IN, [-0.6, -0.2, 0, 0, 0.2, 0.6]);

  /**
   * The two copies make the content periodic: an offset and that offset plus
   * one copy's width are indistinguishable. Folding into (-period, 0] keeps the
   * loop seamless however far the shelf is thrown, and stops the number
   * growing without bound.
   */
  const fold = useCallback((v: number) => {
    const period = (trackRef.current?.offsetWidth ?? 0) / 2;
    if (!period) return v;
    const m = v % period;
    return m > 0 ? m - period : m;
  }, []);

  const apply = useCallback(() => {
    layerRef.current?.style.setProperty("--tm-drag", `${offset.current.toFixed(2)}px`);
  }, []);

  const coast = useCallback(() => {
    cancelAnimationFrame(frame.current);
    const tick = () => {
      if (Math.abs(velocity.current) < STILL) {
        velocity.current = 0;
        // Hands the shelf back to the CSS drift.
        viewportRef.current?.removeAttribute("data-dragging");
        return;
      }
      offset.current = fold(offset.current + velocity.current);
      apply();
      velocity.current *= FRICTION;
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [apply, fold]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (flat) return;
    if ((e.target as HTMLElement).closest("button")) return;
    cancelAnimationFrame(frame.current);
    drag.current = { on: true, lastX: e.clientX, lastT: e.timeStamp };
    velocity.current = 0;
    // Holds the CSS drift so the pointer and the animation are not both moving it.
    viewportRef.current?.setAttribute("data-dragging", "");
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    const dx = e.clientX - drag.current.lastX;
    offset.current = fold(offset.current + dx);
    apply();
    // Normalised to a 60fps frame so a flick reads the same on any display.
    const dt = Math.max(1, e.timeStamp - drag.current.lastT);
    velocity.current = velocity.current * 0.7 + dx * (16.67 / dt) * 0.3;
    drag.current.lastX = e.clientX;
    drag.current.lastT = e.timeStamp;
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    drag.current.on = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // Cap the throw, or a hard flick runs the shelf for seconds.
    velocity.current = Math.max(-90, Math.min(90, velocity.current));
    coast();
  };

  return (
    <section className="tm-section">
      {/* The heading keeps the page's 1400px column; the shelf below runs the
          full width of the screen, so cards begin and end at its edges rather
          than inside a gutter. */}
      <div className="section">
        <Reveal>
          <div className="tm-head">
            <span className="eyebrow">04 &#8212; Clients</span>
            <button
              type="button"
              className="tm-toggle pressable"
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? "Play" : "Pause"}
            </button>
          </div>
        </Reveal>
      </div>

      {/* TODO: placeholder quotes — swap for real, attributable reviews. */}
      <Reveal>
        <div
          ref={viewportRef}
          className="tm-viewport"
          data-paused={paused || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* One transform per element: the twist here, the shelf's tilt and
              its edge mask on .tm-stage, the drag offset below that, and the
              drift on .tm-track. */}
          <motion.div
            className="tm-twist"
            style={{
              rotateX: flat ? 0 : twistX,
              rotateY: flat ? 0 : twistY,
              rotateZ: flat ? 0 : twistZ,
            }}
          >
          <div className="tm-stage">
            <div ref={layerRef} className="tm-drag">
              <div ref={trackRef} className="tm-track">
              {track.map(({ testimonial, copy }, i) => (
                <div
                  key={`${copy}-${testimonial.attribution}`}
                  className="tm-slot"
                  data-copy={copy}
                  aria-hidden={copy === 1 || undefined}
                  /* Descending across the whole track, not per copy, so every
                     card overlaps the one after it — including at the seam. */
                  style={{ zIndex: track.length - i }}
                >
                  <TestimonialCard {...testimonial} focusable={copy === 0} />
                </div>
                ))}
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
