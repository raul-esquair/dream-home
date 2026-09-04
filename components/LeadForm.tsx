"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead, type LeadState } from "@/app/actions";
import { leadIntents } from "@/lib/content";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const INITIAL: LeadState = { status: "idle" };

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, INITIAL);
  const sent = state.status === "sent";
  /* React clears an uncontrolled form once the action resolves. Keying the form
     on the server's failed-attempt counter remounts it, so the echoed-back
     values repopulate the fields instead of the user retyping everything. */
  const attempt = state.attempt ?? 0;

  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) window.gtag?.("event", "generate_lead");
  }, [sent]);

  /* The submit button is what had focus, and it is now gone. Move focus to the
     confirmation so keyboard and screen-reader users are not stranded. */
  useEffect(() => {
    if (sent) confirmation.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <div
        ref={confirmation}
        tabIndex={-1}
        className="lead-sent flex flex-col items-center gap-[18px] py-[14px] text-center outline-none"
      >
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(233,200,119,.35)] bg-[rgba(201,162,39,.14)]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-soft" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </span>

        <div>
          <p className="font-display text-[24px] text-text-strongest">Request sent</p>
          <p className="mx-auto mt-[10px] max-w-[320px] text-[15.5px] leading-[1.6] text-muted-2">
            {state.values?.email ? (
              <>
                Sonny or Dhruv will reply to{" "}
                <span className="text-gold-soft">{state.values.email}</span> within one business
                day.
              </>
            ) : (
              <>Sonny or Dhruv will reply within one business day.</>
            )}
          </p>
        </div>

        <p aria-live="polite" className="sr-only">
          Request sent. We will reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      key={attempt}
      action={formAction}
      className="flex flex-col gap-[14px]"
    >
      <label className="sr-only" htmlFor="lead-name">
        Full name
      </label>
      <input
        id="lead-name"
        name="name"
        required
        placeholder="Full name"
        className="field"
        defaultValue={state.values?.name}
      />

      <label className="sr-only" htmlFor="lead-email">
        Email
      </label>
      <input
        id="lead-email"
        name="email"
        type="email"
        required
        placeholder="Email"
        className="field"
        defaultValue={state.values?.email}
      />

      <label className="sr-only" htmlFor="lead-phone">
        Phone
      </label>
      <input
        id="lead-phone"
        name="phone"
        type="tel"
        placeholder="Phone"
        className="field"
        defaultValue={state.values?.phone}
      />

      <span id="lead-intent-label" className="sr-only">
        Where you are in the process
      </span>
      <Select name="intent" defaultValue={state.values?.intent ?? leadIntents[0]}>
        {/* Reads as "Where you are in the process, <current value>". */}
        <SelectTrigger
          id="lead-intent"
          aria-labelledby="lead-intent-label lead-intent"
          className="text-muted"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {leadIntents.map((intent) => (
            <SelectItem key={intent} value={intent}>
              {intent}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`btn-gold mt-[6px] cursor-pointer rounded-full py-[17px] text-[16px] font-semibold hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(201,162,39,.3)] disabled:cursor-default ${
          pending ? "animate-shimmer" : ""
        }`}
      >
        {pending ? "Sending…" : "Book my consultation"}
      </button>

      <p aria-live="polite" className="sr-only">
        {state.message ?? ""}
      </p>
      {state.status === "error" && (
        <p className="text-center text-[13.5px] text-[#e6a1a1]">{state.message}</p>
      )}

      <p className="text-center font-mono text-[10px] leading-[1.7] tracking-[.12em] text-label-dim uppercase">
        No spam. We reply within one business day.
      </p>
    </form>
  );
}
