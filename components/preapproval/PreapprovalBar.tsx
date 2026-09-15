"use client";

import { useEffect, useState } from "react";
import { licensing, phone } from "@/lib/preapproval";

/**
 * Pinned Call / Start bar, at every width. The homepage's <MobileBar> stops at
 * 1366px; here, above that, there was no call to action at all for the five
 * screens between the hero and the closing section.
 *
 * Phones get two equal buttons; wide screens get a slim strip with a line of
 * context, because two 50%-wide buttons on a 1440px monitor read as a banner ad.
 *
 * Hidden while the hero (which holds the form) is on screen: a second "Start"
 * pinned over the form it points at is noise, and on a phone it would cover
 * the Continue button.
 */
export function PreapprovalBar() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting));
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div
      data-material
      inert={!shown}
      aria-hidden={!shown}
      className={`fixed right-0 bottom-0 left-0 z-[60] border-t border-[rgba(233,200,119,.18)] bg-[rgba(8,7,10,.92)] px-[14px] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[18px] transition-[translate,opacity] duration-[450ms] ease-out-expo ${
        shown ? "translate-y-0 opacity-100" : "translate-y-[115%] opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-6 max-bar:px-0">
        <p className="text-[15px] text-muted-2 max-bar:hidden">
          <span className="text-text">Get preapproved with {licensing.agent.name}.</span> No credit
          check to start.
        </p>
        <div className="grid grid-cols-[auto_auto] gap-[10px] max-bar:w-full max-bar:grid-cols-[1fr_1.35fr]">
          <a
            href={`tel:${phone.tel}`}
            className="flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(233,200,119,.35)] px-6 text-[15.5px] whitespace-nowrap text-gold-soft max-bar:min-h-[52px] max-bar:text-[16px]"
          >
            <span className="max-bar:hidden">Call {phone.display}</span>
            <span className="hidden max-bar:inline">Call now</span>
          </a>
          <a
            href="#start"
            className="btn-gold flex min-h-[48px] items-center justify-center rounded-full px-7 text-[15.5px] font-semibold whitespace-nowrap max-bar:min-h-[52px] max-bar:text-[16px]"
          >
            Start My Preapproval
          </a>
        </div>
      </div>
    </div>
  );
}
