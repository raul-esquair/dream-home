@AGENTS.md

# Working in this repo

Marketing homepage for Dream Home Real Estate & Home Loans (Tracy, CA). Built from the
handoff bundle in the parent directory: `../README.md` is the design spec and
`../Dream Home Homepage.dc.html` is the prototype it was measured against. Single
conversion goal: book a consultation.

`README.md` in this directory is the design record — every non-obvious decision and the
measurement behind it lives under "Deviations from the prototype". Read that before
changing any section's motion or scrim. This file is the operational guide.

## Running

A `next dev` on port 3000 is usually already running from this directory — check before
starting another. `.claude/launch.json` in the **parent** directory starts it by name
(`npm --prefix dream-home run dev`).

```bash
npm run build   # also typechecks
npm run lint
```

Verify UI changes in the browser, not by reasoning about the CSS. Several bugs in this
codebase were invisible in the source and obvious on screen.

## All content is placeholder

Listings, testimonials, proof numbers, phone, DRE/NMLS are **not real**. Eight of the
testimonials were written as placeholders and read as genuine client reviews — they must be
replaced before anything ships publicly. See "Still needed before launch" in `README.md`.

## Contrast over imagery is measured, never eyeballed

Type sits over a photograph or video in the hero, the affordability card, the process
panel, and both sky bands — listings and the calculator in the first, the testimonial shelf,
the FAQ and the blog in the second. Every scrim value in them was chosen by sampling the
actual asset, compositing the scrim layers in JS, and computing WCAG ratios against the
**brightest** region the text actually occupies. Do not adjust one by eye — several already-shipped values were found to
be failing only once measured.

Pitfalls, all of which produced wrong numbers at least once here:

- **Freeze the element first.** Cards carry scroll-linked scale transforms, so
  `getBoundingClientRect()` drifts between calls. Reusing a rect across probes silently
  compares different regions — this made two probes disagree by 1.3 contrast points.
- **Model gradients faithfully.** Treating the affordability card's `140deg` tint as a
  constant moved results by whole contrast points. Sample the real gradient.
- **Validate the model.** Check it against a hand-computable case (an opaque `#08070a`
  scrim under `--color-muted-2` is 9.29) before trusting its output.
- **Confirm which token the element actually uses.** A hero label measured 2.82 and looked
  like a failure; it uses `--color-muted-3`, not `--color-muted`, and actually sits at 5.31.
- **Sample video with its CSS filter.** Canvas 2D accepts the same `filter` syntax, so
  `ctx.filter = getComputedStyle(video).filter` reproduces it exactly. Sample several
  frames and take the worst.

## The scrim shape

Hero, process and affordability share one rule: **hold the shade over the copy, release it
where there is none, and put the release outside the text.** Where the release falls matters
more than how dark the shade is — the process section released at 34% with copy running to
53%, which alone cost it 2 contrast points and put it under AA. Fixing the shape let both
sides get *lighter*.

The hero's copy is centred, so its release is vertical rather than horizontal. Don't copy
the horizontal pool onto it.

## Traps

- **Scrubbed video must be all-intra.** The delivered clip had one keyframe, making every
  seek decode from zero. `public/assets/tour.mp4` is re-encoded so each frame is its own
  keyframe; the ffmpeg command is in `README.md`. Never swap it without re-encoding.
- **Masks, filters and opacity flatten a 3D context.** Put them on a wrapper *outside* the
  element carrying `perspective`, or the whole 3D effect collapses.
- **`position: sticky` creates a stacking context.** `.ps-seam` relies on this to paint
  above the pinned panel from outside it.
- **Fixed backgrounds align to the viewport, not their element.** Two separate elements with
  identical values show the same image, pixel-aligned — that is how `.ps-seam` bridges the
  sky band into the tour. `--sky`, `--sky-tail` and `--sky-shade` are shared on `:root` and
  must stay identical or the join reopens.
- **One transform per element.** Several sections stack layers purely so each can own a
  single transform (`.tm-twist` > `.tm-stage` > `.tm-drag` > `.tm-track`). Combining them
  means one clobbers another.
- **`translate` and `transform` are different properties, and they compose.** Tailwind v4
  compiles `-translate-x-1/2` to the standalone `translate` property, not to `transform`. A
  keyframe that also declares `transform: translate(-50%, -50%)` therefore centres the
  element *twice* while it runs, then drops back to single centring the moment the animation
  ends — which reads as a snap, not as a slow frame. The dialog did exactly this: measured,
  it animated 220px left and 269px above its resting place. Animate `scale` (the standalone
  property) and let the utility own the centring. Suspect this whenever an element positioned
  with Tailwind translate utilities is also keyframed.
- **Programmatic scroll probes drift.** The listings carousel's `ResizeObserver` changes
  page height, which shifts scroll — convergence loops oscillate. Set
  `document.documentElement.scrollTop = absoluteTop - offset` directly instead.

## Motion conventions

- **Two clocks.** Type reads raw scroll so it stays locked to the gesture; only expensive
  things (the video scrub) get a spring. Putting type on the spring measured ~190ms of lag.
- **Drag on the magnetic carousel is applied in visual space**, not to `progress` — the
  magnet's derivative is 0.00 at a dwell and 4.20 mid-swing, so a direct drag is dead then
  lurches. `toProgress()` inverts it; `CALIBRATION` is empirical and must be re-measured if
  `FRONT_Z` or the band depths change.
- **Every scroll-driven section has a fallback** under `prefers-reduced-motion`, and the
  carousels also under `(hover: none)` — pinning, drift and drag all become static layouts.
  Keep these when editing; they are the accessible reading of the same content.
- **Content that moves indefinitely needs a pause control** (WCAG 2.2.2). Both carousels
  have one; hover alone only serves a mouse.
