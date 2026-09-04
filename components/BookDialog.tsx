"use client";

import { useRef, useState, type ReactNode } from "react";

import { LeadForm } from "./LeadForm";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";

/**
 * Opens the consultation form in a dialog.
 *
 * Every booking CTA on the page renders one of these, so each gets its own
 * form state — a visitor who abandons one and opens another starts clean.
 * `#book` still exists as a section, so a direct link to it keeps working.
 *
 * The panel grows from the button that opened it. There are seven triggers
 * scattered across the page, and a panel that always swells from the middle
 * severs the link between the thing pressed and the thing that appears; the
 * exit runs the same origin in reverse, so it collapses back to where it came
 * from. Expressed against the panel's own centre — `calc(50% + delta)` — which
 * works out to the trigger's offset from the centre of the screen, because the
 * panel is centred there. That needs no viewport units and never has to know
 * the panel's size.
 */
function anchorFrom(el: HTMLElement | null): string | undefined {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  // Clamped: a trigger just off-screen would otherwise throw the origin far
  // enough that the scale reads as a slide from nowhere.
  const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
  const dx = clamp(r.left + r.width / 2 - window.innerWidth / 2, window.innerWidth / 2);
  const dy = clamp(r.top + r.height / 2 - window.innerHeight / 2, window.innerHeight / 2);
  return `calc(50% + ${Math.round(dx)}px) calc(50% + ${Math.round(dy)}px)`;
}

export function BookTrigger({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState<string>();

  return (
    <Dialog
      onOpenChange={(open) => {
        // Measured as it opens, not once on mount: these triggers move with
        // the page, and two of them are fixed to the viewport.
        if (open) setOrigin(anchorFrom(triggerRef.current));
      }}
    >
      <DialogTrigger asChild>
        <button ref={triggerRef} type="button" className={className}>
          {children}
        </button>
      </DialogTrigger>

      <DialogContent style={{ transformOrigin: origin }}>
        <DialogTitle>Book a free consultation</DialogTitle>
        <DialogDescription>
          A 20-minute call, no obligation. Four questions and Sonny or Dhruv will come back to you.
        </DialogDescription>

        <div className="mt-[26px]">
          <LeadForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
