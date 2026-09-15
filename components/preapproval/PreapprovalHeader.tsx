import Image from "next/image";
import { site } from "@/lib/content";
import { phone } from "@/lib/preapproval";
import { PhoneIcon } from "./PhoneIcon";

/** Logo and phone only — shared by /preapproval and its thank-you page. */
export function PreapprovalHeader() {
  return (
    <header className="relative z-10 mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-10 pt-6 max-mobile:px-5 max-mobile:pt-5">
      {/* Not a link: the logo is the most common accidental exit on a landing page. */}
      <div className="flex items-center gap-[12px]">
        {/* Empty alt: the wordmark beside it already reads "Dream Home", and
            a named logo would make screen readers say it twice. Eager rather
            than the deprecated `priority` — the hero photo holds the one
            preload slot. */}
        <Image
          src="/assets/logo.png"
          alt=""
          width={42}
          height={42}
          loading="eager"
          className="h-[42px] w-[42px] rounded-[10px] object-contain"
        />
        <span className="flex flex-col leading-[1.15] whitespace-nowrap">
          <span className="font-display text-[16px] tracking-[.16em] text-gold-soft uppercase">
            {site.wordmark}
          </span>
          <span className="font-mono text-[9px] tracking-[.3em] text-muted-3 uppercase">
            {site.tagline}
          </span>
        </span>
      </div>
      <a
        href={`tel:${phone.tel}`}
        className="pressable inline-flex shrink-0 items-center gap-2 rounded-full border border-[rgba(233,200,119,.3)] px-4 py-[9px] text-[14.5px] whitespace-nowrap text-gold-soft hover:border-[rgba(233,200,119,.6)] max-mobile:px-3 max-mobile:text-[13.5px]"
      >
        <PhoneIcon />
        <span className="max-[520px]:hidden">{phone.display}</span>
        <span className="hidden max-[520px]:inline">Call</span>
      </a>
    </header>
  );
}
