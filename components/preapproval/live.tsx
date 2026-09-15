"use client";

import { useSyncExternalStore } from "react";
import { adCities, callbackHours, callbackStatus, licensing, type CallbackStatus } from "@/lib/preapproval";

/*
 * The page prerenders as static HTML, so anything that depends on the clock or
 * the URL is read after hydration. Both hooks use useSyncExternalStore with a
 * null server snapshot: the server and the first client paint agree on the
 * neutral wording, then the live value swaps in — no hydration mismatch.
 */

const never = () => () => {};

function readCity(): string | null {
  const raw = new URLSearchParams(window.location.search).get("city");
  if (!raw) return null;
  const wanted = raw.replace(/[-_+]+/g, " ").trim().toLowerCase();
  return adCities.find((c) => c.toLowerCase() === wanted) ?? null;
}

/** The ad's `?city=` value, if it names one of our towns. See `adCities`. */
export function useCity(): string | null {
  return useSyncExternalStore(never, readCity, () => null);
}

function everyMinute(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/** Callback status that stays true for a tab left open across 6pm. */
export function useCallbackStatus(): CallbackStatus | null {
  return useSyncExternalStore(everyMinute, () => callbackStatus(), () => null);
}

/** Hero subheadline. Names the searched town when the ad passes one. */
export function HeroSub() {
  const city = useCity();
  return (
    <p className="mb-5 max-w-[34em] text-[18px] leading-[1.6] text-[#d6cee4] max-mobile:text-[16.5px]">
      Find out what you can afford{city ? ` in ${city}` : ""} before you start shopping, with the
      Tracy team that helps you buy the house.
    </p>
  );
}

/**
 * The 5-minute promise, where the decision happens: in the form card. Live,
 * because "within 5 minutes" at 9pm on a Friday is a promise the visitor can
 * see being broken.
 */
export function CallbackLine() {
  const status = useCallbackStatus();
  const name = licensing.agent.firstName;
  const open = status === "open";

  const text = {
    open: (
      <>
        <span className="text-text">{name} is available now.</span> He&rsquo;ll call you within 5 minutes.
      </>
    ),
    today: <>{name} calls you back first thing this morning.</>,
    tomorrow: <>{name} calls you back first thing tomorrow morning.</>,
    monday: <>{name} calls you back first thing Monday morning.</>,
  };

  return (
    <p className="flex items-start gap-[10px] text-[14px] leading-[1.5] text-muted-2">
      <span
        aria-hidden
        className={`mt-[6px] h-[8px] w-[8px] shrink-0 rounded-full ${
          open ? "bg-[#6fcf97] shadow-[0_0_0_4px_rgba(111,207,151,.16)]" : "bg-purple"
        }`}
      />
      <span>
        {status ? (
          text[status]
        ) : (
          <>
            <span className="text-text">{name} calls you back within 5 minutes,</span>{" "}
            {callbackHours.label}.
          </>
        )}
      </span>
    </p>
  );
}
