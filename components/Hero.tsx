import { Reveal } from "./Reveal";
import { BookTrigger } from "./BookDialog";
import { Scene } from "./scene/Scene";
import { HeroVideo } from "./scene/HeroVideo";
import { proof } from "@/lib/content";

function ProofDivider() {
  return (
    <span
      data-proof-divider
      aria-hidden
      className="h-[44px] w-px shrink-0 bg-[rgba(255,255,255,.14)] max-wide:hidden"
    />
  );
}

/**
 * Hero. The scene is the composition, not a backdrop: copy sits centred against
 * a luminous dusk sky and the image card drops low enough that the foreground
 * roofline crosses it.
 */
export function Hero() {
  return (
    <Scene layout="viewport" media={<HeroVideo />} className="z-[1] min-h-screen">
      <section id="top" className="section relative z-10 pt-[136px] pb-0 text-center max-mobile:pt-[168px]">
        <Reveal index={0}>
          <div className="mb-[26px] inline-flex items-center gap-[10px] rounded-full border border-[rgba(197,179,234,.45)] bg-[rgba(124,92,196,.18)] px-4 py-[7px] font-mono text-[11px] tracking-[.22em] text-purple-soft uppercase backdrop-blur-[6px] max-mobile:mb-5 max-mobile:text-[10px] max-mobile:tracking-[.12em]">
            <span
              aria-hidden
              className="animate-pulse-ring h-[7px] w-[7px] shrink-0 rounded-full bg-purple"
            />
            Family-run in Tracy, CA since 2013
          </div>
        </Reveal>

        <Reveal index={1}>
          <h1 className="mx-auto mb-[22px] max-w-[16ch] font-display text-[clamp(46px,5vw,78px)] leading-[1.04] tracking-[-.015em] text-text-strongest max-mobile:text-[40px]">
            Your first home,
            <br />
            <span className="shimmer-text animate-shimmer">handled end to end.</span>
          </h1>
        </Reveal>

        <Reveal index={2}>
          {/* One claim, not three. The service areas were two of six lines here
              and are already carried twice within a screen — the badge above
              names Tracy, and the marquee directly below lists all eight
              towns. "Pre-approval, offers and closing" is the process section,
              four sections of it. What is left is the only thing this page can
              say that the brokerage down the road cannot, and who it is for. */}
          <p className="mx-auto mb-[28px] max-w-[560px] text-[18.5px] leading-[1.65] text-[#d6cee4] max-mobile:text-[17px]">
            Real estate and home loans under one roof, so first-time buyers are not chasing
            two teams.
          </p>
        </Reveal>

        <Reveal index={3}>
          <div className="mb-[30px] flex flex-wrap justify-center gap-[14px]">
            <BookTrigger className="btn-gold inline-flex cursor-pointer items-center gap-3 rounded-full px-[34px] py-[17px] text-[16px] font-semibold hover:-translate-y-[3px] hover:shadow-[0_18px_44px_rgba(201,162,39,.3)]">
              Book a free consultation
              <span aria-hidden className="text-[18px]">
                &#8594;
              </span>
            </BookTrigger>
            <a
              href="#calculator"
              className="pressable inline-flex items-center rounded-full border border-[rgba(233,200,119,.34)] bg-[rgba(20,16,28,.3)] px-8 py-[17px] text-[16px] text-gold-ghost backdrop-blur-[6px] transition-[border-color,background-color,translate,color] duration-300 hover:-translate-y-[3px] hover:border-[rgba(233,200,119,.7)] hover:bg-[rgba(233,200,119,.12)] hover:text-gold-pale max-mobile:hidden"
            >
              See what you can afford
            </a>
          </div>
        </Reveal>

        <Reveal index={4}>
          <div className="mx-auto flex max-w-[860px] flex-wrap items-center justify-center gap-x-[30px] gap-y-5 border-t border-[rgba(255,255,255,.12)] pt-6 text-left max-mobile:gap-x-5 max-mobile:gap-y-3 max-mobile:pt-4">
            {/* TODO: real headshots for Sonny and Dhruv (not stock). */}
            <div className="flex items-center gap-[14px]">
              <div className="flex">
                {["SG", "DG"].map((initials, i) => (
                  <span
                    key={initials}
                    className={`placeholder-avatar flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-[rgba(233,200,119,.55)] font-mono text-[8px] tracking-[.1em] text-label max-mobile:h-11 max-mobile:w-11 ${
                      i === 1 ? "-ml-4" : ""
                    }`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              {/* The circles read as placeholder avatars on their own; the
                  caption under them said "headshots -> drop here", which is a
                  note to ourselves that shipped to a live site and cost a line
                  in the tightest part of the layout. Tracked in README instead. */}
              <div className="leading-[1.5]">
                <div className="text-[14.5px] text-text">Sonny &amp; Dhruv Goswamy</div>
              </div>
            </div>

            <ProofDivider />

            <div className="leading-[1.5]">
              <div className="flex items-center gap-2">
                <span aria-hidden className="text-[13px] tracking-[.14em] text-gold">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </span>
                <span className="font-display text-[19px] text-gold-soft">{proof.rating}</span>
              </div>
              <div className="mt-[5px] font-mono text-[10px] tracking-[.18em] text-muted-3 uppercase">
                {proof.reviewSource}
              </div>
            </div>

            <ProofDivider />

            <div className="leading-[1.5]">
              <div className="font-display text-[19px] text-gold-soft">{proof.familiesHelped}</div>
              {/* "Since 2013" is already in the badge at the top of the same
                  screen; repeating it here only made the caption wide enough
                  to force its own row. */}
              <div className="mt-[5px] font-mono text-[10px] tracking-[.18em] text-muted-3 uppercase">
                Families helped
              </div>
            </div>
          </div>
        </Reveal>

      </section>
    </Scene>
  );
}
