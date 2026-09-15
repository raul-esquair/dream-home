"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  submitPreapproval,
  type PreapprovalState,
  type PreapprovalValues,
} from "@/app/preapproval/actions";
import {
  areas,
  consentText,
  firstHomeOptions,
  licensing,
  phone,
  priceRanges,
  timeframes,
} from "@/lib/preapproval";
import { CallbackLine, useCity } from "./live";

const INITIAL: PreapprovalState = { status: "idle" };

const EMPTY: PreapprovalValues = {
  timeframe: "",
  firstHome: "",
  area: "",
  price: "",
  name: "",
  phone: "",
  email: "",
  consent: false,
};

type Step = 1 | 2 | 3;

const STEP_TITLES: Record<Step, string> = {
  1: "Where you are",
  2: "What you’re looking for",
  3: "How to reach you",
};

/**
 * Three steps, easy taps first and contact details last: by the time the
 * phone field appears the visitor has made five choices and wants to finish.
 * The evidence and the reasoning for this order are in the plan
 * (docs/preapproval-page.md links it).
 *
 * Submitted through `startTransition` rather than the form's `action` prop.
 * The action prop resets the form after it resolves, and these inputs are
 * controlled — every answer lives in state so the step checks can read it —
 * so a reset would fight React for the values.
 */
export function PreapprovalForm() {
  const [state, formAction, pending] = useActionState(submitPreapproval, INITIAL);
  const [values, setValues] = useState<PreapprovalValues>(EMPTY);
  const [step, setStep] = useState<Step>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // A server-side rejection names the step to fix. Adjusted during render —
  // React's pattern for state that follows a changing input — so the step and
  // the message land in the same paint.
  const [seenAttempt, setSeenAttempt] = useState(0);
  if ((state.attempt ?? 0) !== seenAttempt) {
    setSeenAttempt(state.attempt ?? 0);
    if (state.step) setStep(state.step);
  }

  // An ad that links with ?city=Stockton has already told us where they are
  // looking — pre-answer that chip (still changeable) so step 2 is one tap.
  // Same render-time adjustment, since the city only resolves after hydration.
  const city = useCity();
  const [seededCity, setSeededCity] = useState<string | null>(null);
  if (city && city !== seededCity) {
    setSeededCity(city);
    if (!values.area) setValues((v) => ({ ...v, area: city }));
  }

  const card = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null); // the step title, an <h3>
  const moved = useRef(false);

  // Moving between steps replaces the controls under the pointer, so focus
  // goes to the new step's heading for keyboard and screen-reader users, and
  // the card is brought back into view on a phone where Continue sits below
  // the fold. Skipped on first render so the page does not jump on load.
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus({ preventScroll: true });
    const top = card.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) card.current?.scrollIntoView({ block: "start" });
  }, [step]);

  const set = <K extends keyof PreapprovalValues>(key: K, value: PreapprovalValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setStepError(null);
  };

  const missing = (s: Step): string | null => {
    if (s === 1 && (!values.timeframe || !values.firstHome))
      return "Choose an answer for each question.";
    if (s === 2 && (!values.area || !values.price)) return "Choose an area and a price range.";
    return null;
  };

  const go = (next: Step) => {
    if (next > step) {
      const problem = missing(step);
      if (problem) {
        setStepError(problem);
        return;
      }
      // No tracking event here on purpose: Google Ads records only delivered
      // leads (lib/analytics.ts). A step-by-step funnel belongs in an
      // analytics tool, not in the ads account.
    }
    moved.current = true;
    setStepError(null);
    setStep(next);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < 3) {
      go((step + 1) as Step);
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  const error = stepError ?? (state.status === "error" && state.step === step ? state.message : null);

  return (
    <div ref={card} id="start" className="pa-card scroll-mt-6">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-[25px] leading-[1.15] text-text-strongest">
            Start your preapproval
          </h2>
          <span className="shrink-0 font-mono text-[10.5px] tracking-[.18em] text-label uppercase">
            Step {step} of 3
          </span>
        </div>
        <CallbackLine />
        <div aria-hidden className="grid grid-cols-3 gap-[6px]">
          {([1, 2, 3] as const).map((s) => (
            <span
              key={s}
              className={`h-[3px] rounded-full transition-colors duration-300 ${
                s <= step ? "bg-gold" : "bg-[rgba(255,255,255,.1)]"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <h3
          ref={heading}
          tabIndex={-1}
          className="-mb-2 text-[13px] font-medium tracking-[.04em] text-gold-soft outline-none"
        >
          {STEP_TITLES[step]}
        </h3>

        {/* Every step stays mounted so every answer submits with the form;
            only the current one is shown. */}
        <div hidden={step !== 1} className="flex flex-col gap-6">
          <Choices name="timeframe" legend="When are you hoping to buy?" options={timeframes} value={values.timeframe} onChange={(v) => set("timeframe", v)} />
          <Choices name="firstHome" legend="Is this your first home?" options={firstHomeOptions} value={values.firstHome} onChange={(v) => set("firstHome", v)} />
        </div>

        <div hidden={step !== 2} className="flex flex-col gap-6">
          <Choices name="area" legend="Where are you looking?" options={areas} value={values.area} onChange={(v) => set("area", v)} />
          <Choices name="price" legend="What price range?" options={priceRanges} value={values.price} onChange={(v) => set("price", v)} />
        </div>

        <div hidden={step !== 3} className="flex flex-col gap-4">
          <Field id="pa-name" label="Full name">
            <input id="pa-name" name="name" autoComplete="name" className="field" value={values.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          {/* The phone field is where mortgage forms lose people — the fear is
              a flood of calls from lenders who bought the lead. Answered here,
              where the fear is felt. True by construction: the server action
              emails one inbox and shares nothing. */}
          <Field
            id="pa-phone"
            label="Mobile number"
            hint={`Your details go only to ${licensing.agent.firstName}. Never sold or shared with other lenders.`}
          >
            <input id="pa-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" aria-describedby="pa-phone-hint" className="field" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field id="pa-email" label="Email">
            <input id="pa-email" name="email" type="email" autoComplete="email" className="field" value={values.email} onChange={(e) => set("email", e.target.value)} />
          </Field>

          <label htmlFor="pa-consent" className="mt-1 grid cursor-pointer grid-cols-[18px_1fr] gap-3 text-[12.5px] leading-[1.55] text-muted">
            <input
              id="pa-consent"
              name="consent"
              type="checkbox"
              value="yes"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-[2px] h-[16px] w-[16px] accent-[#c9a227]"
            />
            <span>
              <span className="text-muted-2">Optional.</span> {consentText}
            </span>
          </label>

          {/* Honeypot: hidden from people and assistive tech, filled by bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="pa-company">Company</label>
            <input id="pa-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[14px] text-[#e6a1a1]">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className={`btn-gold flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-[16px] font-semibold hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(201,162,39,.3)] disabled:cursor-default ${
              pending ? "animate-shimmer" : ""
            }`}
          >
            {step < 3 ? (
              <>
                Continue <span aria-hidden>&#8594;</span>
              </>
            ) : pending ? (
              "Sending…"
            ) : (
              "Get My Preapproval Started"
            )}
          </button>
          {step > 1 && (
            <button
              type="button"
              onClick={() => go((step - 1) as Step)}
              className="cursor-pointer self-center px-3 py-1 text-[14px] text-muted transition-colors hover:text-gold-soft"
            >
              &#8592; Back
            </button>
          )}
        </div>

        <p className="text-center text-[12.5px] leading-[1.6] text-label">
          {step < 3 ? (
            <>No credit check to start. Takes about a minute.</>
          ) : (
            <>
              This form doesn&rsquo;t check your credit. {licensing.agent.firstName} calls from {phone.display}.
              <br />
              Preapproval is subject to credit review, verification and lender approval.
            </>
          )}
        </p>
      </form>
    </div>
  );
}

function Choices<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: readonly T[];
  value: string;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-[15.5px] text-text">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => {
          const id = `pa-${name}-${i}`;
          return (
            <label key={option} htmlFor={id} className="cursor-pointer">
              <input
                id={id}
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className="peer sr-only"
              />
              <span className="pressable inline-flex min-h-[44px] items-center rounded-full border border-[rgba(255,255,255,.14)] bg-[rgba(255,255,255,.02)] px-4 text-[14.5px] text-muted-2 transition-colors duration-200 select-none peer-checked:border-[rgba(233,200,119,.75)] peer-checked:bg-[rgba(201,162,39,.16)] peer-checked:text-gold-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-link hover:border-[rgba(233,200,119,.4)]">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="text-[13.5px] text-muted-2">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-muted">
          <svg aria-hidden viewBox="0 0 16 16" className="mt-[2px] h-[13px] w-[13px] shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="10" height="7" rx="1.5" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
          </svg>
          {hint}
        </p>
      )}
    </div>
  );
}
