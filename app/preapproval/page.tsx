import type { Metadata } from "next";
import Image from "next/image";
import { PreapprovalForm } from "@/components/preapproval/PreapprovalForm";
import { PreapprovalFaq } from "@/components/preapproval/PreapprovalFaq";
import { PreapprovalBar } from "@/components/preapproval/PreapprovalBar";
import { PreapprovalFooter } from "@/components/preapproval/PreapprovalFooter";
import { HeroSub } from "@/components/preapproval/live";
import { HeroBackdrop } from "@/components/preapproval/HeroBackdrop";
import { PreapprovalHeader } from "@/components/preapproval/PreapprovalHeader";
import { PhoneIcon } from "@/components/preapproval/PhoneIcon";
import { site } from "@/lib/content";
import {
  benefits,
  googleReviewsHref,
  licensing,
  phone,
  reviewSummary,
  reviews,
  steps,
  youGet,
} from "@/lib/preapproval";

const title = "Start Your Home Loan Preapproval — Dream Home, Tracy CA";
const description =
  "Get preapproved, find the home and close with one team. Dhruv Goswamy calls you back within 5 minutes during business hours.";

export const metadata: Metadata = {
  // Share previews need absolute URLs. Set NEXT_PUBLIC_SITE_URL to the live
  // domain in production; locally the preview points at the dev server.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  alternates: { canonical: "/preapproval" },
  // An ad destination, not a search entry point: the homepage stays the
  // organic front door, and ad-specific promises stay out of search results.
  robots: { index: false, follow: false },
  // What a text message, Facebook or LinkedIn shows when the link is shared.
  openGraph: {
    type: "website",
    url: "/preapproval",
    siteName: site.name,
    title,
    description,
    images: [
      {
        url: "/assets/og-preapproval.jpg",
        width: 1200,
        height: 630,
        alt: "A two-story home at dusk with its windows and porch lights on",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/og-preapproval.jpg"],
  },
};

/**
 * "Get Preapproved" landing page for Google search ads. One job: turn a
 * visitor into a completed form or a phone call. No menu, no links out.
 *
 * Deliberately light next to the homepage — no footage, no scroll-driven
 * scenes, no motion library — because paid clicks land on mid-range phones
 * and every second of load costs conversions.
 *
 * Plan and client answers: docs/preapproval-page.md.
 */
export default function PreapprovalPage() {
  const { agent } = licensing;
  return (
    <div className="pa-page">
      <HeroBackdrop />
      <PreapprovalHeader />

      <main className="relative z-[1]">
        {/* ---------------- Hero + form ---------------- */}
        {/* Three grid areas so phones can put the form straight after the
            promise: side by side on wide screens (top / bottom beside the form),
            stacked top → form → bottom below 1100px. Before this the first
            question sat 1,038px down on a 390×844 phone — 1.23 screens. */}
        <section id="top" className="pa-hero mx-auto max-w-[1240px] px-10 pt-16 pb-6 max-mobile:px-5 max-mobile:pt-8">
          <div className="pa-hero-top flex flex-col pt-8 max-wide:pt-0">
            {/* Hidden on phones: it bought the first answer chips a place on
                the first screen, and the proof strip under the form says the
                same thing ("Local since 2013"). */}
            <span className="mb-6 inline-flex items-center gap-[10px] self-start rounded-full border border-[rgba(197,179,234,.4)] bg-[rgba(124,92,196,.14)] px-4 py-[7px] font-mono text-[10.5px] tracking-[.2em] text-purple-soft uppercase max-mobile:hidden">
              Family-run in Tracy since {site.founded}
            </span>

            {/* Sized so "Close With One Team." holds one line in the two-column
                hero; at 4.6vw it orphaned "Team." on a fourth line. */}
            <h1 className="mb-5 font-display text-[clamp(38px,3.9vw,58px)] leading-[1.06] tracking-[-.015em] text-text-strongest max-wide:text-[clamp(36px,6.4vw,60px)]">
              Get Preapproved.
              <br />
              Find the Home.
              <br />
              <span className="shimmer-text animate-shimmer">Close With One Team.</span>
            </h1>

            <HeroSub />

            {/* The brief's first question — "what do I get" — answered in three
                concrete items rather than left to the subheadline. */}
            <ul className="flex flex-col gap-[9px]">
              {youGet.map((item) => (
                <li key={item} className="grid grid-cols-[18px_1fr] gap-[10px] text-[15.5px] leading-[1.45] text-text max-mobile:text-[15px]">
                  <svg aria-hidden viewBox="0 0 16 16" className="mt-[3px] h-4 w-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 8.5 3 3 7-7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="pa-hero-form">
            <PreapprovalForm />
          </div>

          <div className="pa-hero-bottom flex flex-col gap-7">
            <a
              href={`tel:${phone.tel}`}
              className="pressable inline-flex min-h-[54px] items-center gap-2 self-start rounded-full border border-[rgba(233,200,119,.34)] px-7 text-[16px] text-gold-ghost transition-[border-color,background-color,color] duration-300 hover:border-[rgba(233,200,119,.7)] hover:bg-[rgba(233,200,119,.08)] hover:text-gold-pale"
            >
              <PhoneIcon />
              Rather talk? Call {phone.display}
            </a>

            <div className="flex items-center gap-4 border-t border-[rgba(255,255,255,.1)] pt-6">
              <Avatar size={52} />
              <p className="text-[14.5px] leading-[1.55] text-muted-2">
                <span className="text-text">{agent.name}</span> is licensed for real estate{" "}
                <em className="not-italic">and</em> home loans. Use one service or both. It&rsquo;s
                always your choice.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- Proof strip ---------------- */}
        <section aria-label="About Dream Home" className="mx-auto max-w-[1240px] px-10 pt-10 max-mobile:px-5">
          <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline max-wide:grid-cols-2">
            <Stat term="Local since" value={String(site.founded)} />
            <Stat term="Family-run office" value="Tracy, CA" />
            <Stat term="Towns we serve" value="6" note="Tracy · Modesto · Lathrop · Manteca · Stockton · Patterson" />
            <div className="flex flex-col justify-center gap-1 bg-bg px-6 py-5">
              <dt className="font-mono text-[10px] tracking-[.2em] text-label uppercase">Google reviews</dt>
              <dd>
                <a
                  href={googleReviewsHref}
                  target="_blank"
                  rel="noopener"
                  className="font-display text-[20px] text-gold-soft hover:text-gold-pale"
                >
                  {reviewSummary ? `${reviewSummary.rating} ★ · ${reviewSummary.count}` : "Read our reviews"}{" "}
                  <span aria-hidden className="text-[15px]">&#8599;</span>
                </a>
              </dd>
            </div>
          </dl>

          {reviews.length > 0 && (
            <ul className="mt-6 grid grid-cols-3 gap-4 max-wide:grid-cols-1">
              {reviews.map((r) => (
                <li key={r.name} className="rounded-2xl border border-hairline bg-surface p-6">
                  <p className="font-display text-[17px] leading-[1.5] text-quote">&ldquo;{r.quote}&rdquo;</p>
                  <p className="mt-4 font-mono text-[10px] tracking-[.18em] text-label uppercase">
                    {r.name} &middot; {r.town} &middot; Google
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------------- Why one team ----------------
            Straight after the proof: this is the reason to pick Dream Home
            over Rocket or Zillow, which a "get preapproved" searcher is
            weighing. Why-preapprove moved below — they already decided that. */}
        <section className="pa-section">
          <div className="grid grid-cols-[.9fr_1.1fr] gap-14 max-wide:grid-cols-1 max-wide:gap-8">
            <div>
              <SectionHead eyebrow="Why Dream Home" title="One person. Both sides of your purchase." />
              {/* The home, the person, the loan paperwork in one ring — the
                  section's claim drawn, so it gets a description. */}
              <Image
                src="/assets/one-person.png"
                alt="Illustration of a home, Dhruv and an approved loan document inside one circle"
                width={960}
                height={449}
                sizes="(max-width: 860px) calc(100vw - 40px), 440px"
                className="mb-8 h-auto w-full max-w-[440px] max-mobile:mb-7"
              />
              <div className="flex max-w-[34em] flex-col gap-4 text-[16.5px] leading-[1.7] text-muted-2">
                <p>
                  Most buyers juggle an agent from one company and a lender from another, and the
                  handoffs are where deadlines slip and seller credits go unused.
                </p>
                <p>
                  {agent.name} is licensed for both real estate and home loans, working from Dream
                  Home&rsquo;s family-run Tracy office, open since {site.founded}. The person who
                  negotiates your purchase can arrange your loan too.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 max-mobile:grid-cols-1">
                <Side
                  label="The home"
                  items={[
                    "Find homes in the range you’re approved for",
                    "Negotiate the price and any seller credits",
                    "Keep inspections and escrow deadlines on track",
                  ]}
                />
                <Side
                  label="The loan"
                  items={[
                    "Compare loan programs across multiple lenders",
                    "Check down payment assistance you may qualify for",
                    "Put seller credits toward closing costs or a rate buydown, where it makes sense",
                  ]}
                />
              </div>
              <p className="rounded-2xl border border-[rgba(233,200,119,.3)] bg-[rgba(201,162,39,.07)] px-6 py-5 text-[16px] leading-[1.65] text-gold-soft">
                Because the same person negotiates the credit and structures the loan, the credit gets
                written to fit the loan instead of being lost between two companies.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-2xl border border-hairline bg-surface p-4">
                <Avatar size={56} />
                <div className="flex-1 leading-[1.45]">
                  <p className="text-[16px] text-text">{agent.name}</p>
                  <p className="text-[13.5px] text-muted">Real estate &amp; home loans</p>
                  <p className="font-mono text-[11px] tracking-[.06em] text-label">
                    DRE # {agent.dre ?? "pending"} &middot;{" "}
                    {agent.nmls ? `NMLS # ${agent.nmls}` : `Dream Home NMLS # ${licensing.companyNmls}`}
                  </p>
                </div>
                <a
                  href={`tel:${phone.tel}`}
                  className="pressable inline-flex items-center gap-2 rounded-full border border-[rgba(233,200,119,.34)] px-5 py-[10px] text-[14.5px] whitespace-nowrap text-gold-soft hover:border-[rgba(233,200,119,.7)] hover:text-gold-pale"
                >
                  <PhoneIcon />
                  {phone.display}
                </a>
              </div>
              <p className="text-[13.5px] leading-[1.6] text-label">
                You&rsquo;re free to choose any agent or lender. Using one of our services never
                requires using the other.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section className="pa-section">
          <SectionHead eyebrow="How it works" title="Three steps to your letter" />
          {/* A real sequence, so it keeps its numbers — the icons say what
              each step is, the "Step n" label says where it falls. Icons are
              decorative (empty alt): the title carries the meaning. */}
          <ol className="grid grid-cols-3 gap-4 max-wide:grid-cols-1">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-7 max-wide:flex-row max-wide:items-start max-wide:gap-5 max-mobile:p-6"
              >
                {/* 64px: the line art is drawn fine, and at 56 its strokes
                    thinned to about 1.5px beside 17.5px headings. */}
                <Image src={s.icon} alt="" width={64} height={64} className="h-16 w-16 shrink-0" />
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10.5px] tracking-[.2em] text-gold uppercase">
                    Step {i + 1}
                  </span>
                  <h3 className="text-[17.5px] font-medium text-text-strong">{s.title}</h3>
                  <p className="text-[15.5px] leading-[1.65] text-muted-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- Why preapproval first ----------------
            Compact and low on purpose: a visitor from a "get preapproved"
            search has already bought the idea. Kept for the few still
            deciding, at a quarter of its old height on a phone. */}
        <section className="pa-section">
          <SectionHead eyebrow="Before you shop" title="Why preapproval comes first" />
          {/* Four peers, not a sequence — unnumbered on purpose. The client's
              icons replace the gold rule that used to head each item; both at
              once was one marker too many for a one-line item. */}
          <ul className="grid grid-cols-4 gap-8 max-wide:grid-cols-2 max-mobile:gap-x-5 max-mobile:gap-y-8">
            {benefits.map((b) => (
              <li key={b.title} className="flex flex-col gap-2">
                <Image src={b.icon} alt="" width={48} height={48} className="mb-2 h-12 w-12 max-mobile:h-11 max-mobile:w-11" />
                <h3 className="text-[16.5px] font-medium leading-[1.3] text-text-strong">{b.title}</h3>
                <p className="text-[14.5px] leading-[1.55] text-muted-2">{b.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="pa-section">
          <div className="grid grid-cols-[.8fr_1.2fr] items-start gap-14 max-wide:grid-cols-1 max-wide:gap-8">
            <div>
              <SectionHead eyebrow="Questions" title="Straight answers before you start" />
              <p className="text-[16px] leading-[1.65] text-muted-2">
                Rather talk it through? Call{" "}
                <a href={`tel:${phone.tel}`} className="whitespace-nowrap">
                  {phone.display}
                </a>
                .
              </p>
            </div>
            <PreapprovalFaq />
          </div>
        </section>

        {/* ---------------- Final CTA ---------------- */}
        <section className="pa-section">
          <div className="pa-cta relative isolate flex flex-col items-center gap-6 overflow-hidden rounded-[28px] border border-[rgba(233,200,119,.25)] px-8 py-16 text-center max-mobile:px-5 max-mobile:py-12">
            {/* A dark-centred panorama: dusk garden on the left, a lit front
                door on the right, and nothing behind the centred copy. Scrim
                in globals.css (.pa-cta::after), measured like the hero's.
                Decorative, below the fold, so lazy and empty alt. */}
            <Image
              src="/assets/cta-dusk-entry.jpg"
              alt=""
              fill
              sizes="(max-width: 860px) calc(100vw - 40px), 1160px"
              className="pa-cta-photo -z-10"
            />
            <h2 className="max-w-[16ch] font-display text-[clamp(32px,3.6vw,48px)] leading-[1.1] text-text-strongest">
              Ready to see what you can afford?
            </h2>
            <p className="max-w-[32em] text-[17px] leading-[1.65] text-muted-2">
              Three quick steps, and {agent.firstName} calls you back. No credit check to start.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#start"
                className="btn-gold inline-flex min-h-[54px] items-center gap-2 rounded-full px-8 text-[16px] font-semibold hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(201,162,39,.3)]"
              >
                Start Your Preapproval <span aria-hidden>&#8593;</span>
              </a>
              <a
                href={`tel:${phone.tel}`}
                className="pressable inline-flex min-h-[54px] items-center gap-2 rounded-full border border-[rgba(233,200,119,.34)] px-7 text-[16px] text-gold-ghost hover:border-[rgba(233,200,119,.7)] hover:text-gold-pale"
              >
                <PhoneIcon />
                Call {phone.display}
              </a>
            </div>
          </div>
        </section>
      </main>

      <PreapprovalFooter />
      <PreapprovalBar />
    </div>
  );
}

/** Dhruv's portrait in a gold ring, or his initials on the striped placeholder until one exists. */
function Avatar({ size }: { size: number }) {
  const { agent } = licensing;
  const ring = "shrink-0 rounded-full border-[1.5px] border-[rgba(233,200,119,.55)]";
  if (agent.photo) {
    return (
      <Image
        src={agent.photo}
        alt={agent.name}
        width={size}
        height={size}
        className={`${ring} object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`${ring} placeholder-avatar flex items-center justify-center font-mono text-[9px] tracking-[.1em] text-label`}
      style={{ width: size, height: size }}
    >
      {agent.initials}
    </span>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-9 max-mobile:mb-7">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="max-w-[20ch] font-display text-[clamp(30px,3.2vw,44px)] leading-[1.12] tracking-[-.01em] text-text-strong">
        {title}
      </h2>
    </div>
  );
}

function Stat({ term, value, note }: { term: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col justify-center gap-1 bg-bg px-6 py-5">
      <dt className="font-mono text-[10px] tracking-[.2em] text-label uppercase">{term}</dt>
      <dd className="font-display text-[20px] text-gold-soft">{value}</dd>
      {note && <dd className="text-[12.5px] leading-[1.5] text-muted">{note}</dd>}
    </div>
  );
}

function Side({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6">
      <p className="mb-4 font-mono text-[10.5px] tracking-[.22em] text-purple-soft uppercase">{label}</p>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[14px_1fr] gap-3 text-[15px] leading-[1.6] text-muted-2">
            <span aria-hidden className="mt-[9px] h-[6px] w-[6px] rounded-full bg-gold" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
