"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

import {
  SCENE_W,
  skylinePath,
  FRONT_HOUSES,
  FRONT_CHIMNEYS,
  FRONT_TREES,
  FRONT_CYPRESS,
  MID_HILLS,
  FAR_HILLS,
} from "@/lib/skyline";

/**
 * Layered dusk scene: sky, warm horizon band, far ridge, mid hills, then a
 * foreground roofline. Each layer translates at a different rate as the section
 * scrolls, so content placed between them passes behind the roofline.
 *
 * Two things carry the effect and are easy to break:
 *  - Depth reads only if the rates stay ordered: the sky lags furthest
 *    (largest positive y), the foreground leads (negative y).
 *  - Against the drawn sky the hills are near-black and only register as
 *    silhouettes because the sky sits well above them tonally. Darkening the
 *    sky flattens the whole scene, and lightening those ridges inverts it.
 *    The hero is the exception and has its own pair (`dh-far-lit`,
 *    `dh-mid-lit`): it substitutes footage for the drawn sky, and footage is
 *    darker than #43354f, so silhouette values collapse into a single muddy
 *    mass there. Read the ridges against whichever backdrop they actually sit
 *    on — the two are not interchangeable.
 */

/**
 * How far the foreground row leads the page. It is anchored this same distance
 * below the scene floor, so at full lift its ground line lands exactly flush —
 * a larger lead would peel the houses off the floor and open a band above the
 * marquee.
 */
const FRONT_LEAD = 12;

function useLayers(targetRef: React.RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  /**
   * Pixels, not percentages: a percentage resolves against each layer's own
   * height, so layers of different heights could not be ordered against one
   * another. In pixels the depth is explicit — the backdrop lags furthest, each
   * ridge lags less than the one behind it, and the houses lead.
   *
   * Ordering (slowest to fastest): clip, light ridge, dark ridge, houses.
   */
  const sky = useTransform(scrollYProgress, [0, 1], [0, 210]);
  const far = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const mid = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const front = useTransform(scrollYProgress, [0, 1], [0, -FRONT_LEAD]);
  const glow = useTransform(scrollYProgress, [0, 1], [0, 70]);

  if (reduced) {
    return { sky: 0, far: 0, mid: 0, front: 0, glow: 0 } as const;
  }
  return { sky, far, mid, front, glow } as const;
}

function SceneDefs() {
  return (
    <defs>
      <linearGradient id="dh-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b3352" />
        <stop offset="100%" stopColor="#2a2440" />
      </linearGradient>
      <linearGradient id="dh-mid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1b1630" />
        <stop offset="100%" stopColor="#100c1d" />
      </linearGradient>
      <linearGradient id="dh-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#120d13" />
        <stop offset="100%" stopColor="#08060a" />
      </linearGradient>

      {/* The same two ridges, lit for the hero.
       *
       * The ridges above are sized to be read against the *drawn* sky, which
       * bottoms out at #43354f — `dh-far` opens at #3b3352 precisely so it
       * falls just under it and reads as a silhouette. That margin is the
       * whole effect in the closing CTA, and lightening these would invert it.
       *
       * The hero has no drawn sky. Its ridges sit over dusk footage that is
       * far darker than #43354f, so the same values that read as silhouettes
       * against the sky collapsed into one muddy mass against the clip —
       * ridge, ridge and roofline all near-black with nothing between them.
       * These are the same hues carrying more light, which is what the footage
       * leaves room for. Ordering is preserved and is what has to stay true:
       * far sits above mid, mid above the #120d13 roofline.
       *
       * The hero's proof labels (--color-muted-3) run through this band, so
       * the lift is bounded by them, not by taste: far measures 6.03 and mid
       * 8.39 against #c3bbd4, both clear of AA. A further step (#564a7d /
       * #332a54) still measured 5.43 but put the far ridge level with the sky
       * above it, which flattened the depth it exists to create.
       */}
      <linearGradient id="dh-far-lit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4d4370" />
        <stop offset="100%" stopColor="#382f57" />
      </linearGradient>
      <linearGradient id="dh-mid-lit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2b2247" />
        <stop offset="100%" stopColor="#1c1633" />
      </linearGradient>
    </defs>
  );
}

/**
 * Foreground roofline: houses, chimneys, trees, with a gold dusk rim-light.
 *
 * `slice` narrows the viewBox onto part of the same artwork, which scales the
 * houses up — that is how the nearer row is made to read as closer rather than
 * drawing a second set of geometry.
 */
function Roofline({
  fill,
  slice = `0 0 ${SCENE_W} 200`,
  paint = "dh-front",
  rim = 0.34,
}: {
  fill?: string;
  slice?: string;
  paint?: string;
  rim?: number;
}) {
  const path = skylinePath(FRONT_HOUSES, { streetY: 176, groundY: 200 });
  return (
    <svg
      viewBox={slice}
      preserveAspectRatio="xMidYMax slice"
      className={`absolute inset-x-0 bottom-0 w-full ${fill ?? "h-[240px] max-mobile:h-[150px]"}`}
      aria-hidden
    >
      <SceneDefs />
      <g fill={`url(#${paint})`}>
        <path d={path} />
        {FRONT_CHIMNEYS.map((c, i) => (
          <rect key={`c${i}`} x={c.x} y={c.y} width={c.w} height={c.h} />
        ))}
        {FRONT_TREES.map((t, i) => (
          <g key={`t${i}`}>
            <ellipse cx={t.x} cy={t.y} rx={t.r} ry={t.r * 1.15} />
            <rect x={t.x - 2.5} y={t.y} width="5" height={190 - t.y} />
          </g>
        ))}
        {FRONT_CYPRESS.map((c, i) => (
          <ellipse key={`p${i}`} cx={c.x} cy={c.y + c.h / 2} rx={c.w / 2} ry={c.h / 2} />
        ))}
      </g>
      {rim > 0 && (
        <path
          d={path}
          fill="none"
          stroke="#c9a227"
          strokeOpacity={rim}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

function Hills({ d, fill, className }: { d: string; fill: string; className: string }) {
  return (
    <svg viewBox={`0 0 ${SCENE_W} 200`} preserveAspectRatio="none" className={className} aria-hidden>
      <SceneDefs />
      <path d={d} fill={fill} />
    </svg>
  );
}

/**
 * Scroll-linked drift for a single element, measured against its own position
 * in the viewport. Used to float the hero card independently of the copy.
 */
export function Parallax({
  children,
  distance = 48,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} style={reduced ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Wraps a section in the scene. Children render above the hills and below the
 * roofline, which is what produces the occlusion.
 */
export function Scene({
  children,
  className = "",
  layout = "bottom",
  media,
}: {
  children: ReactNode;
  className?: string;
  /**
   * Footage to stand in for the drawn sky and hills. The foreground roofline
   * The scrim is shaped the way the calculator's and the process section's are:
   * held over the copy, released where there is none. Copy runs from 16% to
   * 78% of the height, so it holds ~0.74 across that and opens to 0.34 above
   * it — the band over the footage that carries no type. Measured across four
   * frames of the clip: h1 8.8, lede 6.3, badge 5.0, proof name 8.0, proof
   * labels 5.2, with the top band 3.5x brighter than before.
   * still renders on top, so the parallax occlusion survives; a scrim keeps the
   * copy legible over the clip's bright dusk sky.
   */
  media?: ReactNode;
  /**
   * "viewport" puts the horizon inside the first screen and lets content run on
   * past it into the dark page — the hero composition. "bottom" sits the
   * landscape at the foot of the section, for the closing CTA.
   */
  layout?: "bottom" | "viewport";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { sky, far, mid, front, glow } = useLayers(ref);
  const vp = layout === "viewport";
  const hasMedia = Boolean(media);

  // Horizon lands ~62vh down; the roofline crosses at ~76vh and dissolves into
  // the page background below ~94vh.
  const at = (top: string, height: string) =>
    vp ? { top, height, bottom: "auto" as const } : undefined;

  return (
    <div ref={ref} className={`relative isolate overflow-hidden ${className}`}>
      {hasMedia ? (
        <>
          <motion.div
            aria-hidden
            style={{ y: sky, top: "-15vh", bottom: 0 }}
            className="pointer-events-none absolute inset-x-0 -z-50"
          >
            {media}
          </motion.div>
          {/* Scrim. Shaped to measured need, not taste: the clip's lit house
              sits behind the lead and proof bar, which need >=0.58 and >=0.70
              alpha respectively to clear AA. It eases at 76% so the driveway
              and headlights still read before the roofline takes over. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-40 bg-[linear-gradient(180deg,rgba(8,7,10,.34)_0%,rgba(8,7,10,.62)_13%,rgba(8,7,10,.74)_20%,rgba(8,7,10,.74)_62%,rgba(8,7,10,.78)_72%,rgba(8,7,10,.6)_80%,rgba(8,7,10,.74)_90%,#08070a_100%)]"
          />

          {/* The ridges still run in front of the footage — they are what make
              the clip sit back as a backdrop rather than read as flat video. */}
          <motion.div
            aria-hidden
            style={{ y: far, bottom: "6vh", height: "30vh" }}
            className="pointer-events-none absolute inset-x-0 -z-30"
          >
            <Hills d={FAR_HILLS} fill="url(#dh-far-lit)" className="h-full w-full opacity-90" />
          </motion.div>

          <motion.div
            aria-hidden
            style={{ y: mid, bottom: "-2vh", height: "32vh" }}
            className="pointer-events-none absolute inset-x-0 -z-20"
          >
            <Hills d={MID_HILLS} fill="url(#dh-mid-lit)" className="h-full w-full" />
          </motion.div>
        </>
      ) : (
        <>
      {/* Sky — luminous, so the near-black ridges read against it. */}
      <motion.div
        aria-hidden
        style={{ y: sky, ...(vp ? { top: 0, height: "112vh" } : {}) }}
        className={`pointer-events-none absolute -z-50 ${vp ? "inset-x-0" : "inset-0"}`}
      >
        {/* Opens on the page's own black rather than straight into #211d36.
            The band above closes to solid #08070a, so starting the sky at its
            lit value cut a step exactly at the handover — and the 110px of bare
            page that used to sit between them let the fixed gold orb flash
            through in the gap, since the band's opaque foot covers it and this
            scene's sky covers it again. The scene now owns that run (margin
            became padding in <BookCta>) and rises out of the same black. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#08070a_0%,#171327_7%,#211d36_16%,#2a2342_40%,#372c4c_66%,#43354f_100%)]" />
      </motion.div>

      {/* Warm dusk band + sun glow. The bright zone peaks near the top of the
          band, at the horizon — pushing it lower lights the ground behind the
          foreground and reads as a stray strip between the houses. */}
      <motion.div
        aria-hidden
        style={{ y: glow, ...(at("55vh", "52vh") ?? {}) }}
        className={`pointer-events-none absolute inset-x-0 -z-40 ${vp ? "" : "bottom-0 h-[520px] max-mobile:h-[330px]"}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(120,86,74,.3)_20%,rgba(180,130,84,.6)_32%,rgba(120,84,70,.5)_50%,rgba(45,32,38,.45)_70%,rgba(8,7,10,.8)_100%)]" />
        <div className="absolute right-[24%] top-[16%] h-[210px] w-[620px] translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,240,206,.15),rgba(247,231,180,.075)_38%,rgba(201,162,39,.035)_62%,transparent_76%)] blur-[22px] max-mobile:h-[150px] max-mobile:w-[360px]" />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ y: far, ...(at("68vh", "25vh") ?? {}) }}
        className={`pointer-events-none absolute inset-x-0 -z-30 ${vp ? "" : "bottom-0"}`}
      >
        <Hills
          d={FAR_HILLS}
          fill="url(#dh-far)"
          className={`w-full opacity-80 ${vp ? "h-full" : "h-[330px] max-mobile:h-[200px]"}`}
        />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ y: mid, ...(at("75vh", "30vh") ?? {}) }}
        className={`pointer-events-none absolute inset-x-0 -z-20 ${vp ? "" : "bottom-0"}`}
      >
        <Hills
          d={MID_HILLS}
          fill="url(#dh-mid)"
          className={`w-full ${vp ? "h-full" : "h-[280px] max-mobile:h-[175px]"}`}
        />
      </motion.div>
        </>
      )}

      {/* The page background, brought up to meet the ridgeline. A soft top edge
          hides the seam where the warm band and hills end; the roofs draw over
          the solid part and dissolve into it. */}
      {vp && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -z-10"
          style={{
            top: "auto",
            bottom: 0,
            height: "26vh",
            background: "linear-gradient(180deg, rgba(8,7,10,0) 0%, #08070a 55%, #08070a 100%)",
          }}
        />
      )}

      {children}

      {/* Foreground roofline — leads the scroll, so content passes behind it. */}
      <motion.div
        aria-hidden
        style={{
          y: front,
          ...(vp
            ? { top: "auto", bottom: `-${FRONT_LEAD}px`, height: "26vh" }
            : { bottom: `-${FRONT_LEAD}px` }),
        }}
        className="pointer-events-none absolute inset-x-0 z-20"
      >
        <Roofline fill={vp ? "h-full" : "h-[250px] max-mobile:h-[170px]"} />
        {/* Ground that travels with the houses. Without it, the row lifting on
            scroll would open a strip of empty scene above the marquee. */}
        <div aria-hidden className="absolute inset-x-0 top-full h-[220px] bg-bg" />
      </motion.div>

      {/* Settle the roofline into the page background. */}
      {!vp && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[56px] bg-[linear-gradient(180deg,transparent,#08070a_92%)]"
        />
      )}
    </div>
  );
}
