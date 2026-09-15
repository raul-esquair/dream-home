# "Get Preapproved" landing page

**Status: live, unlinked, not launched.** `/preapproval` and `/preapproval-thank-you` are
on `main` (PR raul-esquair/dream-home#3) and deployed by Netlify at
https://dreamhomerealestateandhomeloans.com/preapproval — `noindex` and not linked from
anywhere, so no traffic until ads point at it. The plan (research, reasoning, draft copy)
is published at https://claude.ai/artifact/Nx2q8n5Mj1UwqupRxAF3GV. This file records the
owners' answers, what was built, and what is still blocking launch.

Last worked: 14 September 2026.

## Where it stands

**Done (14 Sep 2026):** Resend connected — the domain is verified in Resend, and a live
test from `leads@dreamhomerealestateandhomeloans.com` arrived. `NEXT_PUBLIC_SITE_URL` is
set, so canonical and share previews use the real domain. ntfy push tested: a lead
reached the phone with a working Call button.

**Next, in order:**

1. **Route leads to Drew.** Netlify's `LEAD_EMAIL_TO` is still `raul@esquair.com` from the
   live test. Delete it and redeploy so leads go to Dreamhomedrew@gmail.com — tell Drew
   first, and get the ntfy app on his phone subscribed to the topic (the name is in
   Netlify's `NTFY_TOPIC`; share it privately, it's the password).
2. **Google Ads label** — waiting on Drew. Raul sent instructions: add Raul as a Standard
   user (Admin → Access and security → Users → +), or create the conversion action
   ("Submit lead form", count One, set up manually with code — not a page-load/URL
   conversion) and send back the label from `send_to: 'AW-18451645072/<label>'`. Then set
   `NEXT_PUBLIC_GADS_PREAPPROVAL_LABEL`, **redeploy** (baked in at build time), and send
   one test lead.
3. **Content still pending** — Google rating, count and 2–3 reviews (the profile blocked
   automated reading); street address; Dhruv's personal NMLS ID; a privacy policy page
   (it must also mention the Google Ads tag, its cookies, and that lead alerts pass
   through ntfy).
4. **Licensing check** — Dhruv's DRE record still showed no broker on 14 Sep; the client
   says the update hasn't posted. Re-check before ads run.
5. **Compliance read** of the final copy, then start the ads.

**Also open, not blocking:** the phone link beside the FAQ needs an underline (a
Lighthouse accessibility flag); the homepage's own FAQ uses restricted mortgage-ad
phrases (flagged as a separate task); registering (209) 627-5011 with the Free Caller
Registry so the 5-minute callback isn't labelled spam.

---

## Answers

| # | Question | Answer | What it changes |
|---|---|---|---|
| 1 | Legal structure | **One company, DRE-licensed, brokers loans** | Footer carries "Real estate broker, California Department of Real Estate". Copy must never imply Dream Home is the lender (DRE Reg 2848(a)(4)) — say "we shop lenders for you", not "our loans". No separate affiliated-business disclosure page, but confirm with counsel. |
| 1b | License numbers | **Company DRE 01961783, NMLS 1226033; Dhruv DRE 01959385** (from the DRE record and the client) | In the footer and on Dhruv's card. Still pending: Dhruv's personal NMLS ID. |
| 2 | CalHFA-approved | **No** | Do not name CalHFA MyHome, ZIP or Dream For All. San Joaquin County GAP / Tracy DAP is lender-of-choice — safe to name as "for homes under $500K". GSFA Platinum runs through participating lenders — confirm before naming. |
| 3 | Credit pull | **Soft pull first**, hard pull only for full preapproval | FAQ can say the first step won't affect the score. The form itself pulls nothing; written authorization (FCRA) must be collected before the soft pull, on the call or in the application. |
| 3b | Letter turnaround | **Same day** once documents are in | Say "letters are often issued the same day we have your documents", always with "subject to credit review and lender approval". Never "preapproved today". |
| 4 | Callback promise | **Within 5 minutes** | Hero line: "A Dream Home loan officer calls you within 5 minutes." |
| 4b | Hours | **8am–6pm, Mon–Fri** | Outside hours: "We'll call you first thing the next business morning." Google Ads schedule should match these hours. |
| 5 | Who does what | **Sonny and Dhruv both do both** | Stronger than "one team": the person who helps you find the home can be the person who arranges the loan. California requires a written dual-role disclosure within 24 hours (DRE Reg 2903) — an intake task, not page copy. |
| 5a | Whose page | **Dhruv only** (decided after the build) | Sonny does not appear on /preapproval. The page names Dhruv as the person who calls and who handles both sides, and only his NMLS # sits in the footer. The pitch sharpened to "One person. Both sides of your purchase." |
| 5b | Headshots | **Dhruv's, supplied** | `public/assets/dhruv.jpg`, a 120px crop — fine for the 52–56px avatars. |
| 6 | Phone | **(209) 627-5011** | Hero, sticky mobile bar, footer. `site.phone` in `lib/content.ts` is still `null` — the homepage can take it too. |
| 7 | Google reviews | Solid; profile at https://share.google/lO25qiJHSfSkhBekj | Google blocked automated access (robot check). Need the rating, count and 2–3 reviews pasted in by hand. |
| 8 | Track record | **Skip the count**; languages not given | Proof uses "since 2013" and the towns served. |
| 9 | Buydown story | **None** | Explain the agent-negotiates / loan-officer-structures idea in general terms. |
| 10 | Traffic | **Google search ads** | No Meta constraints. Headline must match the search terms; "Is this your first home?" stays because Google also bans targeting by age and family status. |
| 10b | Budget | **Under $1,000/month** | About 290 clicks → about 15 leads a month at 5%. The below-2.5% "something is broken" check needs ~1,000 visitors, so about 3–4 months. No A/B tests. Spend on exact-match, high-intent searches only, during callback hours only. |
| 11 | Value of a closed buyer, close rate | *Pending* | Needed to judge whether the budget is too small. |
| 12 | Lead routing | **Dhruv's email only** | The server action must send email (currently it only logs). Address in `lib/content.ts` is Dreamhomedrew@gmail.com — confirm. The 5-minute promise now depends on phone notifications for that inbox: use a distinctive subject line. Include the consent wording and timestamp in each email and keep the emails, so they double as the consent record. |

## What is built

Route `/preapproval` (`app/preapproval/`), branch `preapproval-page`. The homepage moved
into the `app/(site)` route group so its header, footer, orbs and booking bar no longer
wrap every route; URLs are unchanged.

| Piece | File |
|---|---|
| Page and sections | `app/preapproval/page.tsx` |
| Every word of copy, the form options, license placeholders | `lib/preapproval.ts` |
| Three-step form | `components/preapproval/PreapprovalForm.tsx` |
| Lead validation, email, conversion cookie, redirect | `app/preapproval/actions.ts` |
| Thank-you page (the only place a conversion is sent) | `app/preapproval-thank-you/page.tsx` |
| Google Ads constants and the conversion rule | `lib/analytics.ts`, `components/preapproval/ConversionPing.tsx` |
| Header, hero photo, FAQ, pinned bar, compliance footer | `components/preapproval/` |

- **Form questions (14 Sep 2026):** step 1 asks timeframe and first home; step 2 area and
  price; step 3 contact. "Do you have a preapproval already?" was removed at Raul's
  request — it is no longer asked, validated or sent in the lead email.
- `noindex` — it is an ad destination; the homepage stays the search entry point.
- **Ad links can name the town:** `/preapproval?city=Stockton` puts the town in the
  subheadline ("Find out what you can afford in Stockton…") and pre-answers the area
  question. Use one final URL per ad group in Google Ads (Tracy, Modesto, Lathrop,
  Manteca, Stockton, Patterson). Any other value is ignored, so a crafted link can't
  put arbitrary words on the page.
- The callback line in the form card follows the clock (Pacific): "available now"
  inside Mon–Fri 8am–6pm, otherwise "first thing this / tomorrow / Monday morning".
- No footage, scroll scenes or motion library. It prerenders as a static page.
- Reviews render only when real ones are added to `reviews` in `lib/preapproval.ts`.
  License numbers, the address and the privacy link show as "pending" or are omitted
  until filled in there.

### Images

- **Hero:** `public/assets/hero-dusk-house.jpg` (1672×941, from a 1.5 MB PNG), preloaded as
  the largest paint. Served as AVIF where supported (36 KB at 1920w), WebP otherwise —
  `images.formats` in `next.config.ts`, which applies site-wide.
- **Scrims over it were measured, not eyeballed** (text hidden, worst pixel under each line).
  Worst cases after the probe's 1.5% optimism: desktop gold headline 4.64 (needs 3), badge
  9.22; mobile subheadline 6.39 (needs 4.5). Re-measure if the photo, its
  `object-position` or `.pa-hero-bg::after` changes.
- **Closing card:** `public/assets/cta-dusk-entry.jpg` (2172×724 panorama, from a 1.5 MB PNG),
  lazy. Desktop shows the whole panorama with a soft centre shade (headline 14.87, line
  9.22). Phones crop to the lit doorway under a 0.60 wash, found by sweep — 0.55 left the
  line under the headline at 4.81.
- **Alt text:** described where the image carries meaning (Dhruv's photo, the one-person
  illustration); empty where the adjacent text already says it (logo, step and benefit
  icons, hero photo). The page is `noindex`, so image search isn't a factor here.
- **Share preview:** `public/assets/og-preapproval.jpg` (1200×630) with Open Graph and
  Twitter card tags. Set `NEXT_PUBLIC_SITE_URL` to the live domain (e.g.
  `https://dreamhome.com`) in production, or previews and the canonical point at localhost.

### Google Ads — one conversion only

The tag `AW-18451645072` is in the root layout, so it's on every page. The queue and
config run before hydration. Google's library (`gtag.js`) loads **only in production
builds**, so local testing never reaches the ads account. The whole flow is documented
in `lib/analytics.ts`.

- A delivered lead → the server action sets a one-time cookie (`pa_conversion`, 15 min)
  and redirects to **`/preapproval-thank-you`** → `<ConversionPing>` reads it, deletes it,
  and sends one `conversion` event with the lead ID as `transaction_id`. The same ID is in
  Dhruv's email, so a conversion can be matched to a lead.
- Nothing else sends an event: no step clicks, no call taps, no page-view conversions.
  Tested: a real submission sends 1 conversion; refresh, direct visit and a rejected
  submission each send 0.
- The cookie's path is `/`, not the thank-you path. Chromium ties `document.cookie` to the
  URL the page loaded at, so after the client-side redirect a path-scoped cookie was
  invisible — and then fired on the next *direct* visit.

**Needed before it records anything** — set in the hosting environment:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_GADS_PREAPPROVAL_LABEL` | the conversion label, the part after the slash in `send_to: 'AW-18451645072/…'` |

In Google Ads: Goals → Conversions → New conversion action → Website → set it up
manually with code, category "Submit lead form", count **One**. Copy the label from the
event snippet. Do **not** create a "page load" (URL-based) conversion for
`/preapproval-thank-you` — that would count visits, which is exactly what this avoids.
Make this the only Primary conversion action for the preapproval campaigns.

The homepage's consultation form still calls `gtag('event', 'generate_lead')` on success.
Now that the tag is live, that reaches Google Ads as an ordinary event — not a conversion
unless someone makes it one.

### Phone push (ntfy)

After the email is accepted, `pushToPhone` in `app/preapproval/actions.ts` sends an ntfy
push: lead name and number, area, price, timeframe, with a **Call** button that dials the
lead. Urgent priority inside Mon–Fri 8am–6pm, normal after hours. It can't fail or delay a
lead beyond 4 seconds; the email stays the record.

**Public topic, by the client's choice (14 Sep 2026).** No ntfy account or token. On
ntfy.sh anyone who knows a public topic's name can read it — and the push carries the
lead's name and number, kept 12 hours — so **the topic name is the password**: long and
random (e.g. `dreamhome-leads-` + 16 random characters), stored as a secret in Netlify,
never shared beyond the subscribed phones. A reserved, deny-all topic (ntfy Supporter
plan, $6/mo) can be added later with only `NTFY_TOKEN`; no code change.

| Variable | Value |
|---|---|
| `NTFY_TOPIC` | the topic's name — setting it turns pushes on; mark secret |
| `NTFY_TOKEN` | optional; only for a reserved topic |
| `NTFY_SERVER` | optional; defaults to `https://ntfy.sh` |

Drew's phone: the ntfy app, subscribed to the topic. ntfy.sh keeps messages 12 hours (the
iPhone app needs that to deliver).

### Lead email — needed before launch

Leads are emailed through Resend's HTTP API (one `fetch`, no SDK). Set:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | from resend.com — **required in production** |
| `LEAD_EMAIL_FROM` | a sender on a domain verified in Resend, e.g. `Dream Home Leads <leads@yourdomain>` |
| `LEAD_EMAIL_TO` | optional; defaults to Dreamhomedrew@gmail.com |

Without a key, development prints the email to the server log and reports success;
production refuses and tells the visitor to call, so a missing key can never lose a lead
silently. Each email carries the consent wording, timestamp, IP and user agent — keep
them, they are the consent record.

## DRE public record, checked 14 September 2026

**Dream Home Real Estate & Home Loans** — corporation, DRE 01961783, licensed, expires
01/16/27. MLO license endorsement (company NMLS) 1226033. Designated officer: Kuldeepak
Goswamy (DRE 01909132). Main office on record: the Valencia Dr address in Tracy.
Both numbers are now in the footer.

**Dhruv Goswamy** — salesperson, DRE 01959385, issued 2014, expires **11/07/26**.
This record contradicts the page as written:

- **Status "LICENSED NBA" — no broker affiliation.** He was under Dream Home until
  07/19/2026, then Lexington Enterprises Group (07/20–09/08/2026), and has had no
  responsible broker since 09/08/2026. A salesperson can't perform licensed activity
  without one, and Dream Home's record doesn't list him among its salespersons. Dream Home's
  broker needs to re-affiliate him with the DRE before the page presents him as a Dream
  Home agent.
- **No individual MLO endorsement on his record.** The page's claim that he is "licensed
  for both real estate and home loans" is unsupported unless he holds an NMLS license
  some other way. Until his individual NMLS ID exists, he can't be presented as the
  person who handles the loan.
- The client's earlier answer "Sonny and Dhruv both do both" (5) needs re-checking
  against this.

**Client response (14 Sep 2026):** Dhruv works under Dream Home's NMLS 1226033, and the
public records haven't caught up yet. Accepted. The page shows his DRE # and "Dream Home
NMLS # 1226033", labelled as the company's. **Before ads run**, re-check that (a) his DRE
record lists Dream Home as his responsible broker and (b) his own individual NMLS ID
exists. Add that ID as `licensing.agent.nmls` in `lib/preapproval.ts` — ad rules require
the loan officer's personal NMLS ID beside his name, not only the company's.

## Nice to have from the client

Launch blockers are listed under "Where it stands" at the top. These don't block
launch but sharpen the budget and the copy:

- Value of a closed buyer (both sides) and a rough lead-to-close rate — sets whether
  the under-$1,000/month budget is too small.
- GSFA Platinum participation, and through which lender — needed before naming it.
- A higher-resolution headshot of Dhruv (the current one is a 120px crop) — only if
  the photo is ever shown larger.
