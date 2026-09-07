"use client";

import { useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * Keep the clip running until it has actually reached its last frame.
   *
   * `autoPlay` alone is not enough on a phone, and it failed here in two
   * different ways at once — both of which read to a visitor as "the video
   * didn't play".
   *
   * 1. Autoplay is refused outright. Low Power Mode on iOS blocks even a muted,
   *    `playsInline` clip, and Data Saver does the same on Android. The
   *    attribute is a request, and nothing here noticed it had been turned
   *    down — the hero just sat on its poster. The tour already retries on the
   *    first gesture (see <Process>); this is the same nudge.
   *
   * 2. It played, but not to the end. iOS suspends an autoplaying video the
   *    moment it leaves the viewport, and the hero leaves on the very first
   *    flick — so anyone who scrolled early and came back found it stopped
   *    partway, and it never resumed on its own. Coming back into view is
   *    therefore also a retry.
   *
   * `ended` is the one state where paused is the intended outcome, so it is
   * what tears the whole thing down.
   */
  useEffect(() => {
    if (reduced) return;
    const video = videoRef.current;
    if (!video) return;

    let done = false;

    const attempt = () => {
      if (done || !video.paused || video.ended) return;
      const started = video.play();
      // Refused: leave every trigger in place and wait for the next one.
      if (started && typeof started.then === "function") started.catch(() => {});
    };

    const finish = () => {
      done = true;
      teardown();
    };

    // Only worth resuming while the hero is actually on screen.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) attempt();
      },
      { threshold: 0.15 },
    );

    const teardown = () => {
      io.disconnect();
      video.removeEventListener("ended", finish);
      window.removeEventListener("touchstart", attempt);
      window.removeEventListener("pointerdown", attempt);
      document.removeEventListener("visibilitychange", onVisible);
    };

    const onVisible = () => {
      if (!document.hidden) attempt();
    };

    video.addEventListener("ended", finish);
    window.addEventListener("touchstart", attempt, { passive: true });
    window.addEventListener("pointerdown", attempt, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    io.observe(video);
    attempt();

    return teardown;
  }, [reduced]);

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
        ref={videoRef}
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
