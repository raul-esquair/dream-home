"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CONVERSION_COOKIE, THANK_YOU_PATH } from "@/lib/analytics";
import {
  areas,
  consentText,
  firstHomeOptions,
  inCallbackHours,
  phone as officePhone,
  priceRanges,
  timeframes,
} from "@/lib/preapproval";

export type PreapprovalValues = {
  timeframe: string;
  firstHome: string;
  area: string;
  price: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};

/** Success never comes back as state — it redirects to the thank-you page. */
export type PreapprovalState = {
  status: "idle" | "error";
  message?: string;
  /** Step the form should return to so the visitor can fix the problem. */
  step?: 1 | 2 | 3;
  values?: PreapprovalValues;
  attempt?: number;
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const oneOf = (list: readonly string[], value: string) => list.includes(value);

/**
 * Lead capture for /preapproval. Leads go to one inbox (the client's choice,
 * docs/preapproval-page.md) — so delivery failing must never look like success.
 */
export async function submitPreapproval(
  prev: PreapprovalState,
  formData: FormData
): Promise<PreapprovalState> {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values: PreapprovalValues = {
    timeframe: text("timeframe"),
    firstHome: text("firstHome"),
    area: text("area"),
    price: text("price"),
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    consent: formData.get("consent") === "yes",
  };

  const fail = (message: string, step: 1 | 2 | 3): PreapprovalState => ({
    status: "error",
    message,
    step,
    values,
    attempt: (prev.attempt ?? 0) + 1,
  });

  // Honeypot. Humans never see this field; bots fill every input they find.
  // Answer as if it worked so the bot has nothing to learn from — same
  // redirect, but no conversion cookie, so a bot is never counted.
  if (text("company")) redirect(THANK_YOU_PATH);

  if (!oneOf(timeframes, values.timeframe)) return fail("Choose when you’re hoping to buy.", 1);
  if (!oneOf(firstHomeOptions, values.firstHome)) return fail("Let us know if this is your first home.", 1);
  if (!oneOf(areas, values.area)) return fail("Choose where you’re looking.", 2);
  if (!oneOf(priceRanges, values.price)) return fail("Choose a price range, or “Not sure yet”.", 2);
  if (!values.name) return fail("Add your name so we know who to ask for.", 3);
  const digits = values.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits.length !== 10) return fail("Check your mobile number — we need 10 digits to call you.", 3);
  if (!EMAIL.test(values.email)) return fail("Check your email address.", 3);

  const submittedAt = new Date();
  const duringHours = inCallbackHours(submittedAt);
  const h = await headers();
  // One id per lead: it goes in Dhruv's email and to Google Ads as the
  // conversion's transaction_id, so the two can be matched and Google can
  // drop a duplicate.
  const leadId = crypto.randomUUID();

  const delivered = await deliverLead({
    leadId,
    values: { ...values, phone: formatPhone(digits) },
    tel: `+1${digits}`,
    submittedAt,
    duringHours,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    userAgent: h.get("user-agent") ?? "unknown",
  });

  if (!delivered) {
    return fail(`That didn’t go through on our end. Please call us at ${officePhone.display}.`, 3);
  }

  // Only a delivered lead earns the conversion cookie. Short-lived, and
  // <ConversionPing> deletes it on first read, so a refresh or a later visit
  // records nothing.
  //
  // Path "/" is deliberate. The redirect is a client-side navigation inside
  // the page that submitted, and Chromium binds document.cookie to the URL
  // that page loaded at (/preapproval). A cookie scoped to the thank-you path
  // was measured invisible there — and then fired on the next *direct* visit,
  // the exact case this is meant to exclude.
  (await cookies()).set(CONVERSION_COOKIE, leadId, {
    path: "/",
    maxAge: 15 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Outside any try/catch: redirect() works by throwing.
  redirect(THANK_YOU_PATH);
}

function formatPhone(d: string) {
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

type Lead = {
  leadId: string;
  values: PreapprovalValues;
  tel: string;
  submittedAt: Date;
  duringHours: boolean;
  ip: string;
  userAgent: string;
};

/**
 * Emails the lead through Resend's HTTP API — no SDK, one fetch, so swapping
 * providers later touches only this function.
 *
 *   RESEND_API_KEY   required in production
 *   LEAD_EMAIL_TO    defaults to Dhruv's address
 *   LEAD_EMAIL_FROM  a sender on a domain verified in Resend
 *
 * Without a key, development logs the email and reports success so the flow
 * can be exercised; production refuses, so a missing key surfaces as a visible
 * error rather than leads vanishing into a log.
 *
 * The email doubles as the consent record: it carries the exact consent
 * wording shown, the timestamp, IP and user agent. Keep these emails.
 */
async function deliverLead(lead: Lead): Promise<boolean> {
  const { values: v } = lead;
  const pacific = lead.submittedAt.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = lead.duringHours
    ? `NEW PREAPPROVAL LEAD — call within 5 min: ${v.name}`
    : `NEW PREAPPROVAL LEAD (after hours) — call first thing: ${v.name}`;

  const body = [
    `${v.name}`,
    `Call: ${v.phone}   (tel:${lead.tel})`,
    `Email: ${v.email}`,
    "",
    `Hoping to buy:    ${v.timeframe}`,
    `First home:       ${v.firstHome}`,
    `Looking in:       ${v.area}`,
    `Price range:      ${v.price}`,
    "",
    `Submitted ${pacific} Pacific ${lead.duringHours ? "(inside the 5-minute window)" : "(after hours — promised a call first thing next business morning)"}`,
    `Lead ID: ${lead.leadId}   (matches the Google Ads conversion's transaction ID)`,
    "",
    "— Consent record —",
    v.consent
      ? `Checked the consent box. Wording shown: "${consentText}"`
      : "Did NOT check the consent box. Manual calls only — no automated calls or texts.",
    `Timestamp: ${lead.submittedAt.toISOString()}`,
    `IP: ${lead.ip}`,
    `User agent: ${lead.userAgent}`,
    "",
    "Sent from dreamhome /preapproval",
  ].join("\n");

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error("[preapproval] RESEND_API_KEY is not set — lead NOT delivered", { name: v.name });
      return false;
    }
    console.info(`[preapproval] (dev, not emailed)\nSubject: ${subject}\n\n${body}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_EMAIL_FROM ?? "Dream Home Leads <onboarding@resend.dev>",
        to: [process.env.LEAD_EMAIL_TO ?? "Dreamhomedrew@gmail.com"],
        reply_to: v.email,
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      console.error("[preapproval] Resend rejected the lead", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[preapproval] could not reach Resend", err);
    return false;
  }
}
