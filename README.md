# Dream Home — homepage

Next.js (App Router) + Tailwind v4 implementation of the Dream Home Real Estate & Home Loans
homepage. Built from a design handoff bundle that is **not part of this repository** — its
own `README.md` is the design spec and `Dream Home Homepage.dc.html` is the prototype every
value here was measured against.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Structure

```
app/
  layout.tsx        fonts, metadata, background orbs, header/footer/mobile bar
  page.tsx          section composition + FAQPage JSON-LD
  globals.css       design tokens (@theme), keyframes, shared component classes
  actions.ts        submitLead server action
components/         one file per section; Calculator, Faq, LeadForm, Testimonials
                    and Process are "use client"
lib/content.ts      all copy and placeholder data
lib/format.ts       currency, rate formatting, P&I math
```

Tokens live in `app/globals.css` under `@theme` — colors, fonts, easing and animations are
Tailwind utilities (`text-gold-soft`, `font-display`, `animate-shimmer`, `ease-out-expo`).
The design has two breakpoints, exposed as `max-wide:` (≤1100px) and `max-mobile:` (≤860px).

## Deviations from the prototype

- Listings, process, testimonials and blog grids drop to 2 columns between 861–1100px. The
  prototype goes straight from 3/4 columns to 1; the handoff README suggests this.
- The FAQ panel opens with `grid-template-rows: 0fr → 1fr` rather than a hardcoded
  `max-height: 260px`, so long answers cannot clip. Triggers carry `aria-expanded` /
  `aria-controls`; panels are `role="region"`.
- The FAQ and the blog teasers — the page's two flat, card-list sections — reveal through a
  second `<Reveal>` variant, `focus`: they arrive at `blur(10px)` and sharpen as they settle,
  over 0.8s with a 70ms step, against the page default's plain 28px lift. The FAQ's own
  subject is coming into clarity, and the page already speaks in backdrop blur, so it borrows
  a language that is there rather than adding one. Measured mid-flight at t=520ms — FAQ, six
  elements: `1.0 / 0.88 / 2.3 / 5.5 / 10 / 10` px, resolved by 1.4s; blog, four elements:
  `1.26 / 1.60 / 2.96 / 5.52` px, resolved by 1.5s. Two things this needs and would fail silently without:
  `filter` has to carry explicit units at *both* ends (`blur(0px)`, not `blur(0)`) or Motion
  has nothing to interpolate toward and the blur snaps off at the end; and the reduced-motion
  net on `[data-reveal]` in `globals.css` has to clear `filter` alongside `opacity` and
  `transform`, or the server-rendered blur survives hydration and the FAQ sits permanently
  out of focus. A settled element keeps an inline `blur(0px)`, which is a stacking context —
  harmless here, since the only thing inside that could care is the dialog, and Radix portals
  it to `body`.
- The FAQ's left column ends on a CTA rather than on the answers. The prototype's
  "text or email Sonny or Dhruv" was flat text; the names are now `mailto:` links and a
  ghost `<BookTrigger>` follows them. This is the last objection-handling moment before the
  form, and it was the only section on the page that dead-ended. Ghost rather than gold
  deliberately — the `#book` block two sections down stays the loudest call.
- **That column is not sticky, though it looks like an obvious candidate.** Measured on a
  900px viewport: the questions column is 428px against the heading column's 400px, so the
  whole grid fits one screen and a sticky heading pins for 28px and then scrolls away. It
  was built, measured, and removed. If the question list ever grows past roughly one and a
  half screens, revisit it — `top: 112px` clears the ~78px header with air to spare, and
  it has to go on the grid item itself, whose grid area is the full row height under
  `items-start`.
- The header wordmark is `whitespace-nowrap` so it does not break apart below ~420px.
- The dusk sky (`public/assets/sky.jpg`, 1376x768 / 42KB — a soft sky compresses to almost
  nothing) backs one `.sky-band` in `app/page.tsx`, wrapping listings + calculator. A single
  wrapper for the run, so the sky is continuous rather than restarting at the seam.
  Everything after the pinned tour stays black, which gives the eye somewhere to rest before
  the form. Repoint `--sky` to change the image; the scrim and the fallbacks are independent
  of it.
- There are **two** sky bands. The second wraps the testimonial shelf, the FAQ and the blog,
  so the run from the shelf to the form carries the same dusk sky as listings and the
  calculator. It takes `data-tail="solid"`, which sets `--sky-tail: 1`: the first band hands
  over to the pinned tour and deliberately stays open at its foot, but this one has the CTA's
  own scene below it, so it closes to black.
- **`<BookCta>` is deliberately outside that band**, though it sits in the middle of the run.
  Its `<Scene>` paints an opaque drawn dusk sky plus the roofline that closes the page into
  the footer, and inside the band that scene occluded the photograph completely — the band
  was a no-op there. Removing the scene to let the photograph through was tried and measured:
  it gains almost nothing, because by the depth the CTA sits at the band's scrim has already
  closed to solid, and it costs the silhouette. The CTA's drawn sky is the same dusk family
  as the photograph, which is what the continuity was for.
- Extending the band surfaced one real AA failure and two thin margins, none of them visible
  by eye. The blog cards' kicker is `text-purple`, not an `.eyebrow`, so the existing
  `.sky-band .eyebrow` rule did not reach it: **2.37 over the lit sky**, against a 4.5 floor
  for 10.5px mono. It now takes `purple-soft`, the same answer the eyebrow got, and measures
  8.87. The FAQ lede and the blog excerpt were at 4.80 and 4.61 — passing, but inside the
  error bar of any measurement — and moved from `--color-muted` to `--color-muted-2`, which
  is what this README already prescribes for body copy sitting on the sky. They now measure
  5.44 and 8.64. Worst case per section after the change, swept across seven scroll positions
  because a `fixed` sky changes underneath a section as it travels:

  | | eyebrow | heading | body | link | control |
  |---|---|---|---|---|---|
  | testimonials | 10.00 | — | — | — | 9.07 (Pause) |
  | FAQ | 7.21 | 10.23 | 5.34 | 8.17 | 10.85 (CTA) |
  | blog | 8.87 (kicker) | 15.96 | 8.64 | 11.10 | 14.19 (title) |

  Two caveats on those numbers. The probe validates at **9.43** on the hand-computable case
  this repo's CLAUDE.md records as 9.29 — a 1.5% optimism that moves no verdict here, but
  worth knowing before trusting a figure that lands near a threshold. And the shelf's quotes
  are *not* in the table: `.tm-card` takes its fill from a `background-image` gradient rather
  than a `background-color`, which the probe's surface stack does not model, so it reports
  them as bare sky. They were checked by eye instead — the cards paint their own dark slab
  over the photograph, which is why the shelf needed nothing.
- Anything moved *into* a band needs its surfaces checked, not just its text.
  `--color-surface` is `rgba(255,255,255,.02)` — against black the border does the work, but
  over a lit sky it backs muted body copy with nothing. Two rules are scoped to the band and
  measured: `.eyebrow` takes `--color-purple-soft`, and the listings Pause control takes the
  lighter label colour plus a pill of its own (`--color-label` measures 3.0 on open sky).
  Body copy sitting directly on the sky wants `--color-muted-2` rather than `--color-muted`
  — 4.87 against 3.96.
- `background-attachment: fixed` on that layer is a fidelity decision, not a parallax
  gimmick. Covering a 1600px-tall band from a 768px-tall source upscales it 2.08x and crops
  to a third of its width, which smears the cloud structure into a plain gradient; anchored
  to the viewport it is 1.13x and keeps most of the frame. Measured while scrolling the
  whole band: 75fps, no frames over 32ms. iOS ignores the property and scrolls the image
  with the band — the same picture, softer.
- `.ps-seam` bridges the band into the pinned tour, and it exists because the seam there is
  structural, not tonal. The sky is `background-attachment: fixed`, so it is painted against
  the viewport but only *within the band's own box* — it stops existing at that edge. No
  scrim value hides that; the two sides are showing different things, not the same thing at
  different brightness. The strip paints the identical fixed sky under the identical scrim,
  and because a fixed background aligns to the viewport it lines up with the band's to the
  pixel, so the sky simply continues across the boundary before dissolving into the footage.
  It is anchored to the track rather than the pin — `position: sticky` gives `.ps-pin` its
  own stacking context, so a sibling with a z-index paints above the whole panel — which
  means it slides up and away as the panel pins and never dims the tour once it is being
  read. `--sky` and `--sky-tail` are hoisted to `:root` so both the band and the bridge
  share them; they have to stay identical or the join reopens.
- The track's **other end** needed the mirror of `.ps-seam`, and for a related reason. The
  tour's vertical scrim closes at 0.84 rather than solid, and its gold bloom is centred on
  the panel's bottom-right corner — so the footage is still lit, and warm, exactly where the
  second sky band opens on opaque `#08070a`. The two edges were not the same colour, which
  is what cut the line; no scrim value on the band's side fixes that, because the band's top
  is already as dark as it goes. `.ps-tail` dissolves the last 300px of the tour into the
  band's own black before the boundary, so both sides match. It is anchored to the track
  rather than the pin for the same reason `.ps-seam` is — `position: sticky` gives `.ps-pin`
  its own stacking context, so a sibling carrying a z-index paints above the whole panel.
  The ramp stays fully transparent through its first 40%: measured mid-pin, its top edge sits
  at viewport 768 while the step copy ends around 550, so it never dims the copy while that
  copy is being read, and it only ever darkens in any case.
- The band's **bottom** does not close to solid. The pinned tour begins directly beneath it
  and opens on a dusk sky of its own, so closing to `#08070a` put pure black against lit
  purple and cut a hard line exactly where the two skies should hand over. Two things were
  making that line, and the second is the less obvious one: `.ps-scrim`'s purple bloom was
  centred at `0% 0%`, peaking on the panel's top-left corner — the seam itself. It now sits
  at `0% 26%`, so the tour starts as dark as the edge above it. Note the band shows the
  image's *upper* region near the top of the screen regardless of how far through the band
  you are, because the sky is fixed to the viewport rather than to the band; matching the
  two edges by scrim value alone does not work.
- The band's **top** still closes to solid, where the page above it really is `#08070a`;
  without that the band announces itself with a hard seam. The vertical pass sits at
  0.44 through the middle, with a second horizontal pass pooling shade down the left where
  both sections keep their headings and the calculator its lede. Measured against the
  brightest sky pixel actually in frame, that leaves heading 9.3, lede 4.9, eyebrow 5.4 and
  gold link 6.4 in the left column and 8.5 / 4.5 / 5.0 / 5.8 in the open right — all clear
  of AA. A single flat scrim cannot do both jobs: at 0.44 the lede measured 3.45 and at
  0.56 (where it passes) the sky is visibly duller.
- `.sky-band .eyebrow` takes `--color-purple-soft`. The usual `#7c5cc4` measures 4.0 on the
  page's black and 1.5 over the lit sky, so inside the band the eyebrow uses the lighter
  tint of the same hue.
- Reduced transparency drops the image to 0.3 and increased contrast removes it entirely.
- Featured listings are not a 3-up grid. They are a horizontal 3D cylinder: a continuous
  `progress` drifts on its own (~10s a home), each frame resolves it to a virtual index,
  and every slot reads that index to place itself. All of it is written straight to the DOM
  in one rAF loop — React renders the cards once and never again.
- Two pieces of that math carry the feel. The **magnetic step** raises the fractional part
  of the index to a power and halves it, so the index holds near a whole number for most of
  each cycle then hands over quickly — measured, the front card sits within 20 degrees of
  facing the reader 90% of the time. The **perspective-aware edge solve**
  (`s = D/(D-z); x = (half - peek)/s - w/2`) places a card so its *projected* edge lands on
  the container boundary; interpolating raw pixels instead misaligns every card, since each
  sits at a different depth. `D` must stay equal to the CSS `perspective`.
- The slot ring is padded to at least six by repeating the list. Offsets wrap at
  +/-slots/2, but a card is not clear of the frame until 3.0 — three listings would wrap
  mid-screen, and even the five-card source this was adapted from pops a sliver back in on
  every lap. Six slots put the seam where nothing is visible, and a slot and its duplicate
  are always three steps apart, so the same home is never on screen twice.
- Layers: `.lc-shell` sizes the section, `.lc-frame` clips and fades, `.lc-viewport` holds
  the `perspective`, `.lc-stage` holds the 3D context. The mask lives on the frame, outside
  the perspective element, because a mask (or filter, or opacity) applied to an element in
  a 3D context flattens it. The frame's height is the card's *painted* height —
  `h * D/(D-400)` — not its layout height: the front card sits at z=400 and is magnified
  1.42x, so sizing from layout clipped the CTA off the bottom. `.lc-viewport` takes
  `height: 100%`; shrink-wrapping it to the stage parks the perspective origin above the
  frame centre and pushes the whole ring upward.
- Card size tracks viewport *height* as well as container width, since a full-size ring
  plus the heading overruns a short screen. The width floor is applied after that factor,
  or the card shrinks below what its CTA and spec row need.
- Edge geometry measures the container, not the window: the section is capped at 1400px, so
  viewport-relative sizing would push cards outside it. Card proportions go taller below
  430px, where the detail block's fixed appetite squeezed the photo region until its tag and
  label collided.
- The ring twists in and out of view: the whole stage turns on three axes as the section
  crosses the viewport, level through the middle where it is actually read. Driven straight
  off `useScroll` with no spring — a twist that lags the scroll reads as sluggishness rather
  than weight. `rotateZ` is deliberately tiny next to X and Y: the ring is wide, so rolling
  the stage sweeps the outer cards vertically (at 4deg a card 600px out moves ~42px, past
  the frame's slack and clipped against its edge), while X and Y cost almost nothing in
  height. It clips nowhere a reader can see, and not by luck — the twist peaks exactly when
  the frame's clipping edges are off-screen, and those edges only enter view once the
  section is centred and the twist is near zero. Measured at 871px and 1150px tall: zero
  visible clipping, and at most 1.8deg of twist while the frame is fully in view.
- The ring moves three ways, in priority order: a pointer drag owns it outright, a flick
  coasts to a stop, and otherwise the natural drift resumes. Momentum deliberately ignores
  the hover-hold so a flick still lands with the cursor resting on the carousel.
- **Drag is applied in visual space, not to `progress`.** The magnet's derivative is 0.00 at
  a dwell and 4.20 at the midpoint, and the band interpolation is a second smoothstep with
  the same problem, so a drag written straight to `progress` is dead under the finger and
  then lurches — measured 0.00-4.20. `toProgress()` inverts the magnet exactly and a
  clamped `1/smoothstep'` gain linearises the band; together they track at 0.90-1.12,
  with the clamp leaving a light detent at the dwell rather than an infinite gain. The
  0.82 factor on `pxPerUnit` corrects for `z` falling as the card travels, which makes the
  fixed `D/(D-400)` magnification an overestimate.
- Arrow keys reach the same mechanism: a flick of `1 - FRICTION` coasts exactly one card,
  since the geometric series sums to `v / (1 - FRICTION)`. A drag past 4px suppresses the
  click that would otherwise fire the CTA underneath it.
- Only the card at the front takes pointer events, and the drift holds on hover, on focus
  and on the explicit Pause button. A CTA on a rotating card is otherwise a moving target.
  Under prefers-reduced-motion the grid it replaced is still rendered, unchanged.
- The hero, the process panel and the affordability card share one scrim shape: **held over
  the copy, released where there is none**. The release must fall *outside* the text, which
  is the whole trick — the process section released at 34% with its copy running to 53%, and
  that alone put its step body at 4.37, under AA. Holding to 55% puts it at 6.40 *and*
  leaves both sides lighter than before. The hero's copy is centred rather than left, so its
  release is vertical: it holds ~0.74 across the 16-78% band and opens to 0.34 above, where
  the footage carries no type. Measured across four frames of each clip — hero: h1 8.8,
  lede 6.3, badge 5.0, proof labels 5.2, top band 3.5x brighter; process: heading 10.3,
  eyebrow 6.0, step title 11.0, step body 6.4. The process shade does not release to nothing
  the way the calculator's does: the numerals live on that side and need 3:1 as display
  type, which sets its floor at 0.24.
- The handover from the second band into the CTA used to break in three places over ~140px,
  and the cause was not tonal. `.sky-band` isolates, so its scrim — closing to **opaque**
  `#08070a` — paints over the page's own fixed gold orb and hides it. Below the band sat
  110px of bare page (the scene's `margin-top`) where that orb came back at full strength,
  and then the scene's sky covered it again. The orb switched off, on, and off, and the bare
  slot read as a warm bar bounded by two hard lines. Confirmed by hiding
  `<BackgroundOrbs>`, which removed it. The fix is structural rather than a scrim value:
  the scene's `mt-` became `pt-`, so it owns that run and the orb stays hidden across the
  whole sequence, and the drawn sky now opens on `#08070a` and rises into `#211d36` over its
  first 16% instead of starting at the lit value — `#211d36` is about 7x the luminance of the
  page, which was a visible step on its own.
- The card then still opened on the room's lit ceiling, hard against the scene's near-black.
  A fifth layer in the stack — a vertical pass at 0.90 easing out by 26% — holds its top edge
  near the scene's tone and releases into the photograph. It fully clears above where any
  text sits, so it changes no measured value; re-probed after adding it, every figure below
  is identical to the digit. It only ever darkens, so they are floors regardless.
- The closing CTA block takes the affordability card's stack (plus the top pass above), on
  `public/assets/cta-room.jpg` (1376x768 / 162KB, re-encoded from a 697KB original). The room
  is a far brighter source than the calculator's — cream walls, lit marble, a white tub and a
  backlit window — so every value is heavier than its equivalent there. Shape first: this
  block's copy column ends at 50% of the card against the calculator's 41%, so the hold runs
  to 53% and the release lands past the text. Depth second, by sweep: a 0.72 head put the
  lede at 4.14 and 0.78 at 4.91, and 0.80 sits it at 5.19 for almost no visible cost, so 0.80
  is what ships — the lightest value that still holds margin once the probe's 1.5% optimism
  is discounted, rather than the lightest that merely passes. Stacked, the pool is the wrong
  shape and flattens to an even 0.78 wash; 0.74 was the lightest that cleared there, but a
  phone reading 10.5px mono deserves the margin. Measured at two columns: heading 8.56, lede
  5.19, contact label 5.27, email link 5.89, office value 6.08, and inside the panel 10.98 /
  5.10 / 5.54.
- That block also produced a genuine AA failure that nothing about it looked wrong for. The
  mono contact labels are `--color-label`, which measures **3.53** against the lit vanity
  directly behind them, under a 4.5 floor for 10.5px type. No shade value fixes it without
  drowning the photograph — the labels sit at 9% across, already under the pool's heaviest
  point — so they take `--color-muted-2` instead, the same answer the sky band's eyebrow got,
  and land at 5.27.
- The photograph carries a `© Luxury Spa Interiors` watermark at roughly x 1240-1370,
  y 745-765 of the source. `cover` crops it out at both breakpoints — desktop shows y 119-649,
  and the stacked card crops horizontally to x 555-820 — so it is not visible today. It would
  reappear if the card's aspect ratio changed enough, and the licensing question is
  independent of whether it renders. **Confirm this image is licensed to Dream Home before
  launch.**
- The affordability card sits on `public/assets/calculator-room.jpg` (1376x768 / 130KB — an
  interior has far more detail than a sky and compresses correspondingly harder). Layers,
  top down: the brand tint every other surface carries, a pool of shade over the copy, an
  overall floor, then the photograph. `--calc-shade` is a variable because the shade's
  *shape* has to change with the layout: two columns put the copy on the left, so it is a
  left-hand pool, but stacked below 860px the copy spans the whole card and the pool is the
  wrong shape — the lede measured 3.55 there before it flattened to an even wash. Measured
  against the copy column's real bounds and the photograph's brightest region: heading 10.5,
  lede 5.5, eyebrow 6.1, button 9.4 at two columns; 11.1 / 5.8 / 6.5 stacked.
- The affordability panel and the closing CTA both arrive as one object rather than in
  parts: they fade up from 0.9 scale as they settle into the middle of the screen and let go
  again on the way out, read straight off each card's own `useScroll` position so the effect
  behaves the same wherever its section lands. The curve lives once, in `<SettleIn>` — two
  copies of keyframes this specific would drift.
- **The CTA's exit half never fires, and should not.** Progress runs `start end` to
  `end start`, so reaching the 0.68 release needs a viewport's worth of page below the card.
  The CTA is the last block: measured, it tops out at **0.587** on a 900px viewport, inside
  the hold. It is an entrance only, which is what a final call to action wants — a primary
  button that dims as the reader arrives at it would be a strange thing to build. Only on a
  very short viewport (~600px) does it reach ~0.75 and lose a little opacity at the very
  foot of the page.
- `<SettleIn>` carries `data-settle` and a reduced-motion net in `globals.css` for the same
  reason `[data-reveal]` has one: the hook drops the animation, but the server has already
  emitted the motion value's initial `opacity: 0`, and React will not strip an inline style
  it did not set. Without the net both cards can hydrate invisible. The hold between 0.34 and 0.68 covers the stretch where the card is fully
  on screen — measured, it is at full opacity from `top: 240px` through `top: 2px`, so
  nothing moves while the sliders are usable. The two inner `<Reveal>` wrappers came out
  with it; the card is its own entrance now, and layering the two only made the copy arrive
  after its own panel.
- The process section is not four cards. It is a pinned scroll sequence: the track is four
  screens tall, the panel sticks for all of it, and scroll position resolves to one
  spring-smoothed index that the numeral column, the step copy, the dot rail and the
  background video all read from. Numerals sit three-to-a-column with the active one
  filled and its neighbours outlined; the step copy fades sequentially (the ramp ends at
  half a step, so two titles never overlap).
- `public/assets/tour.mp4` is scrubbed by that index rather than played — scroll is its
  transport. `STEP_TIMES` in `Process.tsx` pins each step to a beat in the footage: 0.20s
  front elevation, 3.70s living room, 6.30s kitchen, 9.85s pool. Between them the time
  interpolates, so the walk from the drive to the door, or from the island out to the
  yard, plays under the handover instead of cutting.
- **That file must be encoded all-intra.** The delivered original had a single keyframe,
  which makes a seek to 6.3s decode from frame zero and the scrub unusable. Every frame is
  its own keyframe, which here costs less than the source did (3.1MB vs 4.2MB). Audio is
  stripped. To swap the footage, re-encode it the same way:

  ```bash
  ffmpeg -i in.mp4 -an -vf scale=1280:720 -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -g 1 -keyint_min 1 -sc_threshold 0 -crf 29 -preset slower -movflags +faststart \
    public/assets/tour.mp4
  ```

  Seeks are driven from a rAF loop, not a subscription: a motion value can fire several
  times per paint and each one would be a seek the decoder services and discards. The loop
  also skips seeks while `video.seeking` is true, and will not seek to a time outside
  `video.buffered` — `readyState` only promises data at the current position.
- The section runs **two clocks off one scroll position**. `index` is raw, so the numerals,
  copy and dots are nailed to the gesture; only `videoIndex` is sprung, and lightly
  (damping ratio ~1.06, ~180ms, no overshoot — overshoot would run the tour backwards past
  the target and correct). Putting the type on the spring too measured ~190ms of lag,
  enough that the numeral read 03 while the footage was still in the living room. Measured
  after the split: type lag 0.03 index units, video settle 379ms, seek latency p50 2.8ms,
  no frames over 32ms during a full-track drag.
- There is deliberately **no WebCodecs frame bank**. Decoding a clip up front into a
  bitmap cache is the standard fix for scrubbing a single-keyframe file you cannot
  re-encode; we own this asset, so the all-intra encode solves it at the source for less
  code and no runtime dependency.
- Testimonials are not a 3-up grid. They are a shelf of books: each quote is a cover with
  a stack of gilt-edged leaves fanned out along its right edge, the whole object sheared
  `skewY(30deg)`, overlapping its neighbour by 112px and drifting past on a tilted track.
  At rest the quote is texture, not text. Hovering or focusing a card animates the shear
  to `0deg` — it flattens, lifts clear, brightens and parts its neighbours, all in CSS via
  `:has()`. The shear lives on `.tm-card` rather than on each layer so one transition
  flattens cover and pages together; both transform states list the same functions in the
  same order, or the browser interpolates the decomposed matrix and the shear collapses
  through a twist.
- `PAGE_STEP` is 0.2, not the reference's 1.1. At 1.1 the gilt edge measured 18-30px, six
  to ten times the ~3px edge on the listings cards and heavy enough to read as a bar rather
  than a border; at 0.2 the same page counts give 2.8-6.0px, matching the listings' scale
  while still varying card to card. `.tm-spine` is 1.5px to stay in proportion.
- The shelf is full-bleed: the heading keeps the page's 1400px column, but `.tm-viewport`
  sits outside `.section` so cards begin and end at the edges of the screen. Two things had
  been holding them off — the section's 40px gutter, and a mask ramp reaching ~50px further
  in. The fade is now placed against the screen's own edges: the stage overhangs by 9% a
  side, so those edges fall at 9/118 = 7.6% and 92.4% across it, and the stops sit just
  inside, leaving an 18px softening rather than a 90px buffer. The flat grid keeps its
  gutters, being ordinary content rather than full-bleed.
- The shelf twists in and out of view like the listings ring, on its own `.tm-twist` layer
  with `perspective` on `.tm-viewport` (the cards themselves are 2D, so nothing else in
  there is affected). Angles are smaller than the ring's and Z smaller still — this shelf is
  wider, and rolling a wide row sweeps its outer cards vertically against a viewport that
  clips. Checking that needs the edge mask taken into account: a raw measurement reports
  ~100px of overflow, but every one of those cards is outside the mask's opaque band and
  already faded to nothing. Counting only cards the reader can actually see: zero clipping,
  and at most 0.5deg of twist while the shelf is fully in frame.
- The shelf is draggable, with the same flick-and-coast as the listings ring. The drift is a
  CSS animation on `.tm-track` and an element has only one transform, so the drag offset
  lives on its own `.tm-drag` layer; a `data-dragging` attribute holds the animation while
  the pointer owns it. No index maths is needed here — unlike the listings ring this is a
  linear scroller, so the offset is just pixels. It is folded into `(-period, 0]` where
  `period` is one copy's width: the two copies make the content periodic, so an offset and
  that offset plus a period are indistinguishable, which keeps the loop seamless however far
  the shelf is thrown and stops the number growing without bound. Measured 1:1 against the
  pointer. Drag is disabled, along with its cursor and `touch-action`, under the same media
  condition that flattens the shelf into a grid.
- The gilt colour is set per sheet by `gilt()` in `Testimonials.tsx`, not by a gradient in
  CSS. A sheet is only ever visible as a 1.1px strip at its own right edge — the
  least-translated one sits on top — so a gradient's middle stops are unreachable and
  every strip renders the same end colour. Shading a cream with `filter: brightness()`
  instead walks it toward khaki, which is what put the edges off-palette in the first
  pass. The ramp runs `--color-gold-pale` nearest the cover to the deep end of the
  shimmer gradient at the outer edge.
- Because flattening is the only thing that makes a quote readable, it cannot be the only
  way in. Cards carry `tabIndex` so keyboard reaches the same state, and `@media (hover:
  none)` — which is also where prefers-reduced-motion lands — replaces the whole shelf
  with an upright wrapped grid, single track copy, no drift. Nothing is gated behind a
  gesture the device cannot make.
- A `Pause` button makes `<Testimonials>` the fourth `"use client"` component. Unlike the
  decorative, aria-hidden service-area `<Marquee>`, these are words a visitor is meant to
  read; content that moves indefinitely with no stop control fails WCAG 2.2.2, and hover
  only serves a mouse.
- The closing card pitches rather than describes. It read "Four questions. One free call. /
  Tell us where you are in the process and we will take it from there", which restated the
  lede two inches to its left, led on work the visitor has to do rather than on what they
  get, and was the only anonymous copy on a page that is otherwise named and specific. It now
  opens on the objection that actually stops a first-time buyer — that they should have their
  finances sorted *before* they are allowed to call — and answers it: "Not sure you're ready?
  That's the call." The body names what twenty minutes leaves them holding, and the response
  promise plus the cost answer from FAQ #5 are promoted out of 10px mono fine print into
  readable support text, because "what will this cost me" should be answered beside the
  button, not five sections above it. The button label is deliberately unchanged — one CTA
  label across five placements is a choice from the handoff worth more than a first-person
  variant at the last one.
- Affordability language in that card stays hedged ("roughly what you can afford") on
  purpose. This is a lender as well as a brokerage, and the calculator already carries "Not a
  loan commitment"; the closing copy should not imply one either. It also deliberately leans
  on no proof numbers — the rating, the families-helped figure and the 48-hour pre-approval
  claim are all still unverified placeholders, and the highest-stakes copy on the page is the
  worst place to bake in a claim that cannot yet be substantiated.
- Only one inbox is published anywhere on the page (`publishedContact` in `lib/content.ts`),
  used by both the FAQ and the closing CTA. Two addresses sat next to the primary button and
  offered a lower-intent, untrackable alternative to clicking it, on a page with a single
  conversion goal. Both agents are still named throughout — in the hero proof bar, the
  testimonials and the CTA card's reply promise — they just share one published address.
- The sticky booking bar stays out of the way until the hero is behind you. The hero already
  carries this exact call twice, so a third copy pinned over it was noise — and it was
  covering the proof bar, which is the last thing the hero has to say. It is watched with an
  `IntersectionObserver` on `#top` rather than a scroll handler: reading the hero's rect on
  every scroll event is a layout read per frame, on the one breakpoint least able to afford
  it. The `-72px` top `rootMargin` pulls the root's edge down so "no longer intersecting"
  means the hero's bottom has cleared the header, not merely the fold.
- Hidden there means hidden. The bar takes `inert` and `aria-hidden` while it is off-screen,
  or a keyboard user would tab onto a button 88px below the viewport; verified both ways —
  `focus()` is refused while hidden and lands while shown. It slides rather than blinks,
  0.45s on the page's `ease-out-expo`, and reduced motion collapses that to an instant swap
  rather than removing the bar: it is the only call to action in view for most of the page.
- It runs on its own breakpoint, `--breakpoint-bar` (`max-bar:*`, <=1366px), which is wider
  than the layout's `max-mobile` so it reaches iPad landscape: 1366 is the widest of those
  (12.9-inch), with 1024, 1112, 1180 and 1194 below it. **Nothing about the grid may use
  `max-bar`** — the page still goes single-column at 860, and widening that would restructure
  every section.
- That breakpoint is deliberately a width query rather than `(hover: none)`, which would look
  like the more precise tool. An iPad with a Magic Keyboard or trackpad reports
  `hover: hover`, so a touch guard fails on exactly the device this is for. The cost is that
  a 1366x768 laptop also gets the bar; add `and (hover: none)` if that is ever the wrong
  trade.
- `body { padding-bottom: 84px }` has to track the **bar's** breakpoint, not the layout's, or
  the bar sits over the footer everywhere between 861 and 1366. Verified at the boundary:
  1366 renders `grid` with 84px of padding, 1367 renders `none` with 0.
- The dialog grows from the button that opened it. Seven triggers are scattered across the
  page — header, hero, listing card, carousel card, FAQ, closing CTA, mobile bar — and a
  panel that always swelled from the middle severed the link between the thing pressed and
  the thing that appeared. `<BookTrigger>` measures its own button as the dialog opens and
  hands the panel a `transform-origin`, and because the panel is centred, the trigger's
  offset from the centre of the screen *is* its offset from the panel's centre: the origin is
  `calc(50% + dx) calc(50% + dy)`, which needs no viewport units and never has to know the
  panel's size. Measured, the origin lands within 3px of each trigger's centre. The lean is
  proportional to distance, which is the point — about 5px from the hero button near the
  middle of the screen, about 24px from the header pill in the corner. It is measured on open
  rather than once on mount because two of the triggers are fixed to the viewport and the
  rest move with the page, and it is clamped to the viewport so a trigger scrolled just
  off-screen cannot throw the origin far enough to read as a slide from nowhere. The exit
  keeps the same origin, so the panel collapses back to where it came from.
- The dialog leaves the way it arrived. It used to vanish in a single frame — measured, the
  panel was out of the DOM within 16ms of Escape, having taken 220ms to materialise — which
  is the one asymmetry a modal cannot really afford: a thing that appears along a path is
  expected back along the same one. There is now a `dialogOut` on `[data-state="closed"]`
  running the entrance backwards on `--ease-in-expo`, the reflection of the entrance curve.
  Radix keeps the node mounted for the duration because its Presence util waits on the
  animation; measured, it now holds for ~180ms and unmounts at ~211ms. Both open and closed
  states are scoped explicitly, including under reduced motion, where a single rule for both
  would have played the fade-in while the panel was leaving.
- The dialog's entrance animates `scale`, not `transform`, and does not restate its own
  centring. It used to, and the panel jittered into view because of it: `translate` and
  `transform` are separate properties that compose, and Tailwind v4 compiles
  `-translate-x-1/2 -translate-y-1/2` to `translate`, so a keyframe declaring
  `transform: translate(-50%, -50%) scale(...)` centred the panel twice for as long as it
  ran. Measured, it animated 220.8px left and 269.2px above its resting place and then
  snapped into position when the keyframe stopped applying. It now moves only the 9.2 x
  11.2px the scale itself accounts for, and the end-of-animation snap measures 0 x 0. Note
  this was never a frame problem — frames through the open measured a 13.4ms median with
  none over 32ms, before the fix as well as after.
- The lead form posts to a real server action with validation and visually hidden labels
  instead of only flipping a local `submitted` flag.

## Still needed before launch

1. Real photography — three listing photos (4:3) and headshots for Sonny and Dhruv. Every
   slot is a striped placeholder carrying a monospace label. The hero clip, the tour, the
   sky band and the affordability room are all real supplied assets and need nothing.
2. Real proof numbers — rating, review source, families helped (`lib/content.ts` → `proof`).
3. Phone number — `site.phone` is `null`, so the mobile "Call" button falls back to `#book`.
4. DRE and NMLS numbers — `site.license` is `"DRE + NMLS # TBD"`.
5. Real testimonials — the eight in `lib/content.ts` are written placeholders. Three
   constraints on replacements: keep at least six or the shelf visibly repeats; keep each
   quote under about 130 characters, since `--tm-card-h` is fixed and a longer one will
   spill past the cover; and vary the `pages` count, which sets how thick each card looks.
6. Live IDX/MLS feed for listings; real blog posts from MDX or a CMS.
7. `submitLead` in `app/actions.ts` validates and logs only — wire it to email both agents
   and push to the CRM.

## Open questions for the next session

- **Page weight and motion density.** Five sections now carry scroll-linked motion or
  imagery in sequence: hero clip, listings ring (twist + drift + drag), the sky band,
  the pinned tour (4 screens of scroll), then the testimonial shelf. Individually each was
  asked for and each reads well; end to end it is a lot, and the pinned tour alone puts
  three extra screens between the calculator and the form. Worth a deliberate look at
  whether the page still gets people to `#book` quickly enough.
- **`preload="auto"` on tour.mp4** downloads 3.1MB before anyone scrolls near it. Scrubbing
  needs it buffered, so deferring risks an empty panel. Undecided.
- **The listings carousel shows one home at a time** where a grid showed three, and its CTA
  sits on a rotating card. Mitigated (front card only takes pointer events, drift holds on
  hover/focus/pause) but still a conversion tradeoff worth revisiting.
- **A layout feedback loop exists** between the carousel's `ResizeObserver`, page height and
  scroll position. It never surfaced in normal use, only in scripted scroll probes, but it
  is the kind of thing that makes scroll-linked sections feel unstable. Unexamined.
