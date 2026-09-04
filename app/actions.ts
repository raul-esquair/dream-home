"use server";

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
 * Lead capture for the homepage form.
 * TODO: email both agents and push the lead to the CRM. Until that is wired
 * the submission is only validated and logged server-side.
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

  if (!name) return fail("Please add your name.");
  if (!EMAIL.test(email)) return fail("Please add a valid email address.");
  if (phone && !PHONE.test(phone)) return fail("Please check that phone number.");

  console.info("[lead]", { name, email, phone, intent });

  return { status: "sent", values };
}
