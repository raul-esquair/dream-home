"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/lib/content";
import { BookTrigger } from "./BookDialog";

const NAV = [
  { label: "Listings", href: "#listings" },
  { label: "Loan calculator", href: "#calculator" },
  { label: "How it works", href: "#process" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  /* Fixed rather than sticky, so it overlays the hero instead of occupying a
     band above it — that is what lets it be genuinely transparent at rest and
     show the footage through. The hero carries matching top padding to clear
     it. On scroll it settles into the dark bar. */
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-6 border-b px-10 py-4 transition-[background-color,border-color,backdrop-filter] duration-500 max-mobile:px-5 ${
        scrolled
          ? "border-[rgba(233,200,119,.14)] bg-[rgba(8,7,10,.72)] backdrop-blur-[18px]"
          : "border-transparent bg-transparent"
      }`}
    >
      <a href="#top" className="flex items-center gap-[14px]">
        <Image
          src="/assets/logo.png"
          alt={site.name}
          width={46}
          height={46}
          priority
          className="h-[46px] w-[46px] rounded-[10px] object-contain"
        />
        <span className="flex flex-col leading-[1.15] whitespace-nowrap">
          <span className="font-display text-[17px] tracking-[.16em] text-gold-soft uppercase">
            {site.wordmark}
          </span>
          {/* muted-3, not the spec's --label: at rest this sits over the footage,
              where #8d86a0 measures 3.84 against the brightest frame. */}
          <span className="font-mono text-[9.5px] tracking-[.3em] text-muted-3 uppercase">
            {site.tagline}
          </span>
        </span>
      </a>

      <nav className="flex flex-wrap items-center justify-end gap-[30px] text-[14px] tracking-[.04em] max-mobile:gap-4 max-mobile:text-[13px]">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="text-nav hover:text-gold-link">
            {item.label}
          </a>
        ))}
        <BookTrigger className="btn-gold inline-flex cursor-pointer items-center rounded-full px-[22px] py-[11px] font-semibold hover:-translate-y-[2px] hover:shadow-[0_12px_30px_rgba(201,162,39,.28)] max-mobile:hidden">
          Book a consultation
        </BookTrigger>
      </nav>
    </header>
  );
}
