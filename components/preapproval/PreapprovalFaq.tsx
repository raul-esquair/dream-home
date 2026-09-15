"use client";

import { useState } from "react";
import { faqs } from "@/lib/preapproval";

/** Single-open accordion, same mechanics and panel CSS as the homepage FAQ. */
export function PreapprovalFaq() {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q} className="overflow-hidden rounded-2xl border border-hairline bg-surface">
            <h3>
              <button
                type="button"
                id={`pa-faq-trigger-${i}`}
                aria-expanded={isOpen}
                aria-controls={`pa-faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-5 px-6 py-5 text-left font-display text-[18px] text-quote transition-colors duration-300 hover:text-gold-soft"
              >
                {faq.q}
                <span
                  aria-hidden
                  className={`shrink-0 text-[20px] text-gold transition-transform duration-[400ms] ease-out-expo ${
                    isOpen ? "rotate-45" : "rotate-0"
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={`pa-faq-panel-${i}`}
              role="region"
              aria-labelledby={`pa-faq-trigger-${i}`}
              className="faq-panel"
              data-open={isOpen}
            >
              <div>
                <p className="px-6 pb-6 text-[15.5px] leading-[1.7] text-muted-2">{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
