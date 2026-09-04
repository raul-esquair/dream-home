"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { site } from "@/lib/content";
import { BookTrigger } from "./BookDialog";

/**
 * Fixed booking bar, 1366px and below — wider than the layout breakpoint so
 * it reaches iPad landscape. See --breakpoint-bar in globals.css.
 *
 * Carries a single action. The "Call" half of the handoff's Call/Book pair is
 * rendered only once a phone number exists — without one it fell back to
 * `#book`, making it a second button for the same thing.
 *
 * It stays out of the way until the hero is behind you. The hero already
 * carries this exact call twice, so a third copy pinned over it is noise; past
 * the hero there is no CTA in view until the FAQ, which is where it earns the
 * space.
 */
export function MobileBar() {
  const phone = site.phone;
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) {
      // No hero to watch: show it rather than stranding the only CTA on the
      // breakpoint. Deferred a frame because setting state straight from an
      // effect body is what the observer path avoids anyway.
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    /**
     * An observer rather than a scroll handler: reading the hero's rect on
     * every scroll event is a layout read per frame, on the one breakpoint
     * least able to afford it. The negative top margin pulls the root's top
     * edge down, so "no longer intersecting" means the hero's bottom has
     * passed 72px — clear of the header rather than exactly at the fold.
     */
    const io = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      data-material
      // `initial={false}` so a reload partway down the page finds the bar
      // already in place instead of sliding it in over the content.
      initial={false}
      animate={shown ? { y: 0, opacity: 1 } : { y: "115%", opacity: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      // Hidden means hidden: off-screen but still focusable would put a
      // keyboard user on a button they cannot see.
      inert={!shown}
      aria-hidden={!shown}
      className={`fixed right-0 bottom-0 left-0 z-[60] hidden gap-[10px] border-t border-[rgba(233,200,119,.18)] bg-[rgba(8,7,10,.92)] px-[14px] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[18px] max-bar:grid ${
        phone ? "grid-cols-[1fr_1.2fr]" : "grid-cols-1"
      }`}
    >
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex min-h-[52px] items-center justify-center rounded-full border border-[rgba(233,200,119,.35)] text-[16px] text-gold-soft"
        >
          Call
        </a>
      )}
      <BookTrigger className="btn-gold flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full text-[16px] font-semibold">
        Book a free consultation
      </BookTrigger>
    </motion.div>
  );
}
