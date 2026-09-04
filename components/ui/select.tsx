"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Select, skinned to the Dream Home tokens.
 *
 * Replaces a native `<select>`, whose dropdown is drawn by the OS and cannot be
 * styled — on Windows and Linux that menu looked nothing like the design. Radix
 * renders the menu itself, so it carries the same dark fill and gold accents as
 * the rest of the form.
 *
 * Icons are inline SVG: the handoff calls for no icon library.
 */

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={cn("size-3 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
    </svg>
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group field flex items-center justify-between gap-3 text-left",
        "data-[state=open]:border-[rgba(233,200,119,.6)] data-[state=open]:bg-[rgba(233,200,119,.05)]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Chevron className="text-gold-link transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={6}
        className={cn(
          "select-content relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width)",
          "overflow-y-auto rounded-xl border border-[rgba(255,255,255,.12)] bg-[#14121a] p-[6px]",
          "shadow-[0_24px_60px_rgba(0,0,0,.55)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="w-full">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-[14px] py-[11px]",
        "text-[15px] text-muted outline-none select-none",
        "data-highlighted:bg-[rgba(233,200,119,.08)] data-highlighted:text-gold-soft",
        "data-[state=checked]:text-gold-soft",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator asChild>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3 shrink-0 text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2 6.5 2.75 2.75L10 3.5" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
