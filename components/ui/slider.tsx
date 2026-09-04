"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Range slider, skinned to the Dream Home tokens.
 *
 * Colour comes from a `--fill` custom property set by the caller, so the gold
 * and purple sliders share one component. Radix renders real elements rather
 * than a native `<input type="range">`, so the track paints identically in
 * every browser — the vendor pseudo-element approach it replaces did not.
 *
 * `valueText` sets `aria-valuetext` on the thumb so screen readers announce
 * "$550,000" rather than "550000".
 */
function Slider({
  className,
  valueText,
  thumbLabel,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  valueText?: string;
  thumbLabel?: string;
}) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full cursor-pointer touch-none items-center py-[6px] select-none",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1 w-full grow overflow-hidden rounded-full bg-[rgba(255,255,255,.12)]"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full rounded-full bg-[var(--fill)]"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        aria-label={thumbLabel}
        aria-valuetext={valueText}
        className="block size-4 shrink-0 rounded-full bg-[var(--fill)] transition-shadow duration-200 hover:shadow-[0_0_0_6px_color-mix(in_srgb,var(--fill)_22%,transparent)] focus-visible:shadow-[0_0_0_6px_color-mix(in_srgb,var(--fill)_28%,transparent)]"
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
