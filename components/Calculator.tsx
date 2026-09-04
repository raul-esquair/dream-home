"use client";

import { useState } from "react";

import { BookTrigger } from "./BookDialog";
import { SettleIn } from "./SettleIn";
import { Slider } from "./ui/slider";
import { currency, monthlyPayment, trimRate } from "@/lib/format";

const TERMS = [15, 20, 30] as const;
type Term = (typeof TERMS)[number];

/** Track colour, read by the `Slider` component. */
const fill = (color: string) => ({ "--fill": color }) as React.CSSProperties;

export function Calculator() {
  const [price, setPrice] = useState(550000);
  const [downPct, setDownPct] = useState(10);
  const [rate, setRate] = useState(6.375);
  const [term, setTerm] = useState<Term>(30);

  const downAmount = (price * downPct) / 100;
  const loan = price - downAmount;
  const monthly = monthlyPayment(price, downPct, rate, term);

  return (
    <section id="calculator" className="section">
      {/* The panel arrives as one object — see <SettleIn>. */}
      <SettleIn className="calc-card grid grid-cols-[.85fr_1.15fr] items-center gap-14 overflow-hidden rounded-[28px] border border-[rgba(233,200,119,.18)] p-12 max-mobile:grid-cols-1 max-mobile:p-[26px]">
        <div>
          <span className="eyebrow">02 &#8212; Affordability</span>
          <h2 className="mb-[18px] font-display text-[clamp(32px,3.2vw,46px)] tracking-[-.01em] text-text-strong">
            Run the numbers before you fall in love with a house
          </h2>
          <p className="mb-7 text-[17px] leading-[1.65] text-muted-2">
            Move the sliders for a quick estimate of principal and interest. We will confirm
            taxes, insurance and program options on your call.
          </p>
          <BookTrigger className="pressable inline-flex cursor-pointer items-center rounded-full border border-[rgba(233,200,119,.35)] px-7 py-[15px] text-[15px] text-gold-soft transition-[background-color,translate,color] duration-300 hover:-translate-y-[2px] hover:bg-[rgba(233,200,119,.1)] hover:text-gold-pale">
            Get a real quote &#8594;
          </BookTrigger>
        </div>

        <div>
          <div data-material className="rounded-[22px] border border-[rgba(255,255,255,.09)] bg-[rgba(10,9,13,.72)] p-8 backdrop-blur-[12px]">
            {/* Readout */}
            <div
              aria-live="polite"
              /* Wraps below 860px: the 46px figure and the loan summary together
                 exceed a phone-width panel, and flex items do not shrink past
                 their content, so the summary was pushed outside the card. */
              className="mb-[26px] flex flex-wrap items-end justify-between gap-x-5 gap-y-3 border-b border-hairline pb-6"
            >
              <div>
                <div className="mb-2 font-mono text-[10.5px] tracking-[.2em] text-muted-2 uppercase">
                  Estimated monthly payment
                </div>
                <div className="shimmer-figure animate-shimmer-slow font-display text-[46px] leading-none max-mobile:text-[38px]">
                  {currency(monthly)}/mo
                </div>
              </div>
              <div className="text-right text-[13.5px] leading-[1.6] text-muted max-mobile:text-left">
                <div>Loan {currency(loan)}</div>
                <div>Down {currency(downAmount)}</div>
              </div>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-[22px]">
              <div>
                <div className="mb-[10px] flex justify-between text-[13.5px] text-nav">
                  <span>Home price</span>
                  <span className="text-gold-soft">{currency(price)}</span>
                </div>
                <Slider
                  min={200000}
                  max={1500000}
                  step={10000}
                  value={[price]}
                  onValueChange={([v]) => setPrice(v)}
                  thumbLabel="Home price"
                  valueText={currency(price)}
                  style={fill("#c9a227")}
                />
              </div>

              <div>
                <div className="mb-[10px] flex justify-between text-[13.5px] text-nav">
                  <span>Down payment</span>
                  <span className="text-gold-soft">
                    {downPct}% &#183; {currency(downAmount)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={35}
                  step={1}
                  value={[downPct]}
                  onValueChange={([v]) => setDownPct(v)}
                  thumbLabel="Down payment"
                  valueText={`${downPct} percent, ${currency(downAmount)}`}
                  style={fill("#7c5cc4")}
                />
              </div>

              <div>
                <div className="mb-[10px] flex justify-between text-[13.5px] text-nav">
                  <span>Interest rate</span>
                  <span className="text-gold-soft">{trimRate(rate)}%</span>
                </div>
                <Slider
                  min={3}
                  max={9}
                  step={0.125}
                  value={[rate]}
                  onValueChange={([v]) => setRate(v)}
                  thumbLabel="Interest rate"
                  valueText={`${trimRate(rate)} percent`}
                  style={fill("#c9a227")}
                />
              </div>

              {/* Term */}
              <div role="group" aria-label="Loan term" className="flex gap-[10px]">
                {TERMS.map((t) => {
                  const selected = term === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTerm(t)}
                      className={`pressable flex-1 cursor-pointer rounded-xl border py-3 text-[14px] transition-[background-color,border-color,color] duration-300 ${
                        selected
                          ? "border-[rgba(233,200,119,.6)] bg-[rgba(201,162,39,.16)] text-gold-soft"
                          : "border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.03)] text-muted"
                      }`}
                    >
                      {t} year
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-[22px] font-mono text-[10px] leading-[1.7] tracking-[.12em] text-muted uppercase">
              Principal &amp; interest only. Not a loan commitment.
            </p>
          </div>
        </div>
      </SettleIn>
    </section>
  );
}
