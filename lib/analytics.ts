/**
 * Google Ads measurement. One rule: the only conversion is a preapproval form
 * that was validated and delivered. Page views, button taps and calls from the
 * page are never sent as conversions.
 *
 * How a conversion reaches Google Ads:
 *   1. `submitPreapproval` delivers the lead, sets a short-lived one-time
 *      cookie (site-wide path — see the note in actions.ts), and redirects to
 *      the thank-you page.
 *   2. <ConversionPing> on the thank-you page finds the cookie, deletes it, and
 *      sends one `conversion` event with the lead's id as `transaction_id`.
 * A direct visit, a refresh, or the back button finds no cookie and sends
 * nothing; the transaction id lets Google drop any duplicate that slips through.
 */

export const GOOGLE_ADS_ID = "AW-18451645072";

/**
 * The conversion action's label — the part after the slash in the event
 * snippet's `send_to: 'AW-18451645072/<label>'`. Google Ads → Goals →
 * Conversions → (the preapproval action) → Tag setup → "Use Google tag".
 * Until it is set, the thank-you page logs a warning and sends nothing.
 */
export const PREAPPROVAL_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GADS_PREAPPROVAL_LABEL ?? null;

export const THANK_YOU_PATH = "/preapproval-thank-you";
export const CONVERSION_COOKIE = "pa_conversion";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
