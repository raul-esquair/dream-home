"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Dialog, skinned to the Dream Home tokens.
 *
 * Radix supplies the parts that are easy to get wrong by hand: focus trap and
 * restore, Escape and outside-click dismissal, `aria-modal`, and scroll lock.
 */

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-[80] bg-[rgba(6,5,9,.72)] backdrop-blur-[6px]"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        /* Radix isolates the page by marking siblings aria-hidden, but the
           library it uses skips any subtree holding an aria-live region — and
           <main> holds the calculator's live payment readout, so it was left
           reachable. aria-modal makes assistive tech treat everything outside
           the dialog as inert regardless. */
        aria-modal="true"
        className={cn(
          "fixed top-1/2 left-1/2 z-[90] w-[calc(100vw-32px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2",
          "max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[22px] border border-[rgba(233,200,119,.22)]",
          "bg-[rgba(12,10,16,.96)] p-[34px] shadow-[0_40px_100px_rgba(0,0,0,.65)] backdrop-blur-[18px]",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="pressable absolute top-[18px] right-[18px] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[rgba(255,255,255,.12)] text-muted transition-colors duration-200 hover:border-[rgba(233,200,119,.5)] hover:text-gold-soft"
        >
          <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-display text-[26px] leading-[1.15] text-text-strongest", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("mt-[10px] text-[15px] leading-[1.6] text-muted-2", className)}
      {...props}
    />
  );
}

export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription };
