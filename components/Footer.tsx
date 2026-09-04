import Image from "next/image";
import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative z-[1] mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-10 px-10 pt-[70px] pb-12 max-mobile:px-5">
      <div className="flex items-center gap-[14px]">
        <Image
          src="/assets/logo.png"
          alt=""
          width={38}
          height={38}
          className="h-[38px] w-[38px] object-contain"
        />
        <span className="font-mono text-[10.5px] leading-[1.8] tracking-[.2em] text-marquee uppercase">
          {site.name}
          <br />
          Founded {site.founded} &#183; Tracy, CA
        </span>
      </div>
      <div className="font-mono text-[10.5px] tracking-[.2em] text-label-dimmest uppercase">
        Equal housing opportunity &#183; {site.license}
      </div>
    </footer>
  );
}
