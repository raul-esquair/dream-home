"use client";

import { useEffect } from "react";
import { CONVERSION_COOKIE, GOOGLE_ADS_ID, PREAPPROVAL_CONVERSION_LABEL } from "@/lib/analytics";

/**
 * Sends the Google Ads conversion — once, and only for a delivered lead.
 *
 * The server action sets a one-time cookie only after the lead email is
 * accepted, then redirects here. No cookie (a direct visit, a refresh, the back
 * button, a bot caught by the honeypot) means nothing is sent. The cookie is
 * deleted before the event goes out, so React's development double-run and any
 * re-render can't send it twice; `transaction_id` covers anything else.
 */
export function ConversionPing() {
  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONVERSION_COOKIE}=([^;]+)`));
    if (!match) return;

    const leadId = decodeURIComponent(match[1]);
    // Same attributes the server set (lib/analytics.ts, actions.ts), or the
    // browser treats this as a different cookie and the original survives.
    document.cookie = `${CONVERSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;

    if (!PREAPPROVAL_CONVERSION_LABEL) {
      console.warn(
        "[google-ads] NEXT_PUBLIC_GADS_PREAPPROVAL_LABEL is not set, so this lead was not sent as a conversion."
      );
      return;
    }

    window.gtag?.("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${PREAPPROVAL_CONVERSION_LABEL}`,
      transaction_id: leadId,
    });
  }, []);

  return null;
}
