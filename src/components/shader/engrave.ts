/* The ground, drawn the way a survey sheet is drawn.
 *
 * The first version of this was a single contour field, and that is exactly why
 * it read as flat: one system, at one depth, at one level of detail, so nothing
 * ever happened behind anything else and slowing down revealed nothing. A real
 * sheet is several drawings stacked — a grid under everything, broad ground
 * behind, index contours carrying the shape, intermediate contours between them,
 * hachures where the slope steepens — and that layering is where the density
 * comes from, not from any single clever effect.
 *
 * Three things make it feel alive rather than printed:
 *
 *   DEPTH   — the grid, the far ground and the near ground travel at different
 *             rates as you scroll, so there is real parallax between them.
 *   CALM    — detail is gated on scroll SPEED. Move fast and only the index
 *             contours survive, smeared along the travel axis; stop, and the
 *             intermediate contours, the hachures and the grid resolve back in.
 *             Scrolling slowly is rewarded with more drawing, which is the whole
 *             point of the mechanic.
 *   THE LENS— the cursor is a surveyor's instrument. Inside its reticle the
 *             contour interval halves, so extra ground resolves exactly where
 *             you are looking, and the field parts around it with a swell, a
 *             swirl and a viscous drag along pointer velocity.
 *
 * Colour stays achromatic; the richness is per-channel contour phase, so the
 * three channels coincide into neutral line at rest and separate into real
 * spectrum where the lens bends hardest or the sheet is moving fastest.
 */

import { LINES_NEAR, LINES_FAR } from "@/lib/territory";

export const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const ENGRAVE = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform vec2  uPtrVel;
uniform float uScroll;
uniform float uVel;
uniform vec3  uBrand;
uniform float uDark;
uniform float uDetail;   // 1.0 full quality, 0.0 reduced
uniform float uDatum;    // height the water stands at

out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

float fbm(vec2 p, int oct) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (i >= oct) break;
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

/** One drawn stroke. Width is in pixels, so index contours can be set heavier
 *  than the intermediate ones exactly as they are on a printed sheet. */
float stroke(float f, float fw, float w) {
  float d = abs(fract(f) - 0.5) / fw;
  return 1.0 - smoothstep(w, w + 0.75, d);
}

/** Fade strokes out as they stop being resolvable — otherwise every pixel sits
 *  on a line and the plate fills in as a solid sheet. */
float legible(float fw) {
  return 1.0 - smoothstep(0.26, 0.66, fw);
}

/** The height of the ground at a point. */
float ground(vec2 q, float warpK, int oct) {
  vec2 w = vec2(fbm(q * 1.05 + uTime * 0.045, oct),
                fbm(q * 1.05 + vec2(5.2, 1.3) - uTime * 0.038, oct));
  vec2 qw = q + (w - 0.5) * warpK;
  float dome = sqrt(max(1.04 - dot(qw, qw), 0.0));
  return dome * 1.22 + (fbm(qw * 1.9 + uTime * 0.02, oct) - 0.5) * 0.62;
}

/**
 * The contour system for one height field, for one colour channel.
 * phase is that channel's offset; calm gates the intermediate interval and
 * lens opens up a half-interval under the cursor.
 */
float contours(float F, float lines, float phase, float calm, float lens) {
  float f = F * lines + phase;
  float fw = max(fwidth(f), 1e-4);

  // index contour: every fifth, set heavier. Holds at any scroll speed.
  float fi = f * 0.2;
  float index = stroke(fi, max(fwidth(fi), 1e-4), 0.62) * legible(fw * 0.2);

  // intermediate contours: the first thing to go when the sheet is moving
  float mid = stroke(f, fw, 0.30) * legible(fw) * (0.28 + 0.72 * calm);

  // half-interval, drawn only inside the instrument
  float fs = f * 2.0;
  float sub = stroke(fs, max(fwidth(fs), 1e-4), 0.26) * legible(fw * 2.0)
            * lens * calm * 0.8;

  return max(index, max(mid, sub));
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;

  // Fast rise, slow fall is already applied to uVel on the CPU; this is just
  // the reading of it that the drawing uses.
  float calm = 1.0 - smoothstep(0.04, 0.42, uVel);

  // --- the instrument -------------------------------------------------------
  vec2 dm = p - uMouse;
  float r2 = dot(dm, dm);
  float rr = sqrt(r2);
  float swell = exp(-r2 * 1.7);
  float lens = exp(-r2 * 5.5);
  vec2 dir = dm * inversesqrt(r2 + 1e-4);
  vec2 tang = vec2(-dir.y, dir.x);
  vec2 push = dir * swell * 0.22 + tang * swell * 0.24 + uPtrVel * swell * 0.10;

  // --- layer 0: the grid the sheet is ruled on ------------------------------
  vec2 gq = p * 3.4 + vec2(uScroll * 1.1, uScroll * 5.2);
  float gxw = max(fwidth(gq.x), 1e-4);
  float gyw = max(fwidth(gq.y), 1e-4);
  float grid = max(stroke(gq.x, gxw, 0.22) * legible(gxw),
                   stroke(gq.y, gyw, 0.22) * legible(gyw));
  grid *= 0.085 * calm;

  // --- layer 1: far ground, cheap and soft, travels slowest ------------------
  vec2 fq = (p + push * 0.35) * 0.52 - vec2(0.30, uScroll * 1.35);
  float Ff = ground(fq, 0.20, 2);
  float far = contours(Ff, 13.0, 0.0, calm, 0.0) * 0.30;

  // --- layer 2: the ground proper -------------------------------------------
  vec2 c = vec2(0.66 - uScroll * 0.30, -0.05 + sin(uScroll * 3.1) * 0.26);
  vec2 q = p - c;
  float a = uTime * 0.035 + uScroll * 1.4;
  q = mat2(cos(a), -sin(a), sin(a), cos(a)) * q;
  q += push;
  q.y /= 1.0 + uVel * 1.9;   // strokes stretch along the travel axis at speed

  int oct = uDetail > 0.5 ? 4 : 3;
  float F = ground(q, mix(0.26, 0.58, uScroll), oct);

  // built from the same constants the margin reports the interval from, so the
  // stated contour interval is always the interval actually being drawn
  float lines = mix(${LINES_NEAR.toFixed(1)}, ${LINES_FAR.toFixed(1)}, uScroll);
  float f0 = F * lines;
  float fw0 = max(fwidth(f0), 1e-4);

  // dispersion measured in stroke widths, so the channels only separate where
  // the drawing actually bends rather than everywhere the field is steep
  float disp = fw0 * (0.12 + swell * 2.8 + uVel * 1.5);
  vec3 near = vec3(
    contours(F, lines, disp, calm, lens),
    contours(F, lines, 0.0, calm, lens),
    contours(F, lines, -disp, calm, lens)
  );

  // --- hachures: short strokes down the fall line, where the ground steepens -
  float hatch = 0.0;
  if (uDetail > 0.5) {
    vec2 g = vec2(dFdx(F), dFdy(F));
    float slope = length(g) * 190.0;
    vec2 down = g * inversesqrt(dot(g, g) + 1e-9);
    float across = dot(gl_FragCoord.xy, vec2(-down.y, down.x)) / 4.5;
    float along = dot(gl_FragCoord.xy, down) / 11.0;
    hatch = stroke(across, max(fwidth(across), 1e-4), 0.24)
          * smoothstep(0.35, 0.75, fract(along))
          * smoothstep(0.55, 1.5, slope)
          * calm * 0.5;
  }

  // --- water ----------------------------------------------------------------
  // Ground below the datum is drowned, and the datum rises as you travel down
  // the survey, so the form turns into an island whose coast steadily advances.
  // Everything here is computed unconditionally and masked at the end, because
  // fwidth inside a branch is undefined.
  float fD = (uDatum - F) * lines;          // depth, in contour intervals
  float fwD = max(fwidth(fD), 1e-4);
  float inWater = smoothstep(0.0, 0.9, fD);

  float shore = (1.0 - smoothstep(0.0, 2.2 * fwD, abs(fD))) * legible(fwD);

  // Water lining: lines echoing the shore, spaced ever wider as they run out
  // into deep water. The sqrt is what produces that widening, and it is the
  // whole reason this reads as water rather than as more contours.
  float wl = sqrt(max(fD, 0.0)) * 3.2;
  float fwW = max(fwidth(wl), 1e-4);
  float lining = stroke(wl, fwW, 0.26) * legible(fwW)
               * inWater * exp(-fD * 0.085) * calm;

  float water = max(shore, lining * 0.62);

  // land drawing stops at the water's edge, as it does on any real sheet
  float land = 1.0 - inWater;
  near *= 0.16 + 0.84 * land;
  hatch *= land;

  // --- the reticle ----------------------------------------------------------
  // Not a cursor decoration: the instrument you are reading the ground with.
  // (Avoid naming a local 'cross' — it shadows the built-in and some drivers
  // reject the shader outright rather than warning.)
  float ring = 0.0;
  {
    float R = 0.27;
    float ang = atan(dm.y, dm.x);
    float seg = abs(fract(ang / 1.5708) - 0.5) * 2.0;         // 1 at the quadrants
    ring = (1.0 - smoothstep(0.0022, 0.0070, abs(rr - R)))
         * (1.0 - smoothstep(0.70, 0.94, seg));               // broken at the quadrants
    float tickA = abs(fract(ang / 0.3927) - 0.5) * 2.0;
    ring = max(ring, smoothstep(0.88, 1.0, tickA)
             * (1.0 - smoothstep(0.008, 0.026, abs(rr - (R - 0.026)))));
    float hair = max(
      (1.0 - smoothstep(0.0018, 0.0052, abs(dm.x))),
      (1.0 - smoothstep(0.0018, 0.0052, abs(dm.y)))
    ) * (1.0 - smoothstep(0.040, 0.080, rr));
    ring = max(ring, hair) * calm * 0.9;
  }

  // --- compose --------------------------------------------------------------
  // Body: bright over the form, a whisper of topography beyond it, so the ground
  // stays a form on a sheet rather than a carpet under the type.
  float body = smoothstep(1.35, 0.15, length(q));
  near *= 0.045 + 0.955 * body;
  near *= 1.0 + swell * 0.45;
  hatch *= body;
  // Water needs its OWN, wider falloff. It forms on low ground, which is by
  // definition out beyond the high centre of the form — so masking it with the
  // same body term as the contours cancelled it exactly where it can exist.
  water *= smoothstep(2.15, 0.30, length(q));

  // Water stays neutral across the channels on purpose: set against contours
  // that fringe into spectrum, an unfringed shoreline reads as a different
  // material rather than as more of the same drawing.
  vec3 cov = max(near, vec3(max(max(far, grid), max(max(hatch, ring), water))));

  float alpha = max(cov.r, max(cov.g, cov.b));

  // Hold the ground back from the cartouche, then let it run over the whole
  // sheet once you scroll in. Screen fraction, not aspect units, so a narrow
  // window protects the same share of the column as a wide one.
  float sx = gl_FragCoord.x / uRes.x;
  alpha *= mix(0.30 + 0.70 * smoothstep(0.24, 0.62, sx), 1.0,
               smoothstep(0.04, 0.22, uScroll));

  // the only colour anywhere: a breath of brand in the brightest strokes
  cov = mix(cov, mix(cov, uBrand, 0.35), swell * 0.5);

  if (uDark < 0.5) { cov = 1.0 - cov; alpha *= 0.42; } else { alpha *= 0.72; }
  if (alpha < 0.004) discard;

  fragColor = vec4(cov, alpha);
}`;
