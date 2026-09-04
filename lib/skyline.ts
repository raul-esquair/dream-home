/**
 * Silhouette geometry for the hero and CTA scenes.
 *
 * The handoff's hero slot calls for "Tracy CA home exterior, dusk", so the
 * foreground layer is a neighbourhood roofline rather than the natural
 * treeline of the reference. Everything is drawn, not photographed — the real
 * photography is still an open item.
 *
 * All paths are authored against a 1440-wide viewBox and rendered with
 * `preserveAspectRatio="xMidYMax slice"` so houses keep their proportions on
 * narrow screens instead of stretching.
 */

export const SCENE_W = 1440;

export type House = {
  /** Left edge. */
  x: number;
  /** Width of the footprint. */
  w: number;
  /** Height of the eaves (smaller y = taller). */
  eave: number;
  /** Height of the roof peak. */
  peak: number;
};

/** A row of gabled houses, closed into a fillable silhouette. */
export function skylinePath(
  houses: House[],
  { width = SCENE_W, streetY, groundY }: { width?: number; streetY: number; groundY: number }
): string {
  let d = `M 0 ${groundY} L 0 ${streetY}`;
  for (const h of houses) {
    d += ` L ${h.x} ${streetY} L ${h.x} ${h.eave} L ${h.x + h.w / 2} ${h.peak} L ${h.x + h.w} ${h.eave} L ${h.x + h.w} ${streetY}`;
  }
  d += ` L ${width} ${streetY} L ${width} ${groundY} Z`;
  return d;
}

/** Foreground roofline. Varied ridge heights keep it from reading as a pattern. */
export const FRONT_HOUSES: House[] = [
  { x: 30, w: 128, eave: 150, peak: 112 },
  { x: 186, w: 96, eave: 160, peak: 132 },
  { x: 310, w: 152, eave: 140, peak: 96 },
  { x: 494, w: 104, eave: 156, peak: 124 },
  { x: 628, w: 136, eave: 146, peak: 106 },
  { x: 796, w: 112, eave: 154, peak: 122 },
  { x: 938, w: 164, eave: 136, peak: 92 },
  { x: 1134, w: 100, eave: 158, peak: 128 },
  { x: 1264, w: 144, eave: 144, peak: 104 },
];

/** Chimneys, drawn as separate blocks that union with the roofline fill. */
export const FRONT_CHIMNEYS = [
  { x: 122, y: 122, w: 13, h: 34 },
  { x: 404, y: 104, w: 14, h: 44 },
  { x: 706, y: 116, w: 13, h: 38 },
  { x: 1046, y: 100, w: 15, h: 46 },
  { x: 1330, y: 114, w: 13, h: 38 },
];

/**
 * Trees between the houses. `r` is canopy radius; cypresses are the tall
 * narrow ones that break up the horizontal run of roofs.
 */
export const FRONT_TREES = [
  { x: 172, y: 150, r: 20 },
  { x: 468, y: 142, r: 26 },
  { x: 610, y: 152, r: 18 },
  { x: 918, y: 146, r: 23 },
  { x: 1116, y: 150, r: 20 },
  { x: 1420, y: 148, r: 22 },
];

export const FRONT_CYPRESS = [
  { x: 292, y: 108, w: 17, h: 66 },
  { x: 780, y: 118, w: 15, h: 58 },
  { x: 1246, y: 112, w: 16, h: 62 },
];

/** Mid-distance hills — soft, no detail, just mass. */
export const MID_HILLS =
  "M 0 200 L 0 128 C 120 96 232 148 352 132 C 470 116 560 60 690 74 C 810 87 880 140 1000 132 C 1128 123 1216 78 1330 92 C 1385 99 1418 114 1440 122 L 1440 200 Z";

/** Far ridge — the highest, hazed-back layer. */
export const FAR_HILLS =
  "M 0 200 L 0 150 C 140 118 250 96 400 108 C 540 119 616 76 742 66 C 884 55 968 104 1104 108 C 1230 112 1340 84 1440 96 L 1440 200 Z";
