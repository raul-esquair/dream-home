"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger position within a group. Delay is min(index, 4) * step. */
  index?: number;
  className?: string;
  id?: string;
  /**
   * "rise" is the page default from the handoff: opacity and a 28px lift.
   * "focus" additionally arrives out of focus and sharpens as it settles —
   * used by the FAQ, where "coming into clarity" is the section's own subject,
   * and by the blog teasers, the page's other flat card list.
   */
  variant?: "rise" | "focus";
};

/**
 * `filter` needs explicit units at both ends: Motion interpolates the numbers
 * inside the function string, so `blur(0)` against `blur(10px)` has nothing to
 * interpolate toward and the blur snaps off at the end instead of clearing
 * smoothly.
 */
const VARIANTS = {
  rise: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    duration: 0.9,
    step: 0.06,
  },
  focus: {
    initial: { opacity: 0, y: 18, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    duration: 0.8,
    step: 0.07,
  },
} as const;

/**
 * Scroll reveal, fired once when the element is 12% visible with an -8% bottom
 * margin. Under prefers-reduced-motion the children render already visible.
 */
export function Reveal({ children, index = 0, className, id, variant = "rise" }: RevealProps) {
  const reduced = useReducedMotion();
  const spec = VARIANTS[variant];

  if (reduced) {
    return (
      // The explicit style overrides Motion's server-rendered `opacity:0`;
      // React will not clear an inline style it did not set itself. `filter`
      // is listed for the same reason — "focus" emits a blur server-side.
      <div
        data-reveal
        style={{ opacity: 1, transform: "none", filter: "none" }}
        className={className}
        id={id}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      data-reveal
      id={id}
      className={className}
      initial={spec.initial}
      whileInView={spec.animate}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: spec.duration,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index, 4) * spec.step,
      }}
    >
      {children}
    </motion.div>
  );
}
