"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { BookTrigger } from "./BookDialog";
import { listings, type Listing } from "@/lib/content";

/** Perspective depth. Must match the CSS `perspective` on the viewport. */
const D = 1350;
/**
 * Depth of the card at the front of the ring. Perspective magnifies it by
 * D/(D-FRONT_Z), so this sets how much of the section the front card claims:
 * 1.29x at 300, against 1.42x at 400. The frame height and the drag
 * calibration are both derived from it — do not hard-code either.
 */
const FRONT_Z = 300;
/** Progress per frame. ~10s a card at 60fps — a drift, not a slideshow. */
const SPEED = 0.0016;
/** Gap between the front card and its neighbours, in px. */
const GAP = 40;
/** How far past the container edge a side card's edge is pushed. */
const PEEK = -55;

/**
 * The ring needs enough slots that a card is genuinely off-screen at the wrap
 * point (±slots/2). The reference wraps at ±2.5 with five cards but does not
 * clear the frame until 3.0, so a sliver pops back in on every lap. Three
 * listings would wrap at ±1.5 — mid-screen. Repeating the list to at least six
 * slots puts the seam where nothing is visible; a slot and its duplicate are
 * always a full three steps apart, so the same home is never on screen twice.
 */
function buildRing(source: Listing[]) {
  const repeat = Math.max(1, Math.ceil(6 / source.length));
  return Array.from({ length: source.length * repeat }, (_, i) => source[i % source.length]);
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Magnetic exponent. Shared by the easing and its inverse. */
const MAGNET = 4.2;
/** Momentum decay per frame after a flick. */
const FRICTION = 0.94;
/** Below this the flick is spent and the natural drift takes back over. */
const STILL = 0.0004;
/**
 * Corrects the drag's px-per-index for the fact that z falls as a card
 * travels, which makes the fixed front-card magnification an overestimate.
 * Measured, not derived — re-check it if FRONT_Z or the band z values move.
 */
const CALIBRATION = 0.82;

/**
 * progress -> visual index. Holds near a whole number for most of a cycle,
 * then hands over quickly. This is what gives each card its dwell.
 */
function toActive(p: number) {
  const r = Math.round(p);
  const d = p - r;
  return r + (Math.sign(d) * Math.pow(Math.abs(d) * 2, MAGNET)) / 2;
}

/**
 * The exact inverse, and the reason dragging feels 1:1.
 *
 * The magnet's derivative is 0.00 at a dwell and 4.2 at the midpoint, so a drag
 * applied to `progress` would be dead under the finger and then lurch. Drags
 * and flicks are therefore applied in visual space and converted back here, so
 * the card tracks the pointer while the dwell is preserved for the drift.
 */
function toProgress(a: number) {
  const r = Math.round(a);
  const e = a - r;
  return r + (Math.sign(e) * Math.pow(Math.abs(e) * 2, 1 / MAGNET)) / 2;
}

/** Faces of one card. Rendered twice per slot, front and back. */
function CardFace({ listing, back }: { listing: Listing; back?: boolean }) {
  if (back) {
    return (
      <>
        <div
          aria-hidden
          className="placeholder-slot absolute inset-0 scale-[1.15] blur-[16px]"
        />
        <div aria-hidden className="lc-stripe" />
        <div className="absolute inset-x-0 bottom-0 z-[2] p-[22px]">
          <div className="font-mono text-[11px] tracking-[.16em] text-gold-soft uppercase">
            {listing.city}
          </div>
          <div className="mt-2 font-mono text-[10px] leading-[1.7] tracking-[.1em] text-muted uppercase">
            {listing.street}
          </div>
          <div className="mt-3 flex gap-3 font-mono text-[9.5px] tracking-[.14em] text-label uppercase">
            <span>{listing.beds} bd</span>
            <span className="text-label-dimmest">/</span>
            <span>{listing.baths} ba</span>
            <span className="text-label-dimmest">/</span>
            <span>{listing.sqft} sqft</span>
          </div>
        </div>
      </>
    );
  }

  /* Photo region and detail block are stacked, as in <ListingCard> — anchoring
     the photo's label to a percentage of the whole face put it straight
     through the street line. */
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-[92px] flex-1 overflow-hidden">
        <div aria-hidden className="placeholder-slot absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
          style={{ background: "linear-gradient(to top, rgba(8,7,10,.96) 46%, transparent)" }}
        />
        <span className="absolute top-4 left-4 z-[2] rounded-full bg-[rgba(124,92,196,.9)] px-[13px] py-[6px] font-mono text-[10px] tracking-[.18em] text-white uppercase">
          {listing.tag}
        </span>
        {/* Photography is still outstanding; the slot keeps its label. */}
        <span className="absolute bottom-[14px] left-[18px] z-[2] font-mono text-[10px] tracking-[.14em] text-label uppercase">
          {listing.photoLabel}
        </span>
      </div>

      <div className="relative z-[2] px-[20px] pt-[14px] pb-[20px]">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[21px] text-gold-soft">{listing.city}</h3>
          <div className="text-[17px] text-text">{listing.price}</div>
        </div>
        <div className="mt-[6px] text-[13.5px] leading-[1.45] text-muted">{listing.street}</div>
        <div className="mt-[12px] flex gap-[16px] border-t border-[rgba(255,255,255,.07)] pt-[11px] font-mono text-[10.5px] tracking-[.14em] text-label uppercase">
          <span>{listing.beds} bd</span>
          <span>{listing.baths} ba</span>
          <span>{listing.sqft} sqft</span>
        </div>
        <BookTrigger className="btn-gold mt-[13px] flex w-full cursor-pointer items-center justify-center rounded-xl py-[11px] text-[14px] font-semibold">
          Ask about this home
        </BookTrigger>
      </div>
    </div>
  );
}

/**
 * Listings as a horizontal 3D cylinder.
 *
 * Scroll position plays no part — a continuous `progress` drifts on its own and
 * every frame resolves it to a virtual index, which each slot reads to place
 * itself. All of it is written straight to the DOM in one rAF loop; React
 * renders the cards once and never again.
 */
export function ListingCarousel() {
  const ring = buildRing(listings);
  const slots = ring.length;
  const half = slots / 2;

  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef(0);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const held = useRef(false);
  const drag = useRef({ on: false, lastX: 0, lastT: 0, moved: false });
  const velocity = useRef(0);
  /** Projected px of travel per unit of index, for 1:1 finger tracking. The
   *  front card is magnified by D/(D-FRONT_Z), but z falls as it travels, so
   *  the measured ratio comes in under that; CALIBRATION corrects it. */
  const pxPerUnit = useRef(1);
  /** Last value written for each slot's non-transform styles. See the loop. */
  const lastStyle = useRef<
    { visibility: string; zIndex: string; pointerEvents: string }[]
  >([]);

  const [paused, setPaused] = useState(false);

  /**
   * Entrance and exit twist. The whole ring turns on three axes as the section
   * crosses the viewport — tipped and rolled on the way in, level while it is
   * being read, then turning away as it leaves.
   *
   * Read straight off scroll with no spring: a twist that lags the scroll reads
   * as sluggishness rather than weight, and the flat middle of the ramp is what
   * keeps the ring square while anyone is actually using it.
   */
  const { scrollYProgress } = useScroll({
    target: shellRef,
    offset: ["start end", "end start"],
  });
  const IN = [0, 0.3, 0.44, 0.56, 0.7, 1];
  /* Z is kept small on purpose. The ring is wide, so rolling the stage sweeps
     the outer cards vertically — at 4deg a card 600px out moves ~42px, well
     past the frame's slack, and clipped against its edge. X and Y cost almost
     nothing vertically, so the twist is carried by those. */
  const twistX = useTransform(scrollYProgress, IN, [-14, -4.5, 0, 0, 4.5, 14]);
  const twistY = useTransform(scrollYProgress, IN, [11, 3.5, 0, 0, -3.5, -11]);
  const twistZ = useTransform(scrollYProgress, IN, [-1.4, -0.4, 0, 0, 0.4, 1.4]);
  const [size, setSize] = useState({ w: 300, h: 406, box: 1200 });
  const reduced = useReducedMotion();

  /**
   * Whether there is a real pointer. Two of this component's behaviours are
   * hover gestures wearing pointer-event clothing, and on a touchscreen both
   * of them latched:
   *
   *  - the drift holds while the cursor rests on the ring. A tap fires the
   *    compatibility `mouseenter`, so `held` went true — and nothing ever
   *    fires `mouseleave` for a finger that has lifted, so it stayed true and
   *    the ring never turned again. That is the carousel "not cycling".
   *  - the tilt follows the cursor and releases on `pointerleave`. Touch
   *    `pointermove` fed it, including during an ordinary vertical scroll, and
   *    document `pointerleave` does not fire for touch — so the ring was left
   *    permanently skewed at wherever the last finger was, and lurched under
   *    every scroll on the way there.
   *
   * Neither has a touch equivalent worth building: a finger cannot rest on a
   * card, and drag already gives touch direct control. Resolved after mount —
   * the server has no matchMedia — so the first client render still matches.
   */
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Card size follows the container, not the window — the section is capped at
     1400px, so viewport-relative sizing would push cards outside it. */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const box = el.clientWidth;
      /* A narrow container fits fewer cards anyway, so the front card takes a
         larger share of it rather than shrinking to a thumbnail — but the
         floor drops on phones, or a 252px card fills the whole width and the
         neighbours never reach the edge to peek. */
      const floor = box < 430 ? 196 : 252;
      /* Height matters as much as width: the front card is magnified 1.42x by
         perspective, so a full-size ring plus the heading overruns a short
         viewport. Scaling the card down on short screens keeps the whole
         section on screen at once. */
      const hf = Math.min(1, Math.max(0.62, window.innerHeight / 900));
      /* The floor is applied last so the height factor cannot shrink a card
         below what its CTA and spec row need to stay legible. */
      const w = Math.round(Math.max(floor, Math.min(334, box * 0.3) * hf));
      /* Taller proportions on a narrow card. The detail block has a fixed
         appetite — two lines of street, the spec row and the CTA — so at a 0.7
         ratio it squeezed the photo region below what its tag and label need
         and they collided. */
      setSize({ w, h: Math.round(w / (box < 430 ? 0.58 : 0.7)), box });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // The observer only sees the element; card size also tracks viewport height.
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (reduced || !fine) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = Math.max(-1, Math.min(1, (e.clientX - innerWidth / 2) / (innerWidth / 2)));
      pointer.current.ty = Math.max(-1, Math.min(1, (e.clientY - innerHeight / 2) / (innerHeight / 2)));
    };
    const onLeave = () => {
      pointer.current.tx = 0;
      pointer.current.ty = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      // Leaving a stale tilt behind would freeze the ring mid-lean if the
      // pointer capability changes under us.
      pointer.current = { x: 0, y: 0, tx: 0, ty: 0 };
    };
  }, [reduced, fine]);

  useEffect(() => {
    if (reduced) return;
    const { w: cardW, box } = size;
    pxPerUnit.current = (cardW + GAP) * (D / (D - FRONT_Z)) * CALIBRATION;
    lastStyle.current = Array.from({ length: slots }, () => ({
      visibility: "",
      zIndex: "",
      pointerEvents: "",
    }));

    const tick = () => {
      frame.current = requestAnimationFrame(tick);

      /* Three ways the ring can move, in priority order: the pointer owns it
         outright while dragging, a flick coasts to a stop, and otherwise the
         natural drift resumes. Momentum ignores `held` so a flick still lands
         when the cursor is resting over the carousel. */
      if (!drag.current.on) {
        if (Math.abs(velocity.current) > STILL) {
          progress.current = toProgress(toActive(progress.current) + velocity.current);
          velocity.current *= FRICTION;
        } else {
          velocity.current = 0;
          if (!held.current) progress.current += SPEED;
        }
      }
      // Tilt keeps tracking while the drift is held, so a paused carousel is
      // still alive under the cursor.
      pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.08;
      pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.08;

      /* Magnetic step. Raising the fractional part to a power and halving it
         holds the index near a whole number for most of the cycle, then hands
         over quickly — the dwell is what makes each card read as arrived
         rather than passing through. */
      const active = toActive(progress.current);

      for (let i = 0; i < slots; i += 1) {
        const card = cardRefs.current[i];
        if (!card) continue;

        let offset = i - active;
        while (offset > half) offset -= slots;
        while (offset < -half) offset += slots;

        const abs = Math.abs(offset);
        const sign = Math.sign(offset);

        /* Only write what changed. `visibility`, `zIndex` and `pointerEvents`
           each invalidate style when assigned, even to the value already
           there, and three of those across every slot on every frame is a
           recalc the ring does not need — the transform is the only one of the
           four that genuinely differs frame to frame. */
        const last = lastStyle.current[i];

        if (abs > 3) {
          if (last.visibility !== "hidden") {
            card.style.visibility = "hidden";
            last.visibility = "hidden";
          }
          continue;
        }
        if (last.visibility !== "visible") {
          card.style.visibility = "visible";
          last.visibility = "visible";
        }

        let x = 0;
        let z = 0;
        let rot = 0;

        if (abs <= 1) {
          const t = smoothstep(abs);
          x = t * (cardW + GAP);
          z = FRONT_Z + t * (220 - FRONT_Z);
          rot = t * 132;
        } else if (abs <= 2) {
          const t = smoothstep(abs - 1);
          const zEnd = -60;
          /* Solve for the position whose *projected* edge lands on the
             container boundary at that depth. Interpolating raw px instead
             would misalign every card, since each sits at a different z. */
          const s = D / (D - zEnd);
          const xEnd = (box / 2 - PEEK) / s - cardW / 2;
          x = cardW + GAP + t * (xEnd - (cardW + GAP));
          z = 220 + t * (zEnd - 220);
          rot = 132 + t * (175 - 132);
        } else {
          const t = smoothstep(Math.min(abs - 2, 1));
          const zA = -60;
          const zB = -250;
          const xA = (box / 2 - PEEK) / (D / (D - zA)) - cardW / 2;
          const xB = (box / 2 + 120) / (D / (D - zB)) + cardW / 2;
          x = xA + t * (xB - xA);
          z = zA + t * (zB - zA);
          rot = 175 + t * (195 - 175);
        }

        const centre = Math.max(0, 1 - abs);
        const tiltY = pointer.current.x * 15 * centre;
        const tiltX = -pointer.current.y * 12 * centre;

        const zIndex = String(Math.round(z));
        if (last.zIndex !== zIndex) {
          card.style.zIndex = zIndex;
          last.zIndex = zIndex;
        }
        // Only the card at the front takes the pointer — the CTA must not be a
        // moving target, and a half-turned card should not swallow clicks.
        const events = centre > 0.85 ? "auto" : "none";
        if (last.pointerEvents !== events) {
          card.style.pointerEvents = events;
          last.pointerEvents = events;
        }
        card.style.transform =
          `translateX(${(-sign * x).toFixed(2)}px) translateZ(${z.toFixed(2)}px) ` +
          `rotateY(${(-sign * rot + tiltY).toFixed(2)}deg) ` +
          `rotateX(${tiltX.toFixed(2)}deg) rotateZ(-3deg)`;

      }
    };

    /**
     * Turn the ring only while it is on screen.
     *
     * This loop used to run for the life of the page: six cards, each a
     * `preserve-3d` stack of five layers, re-transformed every frame from the
     * hero all the way down to the footer. Nothing about the ring depends on
     * scroll, so there was no reason to notice — but the cost was charged to
     * every other section's frame budget, and on a phone that is most of why
     * the page felt heavy everywhere rather than just here.
     *
     * `progress` lives in a ref, so the ring picks up exactly where it stopped
     * rather than snapping. A hidden tab gets the same treatment: rAF is
     * already throttled there, but the drift would otherwise bank up time it
     * then has to spend.
     */
    const start = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };

    let onScreen = false;
    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    const shell = shellRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        // The frame's shadows and the twist both reach past the section.
        shell?.toggleAttribute("data-lc-live", onScreen);
        sync();
      },
      { rootMargin: "150px 0px" },
    );
    if (shell) io.observe(shell);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      shell?.removeAttribute("data-lc-live");
      stop();
    };
  }, [size, slots, half, reduced]);

  const hold = (on: boolean) => {
    held.current = on || paused;
  };
  /** Hover hold, for pointers that can actually hover. See `fine`. */
  const hoverHold = (on: boolean) => {
    if (fine) hold(on);
  };

  /** Distance in px before a press counts as a drag rather than a tap. */
  const SLOP = 4;

  const onPointerDown = (e: React.PointerEvent) => {
    if (reduced) return;
    // The Pause control is inside the viewport and is not a drag handle.
    if ((e.target as HTMLElement).closest("[data-lc-toggle]")) return;
    drag.current = { on: true, lastX: e.clientX, lastT: e.timeStamp, moved: false };
    velocity.current = 0;
    /* Capture is an optimisation, not a requirement — the drag reads clientX
       either way. It throws when the pointer is already gone by the time the
       handler runs, which a finger can manage and a mouse cannot, and an
       uncaught throw here left `drag.on` true with no path back: the ring
       stopped for good, looking exactly like the hover latch above. */
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* Without capture the window listeners below are what end the drag. */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    const dx = e.clientX - drag.current.lastX;
    if (!drag.current.moved && Math.abs(dx) > SLOP) drag.current.moved = true;

    /* Applied in visual space, then converted back — see toProgress().
       The magnet is not the only easing in the way: the band interpolation is
       a smoothstep, whose derivative is also 0 at a dwell and 1.5 at the
       midpoint. Dividing by it locally linearises the travel so the card
       tracks the pointer; the clamp leaves a light detent right at the dwell
       instead of an infinite gain. */
    const a = toActive(progress.current);
    const t = Math.abs(a - Math.round(a));
    const gain = 1 / Math.min(1.5, Math.max(0.42, 6 * t * (1 - t)));
    const step = (dx / pxPerUnit.current) * gain;
    progress.current = toProgress(toActive(progress.current) + step);

    // Normalised to a 60fps frame so a flick reads the same on any display.
    const dt = Math.max(1, e.timeStamp - drag.current.lastT);
    const instant = step * (16.67 / dt);
    velocity.current = velocity.current * 0.7 + instant * 0.3;
    drag.current.lastX = e.clientX;
    drag.current.lastT = e.timeStamp;
  };

  /** Finish a drag. Shared by the element handlers and the window net below. */
  const settleDrag = () => {
    if (!drag.current.on) return;
    drag.current.on = false;
    // Cap the throw, or a hard flick spins the ring for seconds.
    velocity.current = Math.max(-0.12, Math.min(0.12, velocity.current));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    settleDrag();
  };

  /**
   * The net for a release the element never hears about.
   *
   * With pointer capture the element gets its own `pointerup` wherever the
   * finger lifts, so this is dead weight — but capture is exactly what is
   * missing in the case that needs it, and a drag left `on` freezes the ring
   * permanently rather than degrading. `pointercancel` is the common one on
   * touch: the browser fires it and nothing else when it takes the gesture
   * over for a scroll or a second finger arrives.
   */
  useEffect(() => {
    if (reduced) return;
    window.addEventListener("pointerup", settleDrag);
    window.addEventListener("pointercancel", settleDrag);
    return () => {
      window.removeEventListener("pointerup", settleDrag);
      window.removeEventListener("pointercancel", settleDrag);
    };
  });

  /** A flick that coasts almost exactly one card: v / (1 - FRICTION). */
  const step = (dir: number) => {
    velocity.current = dir * (1 - FRICTION);
  };

  /* Perspective magnifies the front card by D/(D-FRONT_Z). Sizing the frame
     from the card's layout height clipped the CTA off the bottom; this is the
     height it actually paints at, plus room for the -3deg roll, the pointer
     tilt, and the frame's vertical fade — that fade has to clear the closest
     card at every point of the twist, and the tightest measured before this
     was 2px. */
  const frameH = Math.round(size.h * (D / (D - FRONT_Z)) + 100);

  return (
    <div ref={shellRef} className="lc-shell" style={{ height: frameH }}>
      {/* Clipping and the edge fade live here, outside the perspective element,
          so neither can flatten the 3D context inside it. */}
      <div className="lc-frame">
        <div
          ref={viewportRef}
          className="lc-viewport"
          role="group"
          aria-roledescription="carousel"
          aria-label="Featured listings. Drag, or use the left and right arrow keys."
          tabIndex={0}
          onMouseEnter={() => hoverHold(true)}
          onMouseLeave={() => hoverHold(false)}
          onFocusCapture={() => hold(true)}
          onBlurCapture={() => hold(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          /* A drag that ends on the CTA must not also fire it. */
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            step(e.key === "ArrowLeft" ? -1 : 1);
          }}
        >
          <motion.div
            className="lc-stage"
            style={{
              width: size.w,
              height: size.h,
              rotateX: reduced ? 0 : twistX,
              rotateY: reduced ? 0 : twistY,
              rotateZ: reduced ? 0 : twistZ,
            }}
          >
            {ring.map((listing, i) => (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="lc-card"
                style={{ width: size.w, height: size.h }}
              >
                {/* Volumetric thickness: two content faces with structural
                    slices between them, so the card has a real edge as it
                    turns. */}
                <div className="lc-slice" style={{ transform: "translateZ(-0.73px)" }} />
                <div className="lc-slice" style={{ transform: "translateZ(0px)" }} />
                <div className="lc-slice" style={{ transform: "translateZ(0.73px)" }} />

                <div className="lc-face" style={{ transform: "translateZ(1.47px)" }}>
                  <CardFace listing={listing} />
                </div>
                <div
                  className="lc-face"
                  style={{ transform: "translateZ(-1.47px) rotateY(180deg)" }}
                >
                  <CardFace listing={listing} back />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Outside the frame, so the edge fade cannot dim the control. */}
      <button
        type="button"
        className="lc-toggle tm-toggle pressable"
        data-lc-toggle
        aria-pressed={paused}
        onClick={() => {
          const next = !paused;
          setPaused(next);
          held.current = next;
          /* Stopping mid-turn leaves no home facing the reader, so pausing
             steers to the nearest dwell instead of freezing where it stands.
             Momentum sums to v / (1 - FRICTION), so this coasts exactly the
             remaining distance and stops there. */
          if (next) {
            const a = toActive(progress.current);
            velocity.current = (Math.round(a) - a) * (1 - FRICTION);
          }
        }}
      >
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
