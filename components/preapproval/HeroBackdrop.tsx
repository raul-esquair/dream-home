import Image from "next/image";

/**
 * Hero photograph behind the header and the first screen. Decorative — the
 * headline carries the meaning — so empty alt and hidden from assistive tech.
 * It is the largest paint, so it is preloaded. The scrims over it are in
 * globals.css (.pa-hero-bg) and were measured, not eyeballed: read the note
 * there before changing the photo, its position or the scrims.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="pa-hero-bg">
      <Image
        src="/assets/hero-dusk-house.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="pa-hero-photo"
      />
    </div>
  );
}
