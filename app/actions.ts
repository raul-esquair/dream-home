"use server";

import { headers } from "next/headers";
import { leadIntents, publishedContact } from "@/lib/content";
import { emailLead, pacificTime, pushLead } from "@/lib/leads";

export type LeadValues = { name: string; email: string; phone: string; intent: string };

export type LeadState = {
  status: "idle" | "sent" | "error";
  message?: string;
  /** Echoed back on error so the form can refill itself — React clears an
   *  uncontrolled form once the action resolves — and on success so the
   *  confirmation can name the address we will reply to. */
  values?: LeadValues;
  /** Failed-attempt counter. The form keys off it to remount and pick the
   *  echoed values back up. */
  attempt?: number;
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^[\d\s()+.\-]{7,}$/;

/**
 * Lead capture for the homepage form. Leads go to Drew — an email and an ntfy
 * push, same as /preapproval (lib/leads.ts) — so delivery failing must never
 * look like success.
 */
export async function submitLead(prev: LeadState, formData: FormData): Promise<LeadState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const intent = String(formData.get("intent") ?? "");

  const values: LeadValues = { name, email, phone, intent };
  const fail = (message: string): LeadState => ({
    status: "error",
    message,
    values,
    attempt: (prev.attempt ?? 0) + 1,
  });

  // Honeypot. Humans never see this field; bots fill every input they find.
  // Answer as if it worked so the bot has nothing to learn from — but send
  // nothing, so a bot never rings Drew's phone.
  if (String(formData.get("company") ?? "")) return { status: "sent", values };

  if (!name) return fail("Please add your name.");
  if (!EMAIL.test(email)) return fail("Please add a valid email address.");
  if (phone && !PHONE.test(phone)) return fail("Please check that phone number.");
  if (!leadIntents.includes(intent)) return fail("Please choose where you are in the process.");

  // A US number dials as +1 and ten digits; anything else keeps its own digits.
  const digits = phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const tel = !phone ? null : digits.length === 10 ? `+1${digits}` : phone.replace(/[^\d+]/g, "");

  const submittedAt = new Date();
  const h = await headers();

  const delivered = await emailLead({
    source: "lead",
    subject: `NEW HOMEPAGE LEAD — reply within 1 business day: ${name}`,
    replyTo: email,
    text: [
      name,
      tel ? `Call: ${phone}   (tel:${tel})` : "Phone: not given",
      `Email: ${email}`,
      "",
      `Where they are:   ${intent}`,
      "",
      `Submitted ${pacificTime(submittedAt)} Pacific. The page promised a reply within one business day.`,
      `IP: ${h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
      `User agent: ${h.get("user-agent") ?? "unknown"}`,
      "",
      "Sent from dreamhome homepage — Book a consultation",
    ].join("\n"),
  });

  if (!delivered) {
    return fail(`That didn’t go through on our end. Please email Dhruv at ${publishedContact.email}.`);
  }

  // Default priority, not urgent: the homepage promises a reply within a
  // business day, not a five-minute call, so this shouldn't pop over or wake
  // anyone at night.
  await pushLead({
    source: "lead",
    title: `New homepage lead: ${name}`,
    message: [tel ? `${name} · ${phone}` : name, email, intent, "Reply within one business day."].join("\n"),
    priority: 3,
    click: tel ? `tel:${tel}` : `mailto:${email}`,
    actions: [
      ...(tel ? [{ action: "view" as const, label: `Call ${name.split(/\s+/)[0]}`, url: `tel:${tel}` }] : []),
      { action: "view", label: "Email", url: `mailto:${email}` },
    ],
  });

  return { status: "sent", values };
}
