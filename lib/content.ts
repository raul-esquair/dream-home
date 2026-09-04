/**
 * Page content. Everything here is placeholder data from the design handoff
 * and should be replaced before launch:
 *   - listings  -> IDX/MLS feed
 *   - posts     -> MDX or CMS
 *   - testimonials -> real, attributable reviews
 *   - proof     -> real rating, review source and families-helped figure
 * See README.md "Placeholders & open items".
 */

export const site = {
  name: "Dream Home Real Estate & Home Loans",
  wordmark: "Dream Home",
  tagline: "Real Estate & Home Loans",
  founded: 2013,
  city: "Tracy, California",
  agents: [
    { name: "Sonny", email: "SonnyGoswamy@comcast.net" },
    { name: "Dhruv", email: "Dreamhomedrew@gmail.com" },
  ],
  /** TODO: no phone number supplied yet. Once it is, the mobile "Call"
   *  button and a header phone link should point at `tel:`. */
  phone: null as string | null,
  /** TODO: real DRE and NMLS numbers for the footer. */
  license: "DRE + NMLS # TBD",
};

/**
 * The only inbox published on the page — the FAQ and the closing CTA both use
 * it. Two addresses next to the primary button gave visitors a lower-intent,
 * untrackable alternative to clicking it; both agents are still named
 * throughout, they just share one published address.
 */
export const publishedContact = site.agents.find((a) => a.name === "Dhruv") ?? site.agents[0];

/** Hero proof bar. These were prototype props; they are content, not props. */
export const proof = {
  rating: "5",
  reviewSource: "Google reviews · TBD",
  familiesHelped: "250+",
};

export const serviceAreas = [
  "Tracy",
  "Stockton",
  "Lathrop",
  "Patterson",
  "South Bay",
  "East Bay",
  "Manteca",
  "Mountain House",
];

export type Listing = {
  tag: string;
  city: string;
  street: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  photoLabel: string;
};

export const listings: Listing[] = [
  {
    tag: "New",
    city: "Tracy",
    street: "Berkshire Estates · 4 bd craftsman",
    price: "$689,000",
    beds: "4",
    baths: "3",
    sqft: "2,410",
    photoLabel: "listing photo → front elevation",
  },
  {
    tag: "Open Sat",
    city: "Lathrop",
    street: "River Islands · waterfront lot",
    price: "$742,500",
    beds: "4",
    baths: "3",
    sqft: "2,780",
    photoLabel: "listing photo → backyard + water",
  },
  {
    tag: "Starter",
    city: "Stockton",
    street: "Brookside · single story",
    price: "$429,000",
    beds: "3",
    baths: "2",
    sqft: "1,540",
    photoLabel: "listing photo → kitchen",
  },
];

export const processSteps = [
  {
    title: "Free consultation",
    body: "Twenty minutes on the phone. Budget, timeline, credit, and what you actually want in a house.",
  },
  {
    title: "Pre-approval",
    body: "We handle the loan side in house, so your offer is credible the day you write it.",
  },
  {
    title: "Tour and offer",
    body: "We show homes on your schedule and write offers that hold up in a competitive market.",
  },
  {
    title: "Close and move in",
    body: "One team through escrow, appraisal and signing. You get keys, not a runaround.",
  },
];

/**
 * Placeholder quotes — replace with real, attributable reviews before launch.
 * `pages` is the number of paper layers drawn behind the card in
 * <Testimonials>; varying it stops the row reading as eight identical slabs.
 * It is presentation, but it belongs with the quote it describes.
 */
export const testimonials = [
  {
    quote:
      "We had no idea where to start. Sonny explained every line of the loan estimate and never made us feel dumb.",
    attribution: "First-time buyers \u00b7 Tracy",
    pages: 22,
  },
  {
    quote:
      "Having the agent and the lender be the same team saved us at least two weeks during escrow.",
    attribution: "Buyer \u00b7 Lathrop",
    pages: 16,
  },
  {
    quote: "Dhruv found us a house under budget and we closed in 26 days.",
    attribution: "Buyer \u00b7 Stockton",
    pages: 27,
  },
  {
    quote:
      "Our offer was the second highest and we still got the house. They knew what the seller actually cared about.",
    attribution: "Buyers \u00b7 Mountain House",
    pages: 19,
  },
  {
    quote:
      "Pre-approval on a Sunday. I sent one text and had the letter before the open house on Monday.",
    attribution: "First-time buyer \u00b7 Patterson",
    pages: 14,
  },
  {
    quote:
      "We were turned down by a big bank and assumed that was that. Sonny found a program we qualified for the same week.",
    attribution: "Buyers \u00b7 Manteca",
    pages: 25,
  },
  {
    quote:
      "They talked us out of a house. Third showing, and Dhruv told us what the foundation was going to cost us later.",
    attribution: "Buyers \u00b7 Tracy",
    pages: 18,
  },
  {
    quote:
      "My parents bought through them in 2015 and I bought through them last spring. Same two people, same phone numbers.",
    attribution: "Repeat client \u00b7 Stockton",
    pages: 30,
  },
];

export const faqs = [
  {
    q: "How much do I actually need for a down payment?",
    a: "Less than most people think. First-time buyer programs in California can start at 3 to 5 percent, and some loans go lower. We will map your options on the first call.",
  },
  {
    q: "Should I get pre-approved before I look at homes?",
    a: "Yes. Pre-approval tells you your real budget and makes your offer competitive. Most of our buyers are pre-approved within 48 hours.",
  },
  {
    q: "What credit score do I need?",
    a: "Many programs work from the low 600s. If you are below that, we will tell you exactly what to fix and roughly how long it takes.",
  },
  {
    q: "Why use one team for the home and the loan?",
    a: "Fewer handoffs. Your agent and your lender are looking at the same file, so deadlines in escrow do not slip while two companies email each other.",
  },
  {
    q: "What does it cost to work with you as a buyer?",
    a: "The consultation is free and buyer representation is typically paid at closing. We will put the numbers in writing before you commit to anything.",
  },
];

export const posts = [
  {
    kicker: "Guide",
    title: "The real cost of buying in Tracy in 2026",
    excerpt:
      "Down payment, closing costs, taxes and what to budget monthly beyond the mortgage.",
    href: "#",
  },
  {
    kicker: "Loans",
    title: "FHA vs conventional for first-time buyers",
    excerpt: "A plain comparison of the two loans we quote most often, with real numbers.",
    href: "#",
  },
  {
    kicker: "Market",
    title: "Where inventory is opening up in San Joaquin County",
    excerpt:
      "A quarterly look at which neighborhoods are giving buyers room to negotiate.",
    href: "#",
  },
];

export const leadIntents = [
  "I am just starting to look",
  "I want to get pre-approved",
  "I found a home already",
  "I am selling too",
];
