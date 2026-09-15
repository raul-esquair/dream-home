/**
 * Lead delivery shared by every form on the site — the homepage consultation
 * form and /preapproval. Each form writes its own email and push; this file
 * only sends them. Server-only: call it from a server action.
 *
 * The email is the record; the push is the alarm. Send the push only after the
 * email is accepted, so Drew never gets a push for a lead the visitor was told
 * had failed.
 */

/** Pacific wall-clock time for a lead email, e.g. "Sep 15, 2026, 9:04 AM". */
export function pacificTime(date: Date) {
  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export type LeadEmail = {
  /** Log prefix, e.g. "preapproval" — says which form a failure came from. */
  source: string;
  subject: string;
  text: string;
  /** The visitor's address, so Drew can answer with Reply. */
  replyTo: string;
};

/**
 * Emails a lead through Resend's HTTP API — no SDK, one fetch, so swapping
 * providers later touches only this function.
 *
 *   RESEND_API_KEY   required in production
 *   LEAD_EMAIL_TO    defaults to Drew's address
 *   LEAD_EMAIL_FROM  a sender on a domain verified in Resend
 *
 * Without a key, development logs the email and reports success so the flow
 * can be exercised; production refuses, so a missing key surfaces as a visible
 * error rather than leads vanishing into a log.
 */
export async function emailLead({ source, subject, text, replyTo }: LeadEmail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[${source}] RESEND_API_KEY is not set — lead NOT delivered`, { subject });
      return false;
    }
    console.info(`[${source}] (dev, not emailed)\nSubject: ${subject}\n\n${text}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_EMAIL_FROM ?? "Dream Home Leads <onboarding@resend.dev>",
        to: [process.env.LEAD_EMAIL_TO ?? "Dreamhomedrew@gmail.com"],
        reply_to: replyTo,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error(`[${source}] Resend rejected the lead`, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[${source}] could not reach Resend`, err);
    return false;
  }
}

export type LeadPush = {
  source: string;
  title: string;
  message: string;
  /** ntfy priority: 5 urgent (long vibration, pop-over), 3 default. */
  priority: 1 | 2 | 3 | 4 | 5;
  /** Where tapping the notification goes — tel: or mailto:. */
  click: string;
  actions: { action: "view"; label: string; url: string; clear?: boolean }[];
};

/**
 * Push to Drew's phone through ntfy, so a lead rings in seconds instead of
 * waiting on an email notification.
 *
 *   NTFY_TOPIC   the topic's name; setting it turns pushes on
 *   NTFY_TOKEN   optional — only for a reserved (password-protected) topic
 *   NTFY_SERVER  defaults to https://ntfy.sh
 *
 * The push carries the lead's name and contact details. The client chose a
 * public topic (14 Sep 2026): on ntfy.sh anyone who knows a public topic's
 * name can read it, so THE NAME IS THE PASSWORD — keep it long and random
 * (e.g. dreamhome-leads-7fq2k9x4m8r1v6tz), never guessable, and treat it like
 * a secret in Netlify. Moving to a reserved topic later needs only NTFY_TOKEN.
 *
 * Sent as JSON, not headers: header values must be Latin-1, and a lead named
 * "Nguyễn" or a price with an en dash would make fetch throw.
 *
 * ntfy.sh keeps messages for 12 hours; the iPhone app needs that to deliver,
 * so caching is left on.
 *
 * Never throws and never holds the visitor for long: a 4-second cap, and any
 * failure is only logged — the email has already gone out.
 */
export async function pushLead({ source, ...push }: LeadPush): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    if (process.env.NODE_ENV !== "production") console.info(`[${source}] (dev) push skipped — NTFY_TOPIC not set`);
    return;
  }
  const token = process.env.NTFY_TOKEN;

  const server = (process.env.NTFY_SERVER ?? "https://ntfy.sh").replace(/\/+$/, "");
  try {
    const res = await fetch(`${server}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ topic, tags: ["house"], ...push }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error(`[${source}] ntfy rejected the push`, res.status, await res.text());
  } catch (err) {
    console.error(`[${source}] could not reach ntfy`, err);
  }
}
