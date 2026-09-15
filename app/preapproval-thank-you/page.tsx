import type { Metadata } from "next";
import { ConversionPing } from "@/components/preapproval/ConversionPing";
import { HeroBackdrop } from "@/components/preapproval/HeroBackdrop";
import { PhoneIcon } from "@/components/preapproval/PhoneIcon";
import { PreapprovalFooter } from "@/components/preapproval/PreapprovalFooter";
import { PreapprovalHeader } from "@/components/preapproval/PreapprovalHeader";
import { CallbackLine } from "@/components/preapproval/live";
import { licensing, phone } from "@/lib/preapproval";

export const metadata: Metadata = {
  title: "You’re on our list — Dream Home, Tracy CA",
  // Reachable only after a submission; never an entry point from search.
  robots: { index: false, follow: false },
};

/**
 * Where a delivered preapproval lead lands (the server action redirects here).
 * Its URL is what Google Ads sees, but a visit alone is never a conversion —
 * <ConversionPing> sends one only when the submission's one-time cookie is
 * present. See lib/analytics.ts.
 *
 * Nothing personal is shown or passed in the URL: the page doesn't know who
 * submitted, and doesn't need to.
 */
export default function PreapprovalThankYouPage() {
  const name = licensing.agent.firstName;
  return (
    <div className="pa-page">
      <HeroBackdrop />
      <PreapprovalHeader />

      <main className="relative z-[1] mx-auto max-w-[640px] px-10 pt-20 max-mobile:px-5 max-mobile:pt-12">
        <div className="pa-card flex flex-col gap-6">
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(233,200,119,.35)] bg-[rgba(201,162,39,.14)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold-soft" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4 12.5 5 5L20 6.5" />
            </svg>
          </span>

          <div className="flex flex-col gap-4">
            <h1 className="font-display text-[clamp(30px,4vw,40px)] leading-[1.1] text-text-strongest">
              Thanks. You&rsquo;re on our list.
            </h1>
            {/* Live: "available now" inside Mon–Fri 8am–6pm, otherwise when
                the call will come. Same component as the form card. */}
            <CallbackLine />
            <p className="text-[15.5px] leading-[1.65] text-muted-2">
              The call comes from <span className="text-gold-soft">{phone.display}</span>. Save the
              number so you know it&rsquo;s {name} when it rings.
            </p>
          </div>

          <a
            href={`tel:${phone.tel}`}
            className="pressable inline-flex min-h-[52px] items-center gap-2 self-start rounded-full border border-[rgba(233,200,119,.34)] px-6 text-[15.5px] text-gold-ghost hover:border-[rgba(233,200,119,.7)] hover:text-gold-pale"
          >
            <PhoneIcon />
            Rather not wait? Call {phone.display}
          </a>

          <div className="border-t border-hairline pt-6">
            <h2 className="mb-3 font-mono text-[10.5px] tracking-[.2em] text-label uppercase">
              To speed up your letter, have these ready
            </h2>
            <ul className="flex flex-col gap-2 text-[15px] text-muted-2">
              <li>Your last two pay stubs</li>
              <li>W-2s from the last two years</li>
              <li>Two recent bank statements</li>
            </ul>
          </div>

          <p className="text-[12.5px] leading-[1.6] text-label">
            Preapproval is subject to credit review, verification and lender approval.
          </p>
        </div>
      </main>

      <PreapprovalFooter />
      <ConversionPing />
    </div>
  );
}
