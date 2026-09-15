/**
 * Content for the "Get Preapproved" landing page (/preapproval).
 *
 * The client answers behind every value here, and what is still pending, are in
 * docs/preapproval-page.md. Two rules bind all copy on this page — read the
 * "Where the brief runs into the ad rules" section of the plan before editing:
 *   - No rates, payments or down-payment amounts/percentages. Any of them is a
 *     Reg Z "triggering term" and drags in APR and full repayment disclosures.
 *   - Never imply approval is quick, likely or given by Dream Home. Dream Home
 *     brokers loans; lenders approve them (DRE Reg 2848).
 */

export const phone = {
  display: "(209) 627-5011",
  tel: "+12096275011",
};

/** When the 5-minute callback promise holds. Pacific time. */
export const callbackHours = {
  label: "Mon–Fri, 8am–6pm",
  days: [1, 2, 3, 4, 5],
  open: 8,
  close: 18,
};

/**
 * TODO before launch — every null renders as "pending" so an incomplete footer
 * is obvious rather than silently missing a legally required line.
 */
export const licensing = {
  /** DRE public record, checked 14 Sep 2026: corporation, licensed, expires 01/16/27. */
  companyDre: "01961783" as string | null,
  /** The corporation's MLO license endorsement on the same DRE record. */
  companyNmls: "1226033" as string | null,
  /**
   * The page is Dhruv's alone — the client's call. He is licensed for both
   * real estate and loans, so "one person, both sides" is literally true.
   */
  agent: {
    name: "Dhruv Goswamy",
    firstName: "Dhruv",
    initials: "DG",
    /** 120px square crop of the portrait the client sent — enough for the 52–56px
     *  avatars at 2x, no larger. A higher-resolution original would allow more. */
    photo: "/assets/dhruv.jpg" as string | null,
    /** Salesperson license. The DRE still showed "no broker affiliation" on 14 Sep
     *  2026; the client says his return to Dream Home hasn't posted yet. Re-check
     *  before ads run (docs/preapproval-page.md). */
    dre: "01959385" as string | null,
    /** His personal NMLS ID — distinct from the company's 1226033, which he works
     *  under. Until it is known the page shows the company number, labelled as such. */
    nmls: null as string | null,
  },
  /** Street address — Google's financial-services ad policy requires one on the page. */
  address: null as string | null,
  /** No privacy policy page exists yet; the footer omits the link until it does. */
  privacyHref: null as string | null,
};

export const googleReviewsHref = "https://share.google/lO25qiJHSfSkhBekj";

/**
 * Real Google reviews only, pasted in with permission. Rendered only when
 * non-empty — the homepage shipped placeholder quotes that read as genuine
 * reviews, and this page must not repeat that.
 */
export const reviews: { quote: string; name: string; town: string }[] = [];
export const reviewSummary = null as { rating: string; count: string } | null;

/* ------------------------------------------------------------------ *
 * Form options. Shared by the form and the server action, which
 * rejects anything not in these lists.
 * ------------------------------------------------------------------ */

export const timeframes = ["0–3 months", "3–6 months", "6–12 months", "Just exploring"] as const;
export const firstHomeOptions = ["Yes", "No", "Not sure"] as const;
export const areas = [
  "Tracy",
  "Modesto",
  "Lathrop",
  "Manteca",
  "Stockton",
  "Patterson",
  "Somewhere else",
] as const;
/**
 * The breaks are routing, not copy: $500K is where San Joaquin County's
 * down payment assistance stops ($499,700 price cap), ~$700K is the FHA
 * ceiling ($678,500 limit at the minimum down payment), ~$850K the
 * conforming ceiling ($832,750). Never explain them on the page — the
 * down-payment percentages would be triggering terms.
 */
export const priceRanges = ["Under $500K", "$500K–$700K", "$700K–$850K", "$850K+", "Not sure yet"] as const;

export const consentText =
  "Dream Home Real Estate & Home Loans may call or text me about my home search at the number above, including by automated calls or texts. Consent is not required to buy anything. Msg & data rates may apply. Reply STOP to opt out.";

/* ------------------------------------------------------------------ *
 * Page copy
 * ------------------------------------------------------------------ */

/**
 * Kept short and placed low: visitors arrive from a "get preapproved" search,
 * so they have already decided preapproval is worth it. One line each.
 */
export const benefits = [
  { icon: "/assets/benefit-budget.png", title: "Know your budget", body: "Shop in the range that fits before you fall for a house." },
  { icon: "/assets/benefit-offers.png", title: "Make stronger offers", body: "Sellers pick the offer most likely to close." },
  { icon: "/assets/benefit-payment.png", title: "Understand your payment", body: "Taxes and insurance included, so the number is real." },
  { icon: "/assets/benefit-fast.png", title: "Move fast", body: "Write an offer the day you find the home." },
];

/** What the visitor walks away with — the brief's "what do I get". */
export const youGet = [
  "Your buying-power range",
  "Loan programs that fit you, including down payment help",
  "Your preapproval letter, often the same day your documents are in",
];

/** Icons: the client's set, cropped to one shared frame so stroke weights match. */
export const steps = [
  {
    icon: "/assets/step-talk.png",
    title: "Tell us about your goals",
    body: "Answer a few quick questions. Dhruv calls you within 5 minutes during business hours.",
  },
  {
    icon: "/assets/step-documents.png",
    title: "Review loan options and buying power",
    body: "We compare programs across lenders, including local down payment assistance. It starts with a soft credit check that won’t affect your score.",
  },
  {
    icon: "/assets/step-letter.png",
    title: "Get preapproved and start shopping",
    body: "Send your documents and your letter is often ready the same day. Then we start touring homes.",
  },
];

export const faqs = [
  {
    q: "Does preapproval hurt my credit?",
    a: "Starting doesn’t. We begin with a soft credit check, which has no effect on your score. A hard credit check happens only when you’re ready for the full preapproval, and it may lower your score slightly. Scoring models count several mortgage checks within a short window as one, so it’s best to compare lenders within about two weeks.",
  },
  {
    q: "How long does it take?",
    a: "Once we have your documents — usually recent pay stubs, W-2s and bank statements — your preapproval letter is often ready the same day. Every preapproval is subject to credit review, verification and lender approval.",
  },
  {
    q: "How much do I need for a down payment?",
    a: "Less than many people expect. Some loan programs allow a low down payment, and San Joaquin County offers down payment assistance for homes under $500K. We’ll show you which options fit your situation.",
  },
  {
    q: "Can you help me find the home too?",
    a: "Yes. Dhruv is licensed for both real estate and home loans, so the same person can take you from preapproval to keys. Using one of our services never requires using the other.",
  },
  {
    q: "What if I’m not ready to buy yet?",
    a: "That’s fine — most people start months ahead. A preapproval shows where you stand today and what to work on, whichever way rates move. There’s no obligation to buy.",
  },
];

/**
 * Where "now" sits against the callback promise, in Pacific time:
 *   open      inside hours — the 5-minute promise applies
 *   today     a weekday before opening
 *   tomorrow  after closing, and the next day is a workday
 *   monday    after Friday's close, or on a weekend day before Sunday
 */
export type CallbackStatus = "open" | "today" | "tomorrow" | "monday";

export function callbackStatus(now: Date = new Date()): CallbackStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? -1);
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const workday = (d: number) => callbackHours.days.includes(d);

  if (workday(day) && hour >= callbackHours.open && hour < callbackHours.close) return "open";
  if (workday(day) && hour < callbackHours.open) return "today";
  return workday((day + 1) % 7) ? "tomorrow" : "monday";
}

/** True when a lead submitted at `now` falls inside the callback promise. */
export function inCallbackHours(now: Date = new Date()): boolean {
  return callbackStatus(now) === "open";
}

/**
 * Cities the page can name when an ad links with `?city=`. A whitelist, never
 * the raw parameter: anything else in the URL would let a crafted link put
 * arbitrary words in our headline.
 */
export const adCities = areas.filter((a) => a !== "Somewhere else");
