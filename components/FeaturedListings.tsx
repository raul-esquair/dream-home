"use client";

import { useReducedMotion } from "motion/react";

import { Reveal } from "./Reveal";
import { ListingCard } from "./ListingCard";
import { ListingCarousel } from "./ListingCarousel";
import { BookTrigger } from "./BookDialog";
import { listings } from "@/lib/content";

export function FeaturedListings() {
  const reduced = useReducedMotion();

  return (
    <section id="listings" className="section">
      <Reveal>
        <div className="mb-11 flex flex-wrap items-end justify-between gap-10">
          <div>
            <span className="eyebrow">01 &#8212; Featured listings</span>
            <h2 className="font-display text-[clamp(34px,3.6vw,52px)] tracking-[-.01em] text-text-strong">
              Homes we are showing this week
            </h2>
          </div>
          <BookTrigger className="cursor-pointer text-[15px] whitespace-nowrap text-gold-link transition-colors duration-[250ms] hover:text-gold-pale">
            Ask about a private tour &#8594;
          </BookTrigger>
        </div>
      </Reveal>

      {/* TODO: wire to the IDX/MLS feed. */}
      {/* The cylinder turns on its own and shows one home at a time. Under
          prefers-reduced-motion that is exactly the wrong offer, so the grid
          it replaced is still here and still the accessible reading of the
          same list. */}
      {reduced ? (
        <div className="grid grid-cols-3 gap-[26px] max-wide:grid-cols-2 max-mobile:grid-cols-1">
          {listings.map((listing, i) => (
            <Reveal key={listing.city} index={i}>
              <ListingCard listing={listing} />
            </Reveal>
          ))}
        </div>
      ) : (
        <ListingCarousel />
      )}
    </section>
  );
}
