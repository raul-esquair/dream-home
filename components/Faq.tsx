"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { BookTrigger } from "./BookDialog";
import { faqs, publishedContact } from "@/lib/content";

export function Faq() {
  /** Single-open accordion. Item 0 starts open; -1 means all closed. */
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section">
      <div className="grid grid-cols-[.8fr_1.2fr] items-start gap-14 max-mobile:grid-cols-1">
        {/* Not sticky, though it looks like a candidate: measured, the
            questions column is 428px against this column's 400px, so the whole
            grid fits one screen and a sticky heading would pin for 28px and
            then leave. */}
        <Reveal variant="focus">
          <span className="eyebrow">05 &#8212; Questions</span>
          <h2 className="mb-[18px] font-display text-[clamp(34px,3.6vw,48px)] tracking-[-.01em] text-text-strong">
            First-time buyer questions, answered plainly
          </h2>
          <p className="mb-7 text-[16px] leading-[1.65] text-muted-2">
            Still unsure? Email{" "}
            <a href={`mailto:${publishedContact.email}`}>{publishedContact.name}</a> and we
            will answer without a sales pitch.
          </p>
          {/* The FAQ is the last objection-handling moment before the form, so
              it ends on the same CTA rather than dead-ending on the answers.
              Ghost rather than gold: the #book block two sections down stays
              the loudest call on the page. */}
          <BookTrigger className="pressable inline-flex cursor-pointer items-center rounded-full border border-[rgba(233,200,119,.35)] px-7 py-[15px] text-[15px] text-gold-soft transition-[background-color,translate,color] duration-300 hover:-translate-y-[2px] hover:bg-[rgba(233,200,119,.1)] hover:text-gold-pale">
            Book a free consultation &#8594;
          </BookTrigger>
        </Reveal>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={faq.q} index={i} variant="focus">
                <div className="overflow-hidden rounded-2xl border border-hairline bg-surface">
                  <h3>
                    <button
                      type="button"
                      id={`faq-trigger-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="flex w-full cursor-pointer items-center justify-between gap-5 px-[26px] py-[22px] text-left font-display text-[18px] text-quote transition-colors duration-300 hover:text-gold-soft"
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
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    className="faq-panel"
                    data-open={isOpen}
                  >
                    <div>
                      <p className="px-[26px] pb-6 text-[15.5px] leading-[1.7] text-muted-2">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
