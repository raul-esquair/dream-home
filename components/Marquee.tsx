import { serviceAreas } from "@/lib/content";

/** Decorative service-area strip. Two identical tracks scroll to -50%. */
export function Marquee() {
  return (
    <div
      aria-hidden
      className="relative z-[1] overflow-hidden border-y border-[rgba(255,255,255,.07)] bg-[rgba(255,255,255,.015)] py-4"
    >
      <div className="marquee-track animate-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex gap-[56px] pr-[56px] font-mono text-[11.5px] tracking-[.26em] text-marquee uppercase"
          >
            {serviceAreas.map((area) => (
              <span key={area} className="whitespace-nowrap">
                {area}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
