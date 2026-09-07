"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { Reveal } from "./Reveal";
import { processSteps } from "@/lib/content";

const N = processSteps.length;

/**
 * Scroll progress -> continuous step index, with a dwell on each step.
 *
 * A straight 0..1 -> 0..N-1 map never rests: the column would drift the whole
 * way down the track and no step would ever read as "the current one". These
 * pairs hold the index at a whole number for most of each screen, then hand
 * over across the middle of the next.
 */
const DWELL_IN = [0, 0.12, 0.28, 0.42, 0.58, 0.72, 0.88, 1];
const DWELL_OUT = [0, 0, 1, 1, 2, 2, 3, 3];

/**
 * Where each step sits in tour.mp4 — the beat the camera settles on while that
 * step holds. Between them the index interpolates, so the walk from the drive
 * to the front door, or from the island out to the pool, plays under the
 * handover rather than cutting.
 *
 * 0.20 front elevation at dusk · 3.70 living room, fireplace lit
 * 6.30 kitchen island · 9.85 pool, the last frame of the tour
 */
const STEP_TIMES = [0.2, 3.7, 6.3, 9.85];

/**
 * One numeral in the column. The outline is always drawn; the solid fill
 * cross-fades in as the index arrives, so mid-transition both are partly
 * visible and the handover reads as one glyph resolving rather than two
 * swapping.
 */
function Numeral({ i, index }: { i: number; index: MotionValue<number> }) {
  const distance = useTransform(index, (v) => Math.abs(v - i));
  const fill = useTransform(distance, [0, 0.85], [1, 0]);
  const scale = useTransform(distance, [0, 1.6], [1, 0.58]);
  const opacity = useTransform(distance, [0, 1, 2.4], [1, 0.34, 0.06]);
  const label = String(i + 1).padStart(2, "0");

  return (
    <motion.div className="ps-num" style={{ scale, opacity }} aria-hidden>
      {/* The two glyphs share this wrapper so the fill tracks the outline
          wherever the parent's alignment puts it. Pinning the fill to an edge
          instead split them apart the moment the numerals aligned left. */}
      <span className="ps-num-glyph">
        <span className="ps-num-outline">{label}</span>
        <motion.span className="ps-num-fill" style={{ opacity: fill }}>
          {label}
        </motion.span>
      </span>
    </motion.div>
  );
}

/**
 * Step title and body. These ride a clipped column exactly like the numerals,
 * and for the same reason: four blocks sharing one slot cannot be cross-faded
 * in place. Fading them at equal opacity interleaved two titles into
 * unreadable mush; fading them sequentially left a beat with no copy at all;
 * offsetting them by a few px was not enough separation for blocks this tall.
 *
 * Clipping makes the overlap structurally impossible, and it puts the copy on
 * the same transport as the numerals — both columns travel one slot per step,
 * off the same value, so the panel reads as one mechanism.
 */
function StepCopy({
  i,
  index,
  step,
}: {
  i: number;
  index: MotionValue<number>;
  step: (typeof processSteps)[number];
}) {
  const distance = useTransform(index, (v) => Math.abs(v - i));
  const opacity = useTransform(distance, [0, 0.72], [1, 0]);

  return (
    <motion.div className="ps-copy-item" style={{ opacity }} aria-hidden={i !== 0}>
      <h3 className="ps-title">{step.title}</h3>
      <p className="ps-body">{step.body}</p>
    </motion.div>
  );
}

function Dot({ i, index }: { i: number; index: MotionValue<number> }) {
  const distance = useTransform(index, (v) => Math.abs(v - i));
  const opacity = useTransform(distance, [0, 1], [1, 0]);
  const scaleY = useTransform(distance, [0, 1], [1, 0.28]);
  return (
    <span className="ps-dot">
      <motion.span className="ps-dot-fill" style={{ opacity, scaleY }} />
    </span>
  );
}

/**
 * The four steps as a pinned scroll sequence: the track is N screens tall, the
 * panel sticks for the whole of it, and scroll position drives one index that
 * the numeral column, the copy and the dots all read from.
 *
 * Under prefers-reduced-motion this collapses to the static grid it replaced —
 * pinning hijacks the scroll, which is exactly what that setting asks us not
 * to do, and the steps have to stay readable without it.
 */
export function Process() {
  const trackRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  /**
   * Two clocks off one scroll position, which is what makes this feel locked
   * to the pointer instead of floating behind it.
   *
   * `index` is raw: the numerals, copy and dots read scroll with no smoothing,
   * so they are nailed to the gesture. Running them through the spring instead
   * measured ~190ms of lag, enough that the numeral could read 03 while the
   * footage was still in the living room.
   *
   * `videoIndex` is the only smoothed one, and lightly — the ease is there to
   * absorb the quantisation of wheel and trackpad deltas, not to add weight.
   * Damping ratio is ~1.06, just past critical, so it settles in about 180ms
   * without overshooting; overshoot here would run the tour backwards past the
   * target and correct, which reads as a stutter.
   */
  const index = useTransform(scrollYProgress, DWELL_IN, DWELL_OUT);
  const videoIndex = useSpring(index, { stiffness: 180, damping: 18, mass: 0.4 });
  const columnY = useTransform(index, (v) => `${(-v * 100) / N}%`);
  const videoTime = useTransform(videoIndex, [0, 1, 2, 3], STEP_TIMES);

  /**
   * Scrub the tour. The video is never played — scroll position is its
   * transport.
   *
   * A rAF loop rather than a subscription to `videoTime`: a motion value can
   * fire several times between paints, and every one of those would be a seek
   * the decoder services and then throws away.
   *
   * tour.mp4 is encoded all-intra for this, which is what keeps a seek at
   * 3-7ms instead of the 60-260ms a single-keyframe GOP costs. That is also
   * why there is no WebCodecs frame bank here: decoding the clip up front
   * solves a problem we do not have once the asset is encoded correctly.
   */
  useEffect(() => {
    if (reduced) return;
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const video = videoRef.current;
      if (!video) return;

      // A seek already in flight: issuing another cancels its work and starts
      // over. Under a fast drag that is a queue of discarded decodes.
      if (video.seeking) return;

      const target = videoTime.get();
      if (Math.abs(video.currentTime - target) <= 1 / 48) return;

      // Metadata is the floor for assigning `currentTime` at all.
      if (video.readyState < 1) return;

      /**
       * Seek whether or not the target is already buffered.
       *
       * There used to be a guard here that only assigned `currentTime` when
       * the target fell inside a buffered range, on the reasoning that seeking
       * into a gap stalls. It is the same deadlock the zero-range case above it
       * was written to escape, and it was only ever escaped for zero ranges:
       * assigning `currentTime` is what makes the browser fetch, so a target
       * outside every range was never requested, the range never grew, and the
       * next frame made the identical decision. The tour held its first frame
       * for the whole track.
       *
       * That is the normal case on a phone, which is why this only ever showed
       * up there. `preload="auto"` is advisory — iOS and Android both downgrade
       * it on cellular and hold one short range near zero, so every step past
       * the first sat in a gap and the guard rejected all of them.
       *
       * Seeking into a gap costs a stall until the range arrives. Never seeking
       * costs the whole feature. `video.seeking` above already keeps this to
       * one request in flight, so the stall resolves on the frame the data
       * lands rather than queueing decodes behind it.
       */
      video.currentTime = target;
    };

    /**
     * Land on the right frame rather than travelling to it. Without this a
     * reload deep in the track starts the spring at zero and plays the whole
     * tour on the way to where the reader already is.
     */
    const settle = () => {
      videoIndex.jump(index.get());
      const video = videoRef.current;
      if (video && video.readyState >= 1) video.currentTime = videoTime.get();
    };

    const video = videoRef.current;
    video?.addEventListener("loadedmetadata", settle);
    settle();

    /**
     * Only scrub while the track is on screen.
     *
     * The loop used to run for the life of the page, polling a spring and
     * comparing `currentTime` on every frame of every other section — a video
     * decoder kept warm behind eight screens of content that never look at it.
     * On a phone that is a measurable share of the frame budget the rest of the
     * page is trying to spend, and it is the same tax the listings ring was
     * paying; both are why scrolling anywhere felt heavy.
     *
     * The track is four screens tall, so `rootMargin` only has to cover the
     * approach. `settle()` on entry lands the right frame rather than letting
     * the spring travel to it from wherever it was parked.
     */
    const start = () => {
      if (frame) return;
      settle();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
        else stop();
      },
      { rootMargin: "200px 0px" },
    );
    if (trackRef.current) io.observe(trackRef.current);

    return () => {
      io.disconnect();
      stop();
      video?.removeEventListener("loadedmetadata", settle);
    };
  }, [videoTime, videoIndex, index, reduced]);

  /**
   * Wake the element up before anything tries to scrub it.
   *
   * iOS will not decode or paint a frame for a `<video>` that has never been
   * played, however much data it holds — scrubbing `currentTime` on a
   * never-played element leaves the panel black, which is exactly what the
   * tour did on a phone while working everywhere else. A muted, `playsInline`
   * video is allowed to autoplay, so start it and stop it again: the play is
   * what makes iOS fetch and render, and the rAF loop puts the frame right on
   * its next pass.
   *
   * Autoplay can still be refused — Low Power Mode blocks even muted video —
   * so the same nudge is retried on the first real interaction and then
   * dropped.
   */
  useEffect(() => {
    if (reduced) return;
    let woken = false;

    const wake = () => {
      const video = videoRef.current;
      if (woken || !video) return;
      const started = video.play();
      if (started && typeof started.then === "function") {
        started
          .then(() => {
            video.pause();
            woken = true;
            detach();
          })
          .catch(() => {
            /* Refused: leave the listeners in place for a gesture. */
          });
      } else {
        video.pause();
        woken = true;
        detach();
      }
    };

    const detach = () => {
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("pointerdown", wake);
    };

    wake();
    window.addEventListener("touchstart", wake, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    return detach;
  }, [reduced]);

  /** Rounded step for the rail counter. Changes four times, so the re-render
   *  cost is four renders across the whole track, not one per frame. */
  const current = useTransform(index, (v) => Math.round(v) + 1);
  const [step, setStep] = useState(1);
  useMotionValueEvent(current, "change", (v) => setStep(v));

  const heading = (
    <div className="max-w-[640px]">
      <span className="eyebrow">03 &#8212; How it works</span>
      <h2 className="font-display text-[clamp(34px,3.6vw,52px)] tracking-[-.01em] text-text-strong">
        Four steps from first call to keys
      </h2>
    </div>
  );

  if (reduced) {
    return (
      <section id="process" className="section">
        <Reveal>
          <div className="mb-12">{heading}</div>
        </Reveal>
        <ol className="grid grid-cols-4 gap-[22px] max-wide:grid-cols-2 max-mobile:grid-cols-1">
          {processSteps.map((step, i) => (
            <Reveal key={step.title} index={i}>
              <li className="card-flat h-full rounded-[18px] border border-hairline px-[26px] pt-[30px] pb-[34px]">
                <div className="mb-5 font-display text-[38px] leading-none text-[rgba(233,200,119,.35)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-[10px] font-display text-[20px] text-gold-soft">{step.title}</h3>
                <p className="text-[14.5px] leading-[1.65] text-muted">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section id="process" ref={trackRef} className="ps-track" style={{ height: `${N * 100}vh` }}>
      {/* Carries the sky band's lower edge across the seam and dissolves it
          into the footage. See .ps-seam in globals.css. */}
      <div className="ps-seam" aria-hidden />

      {/* Dissolves the tour into the band that follows, so the track does not
          end on lit footage against the band's opaque top edge.
          See .ps-tail in globals.css. */}
      <div className="ps-tail" aria-hidden />

      <div className="ps-pin">
        <div className="ps-media" aria-hidden>
          <video
            ref={videoRef}
            className="ps-video"
            src="/assets/tour.mp4"
            poster="/assets/tour-poster.jpg"
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
          />
          <div className="ps-scrim" />
        </div>

        <div className="ps-inner">
          <div className="ps-head">{heading}</div>

          <div className="ps-panel">
            <div className="ps-rail" aria-hidden>
              <div className="ps-dots">
                {processSteps.map((s, i) => (
                  <Dot key={s.title} i={i} index={index} />
                ))}
              </div>
              <p className="ps-count">
                <span className="ps-count-now">{String(step).padStart(2, "0")}</span>
                <span className="ps-count-sep">/</span>
                {String(N).padStart(2, "0")}
              </p>
            </div>

            <div className="ps-copy">
              <motion.div className="ps-copy-col" style={{ y: columnY }}>
                {processSteps.map((s, i) => (
                  <StepCopy key={s.title} i={i} index={index} step={s} />
                ))}
              </motion.div>
            </div>

            <div className="ps-stage" aria-hidden>
              <motion.div className="ps-column" style={{ y: columnY }}>
                {processSteps.map((step, i) => (
                  <Numeral key={step.title} i={i} index={index} />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* The animated copy above is aria-hidden past the first step, since it
          is one slot showing four things. This is the whole list, for anyone
          reading the page rather than scrolling it. */}
      <ol className="sr-only">
        {processSteps.map((step) => (
          <li key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
