"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Keyframes for the settle. Shared so the two cards that use it cannot drift
 * apart — the hold between 0.34 and 0.68 is the stretch where a card of this
 * size is fully on screen, measured on the calculator as full opacity from
 * `top: 240px` through `top: 2px`, so nothing moves while its controls are
 * actually usable.
 */
const IN = [0, 0.08, 0.34, 0.68, 0.92, 1];
const OPACITY = [0, 0.12, 1, 1, 0.18, 0];
const SCALE = [0.9, 0.91, 1, 1, 0.96, 0.95];

/**
 * A card that arrives as one object: it fades up from 0.9 scale as it settles
 * into the middle of the screen, and lets go again on the way out.
 *
 * Progress is read straight off the card's own position rather than a
 * viewport-wide scroll, so it behaves the same wherever its section lands.
 *
 * Do not wrap one of these in <Reveal>. The card is its own entrance, and
 * layering the two only makes the copy arrive after its own panel.
 *
 * Note that the exit half only fires if the page continues far enough below
 * the card for it to reach 0.68. The closing CTA cannot — measured, it tops
 * out at 0.587 on a 900px viewport — so there it is an entrance only, which is
 * what a final call to action wants anyway.
 */
export function SettleIn({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, IN, OPACITY);
  const scale = useTransform(scrollYProgress, IN, SCALE);

  return (
    <motion.div
      ref={ref}
      data-settle
      style={{ opacity: reduced ? 1 : opacity, scale: reduced ? 1 : scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
