"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

import { BookTrigger } from "./BookDialog";
import type { Listing } from "@/lib/content";

/**
 * Listing card with a layered reveal: the photo lifts and brightens, a dark
 * gradient rises over its foot, the detail block shifts up, and a CTA unfolds.
 *
 * Two things drive it, because hover alone would strand touch users on the
 * page's most persuasive surface:
 *   - a pointer that can actually hover (`hover: hover`) uses hover
 *   - everything else opens the card once it is scrolled into view
 *
 * The card is a fixed height so the CTA unfolding cannot grow the row and
 * shove its neighbours around mid-hover.
 */
export function ListingCard({ listing }: { listing: Listing }) {
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();

  const inView = useInView(ref, { amount: 0.55, margin: "0px 0px -10% 0px" });

  /* Resolved after mount rather than during render: the server has no
     matchMedia, and reading it inline would make the first client render
     disagree with the markup it is hydrating. */
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const open = canHover ? hovered : inView;
  const ease = reduced ? "0ms" : "500ms";

  return (
    <article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-surface group relative flex h-[clamp(400px,31vw,470px)] flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,.09)] hover:border-[rgba(233,200,119,.4)] hover:shadow-[0_30px_70px_rgba(0,0,0,.55)] max-mobile:h-[clamp(360px,88vw,430px)]"
    >
      {/* Photo layer */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="placeholder-slot absolute inset-0 transition-[scale,opacity]"
          style={{
            transitionDuration: ease,
            transitionTimingFunction: "var(--ease-out-expo)",
            scale: open ? 1.05 : 1,
            opacity: open ? 1 : 0.82,
          }}
        />

        {/* Gradient that rises over the foot of the photo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] transition-[translate,opacity]"
          style={{
            transitionDuration: ease,
            transitionTimingFunction: "var(--ease-out-expo)",
            background: "linear-gradient(to top, rgba(8,7,10,.95) 55%, transparent)",
            translate: open ? "0 0" : "0 100%",
            opacity: open ? 1 : 0,
          }}
        />

        <span className="absolute top-4 left-4 z-[2] rounded-full bg-[rgba(124,92,196,.9)] px-[13px] py-[6px] font-mono text-[10px] tracking-[.18em] text-white uppercase">
          {listing.tag}
        </span>
        <span className="absolute bottom-[18px] left-[18px] z-[2] font-mono text-[10.5px] tracking-[.14em] text-label uppercase">
          {listing.photoLabel}
        </span>
      </div>

      {/* Detail block */}
      <div className="relative z-[2] px-[22px] pt-[20px] pb-[22px]">
        <div
          className="transition-[translate]"
          style={{
            transitionDuration: ease,
            transitionTimingFunction: "var(--ease-out-expo)",
            translate: open ? "0 -8px" : "0 0",
          }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[21px] text-gold-soft">{listing.city}</h3>
            <div className="text-[17px] text-text">{listing.price}</div>
          </div>
          <div className="mt-2 text-[14.5px] text-muted">{listing.street}</div>

          <div className="mt-[16px] flex gap-[18px] border-t border-[rgba(255,255,255,.07)] pt-[14px] font-mono text-[11px] tracking-[.14em] text-label uppercase">
            <span>{listing.beds} bd</span>
            <span>{listing.baths} ba</span>
            <span>{listing.sqft} sqft</span>
          </div>
        </div>

        {/* CTA unfolds from nothing. */}
        <div
          className="overflow-hidden transition-[max-height,opacity,translate]"
          style={{
            transitionDuration: ease,
            transitionTimingFunction: "var(--ease-out-expo)",
            maxHeight: open ? 72 : 0,
            opacity: open ? 1 : 0,
            translate: open ? "0 0" : "0 20px",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <BookTrigger className="btn-gold mt-[14px] flex w-full cursor-pointer items-center justify-center rounded-xl py-[12px] text-[14px] font-semibold">
            Ask about this home
          </BookTrigger>
        </div>
      </div>
    </article>
  );
}
