"use client";

import { useReducedMotion } from "motion/react";

/**
 * Hero backdrop footage. Decorative, so it is hidden from assistive tech.
 *
 * Plays through once and holds its last frame. The source loops seamlessly
 * because it opens and closes on an empty driveway, so it is trimmed to end
 * while the car is parked — otherwise stopping would rest on an empty house.
 *
 * Under prefers-reduced-motion the clip is replaced by its poster frame — an
 * autoplaying clip is the kind of motion that setting asks us to stop, and the
 * still holds the same composition.
 *
 * The clip is muted and `playsInline`; both are required for autoplay to be
 * allowed at all, on iOS in particular.
 */
export function HeroVideo() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/assets/hero-poster.jpg"
        alt=""
        aria-hidden
        className="h-full w-full object-cover object-[50%_38%]"
      />
    );
  }

  return (
    <>
      {/* CSS net: if the JS hook ever disagrees with the media query, the
          stylesheet still swaps the loop for the still. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/hero-poster.jpg"
        alt=""
        aria-hidden
        data-hero-still
        className="hidden h-full w-full object-cover object-[50%_38%]"
      />
      <video
        data-hero-clip
        aria-hidden
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster="/assets/hero-poster.jpg"
        className="h-full w-full object-cover object-[50%_38%]"
      >
        <source src="/assets/hero.webm" type="video/webm" />
        <source src="/assets/hero.mp4" type="video/mp4" />
      </video>
    </>
  );
}
