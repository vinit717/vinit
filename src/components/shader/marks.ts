/* Survey marks: the second drawing on the sheet.
 *
 * The contours give the shape of the ground; this gives it occupation. Benchmarks,
 * station rings and spot heights are scattered across the terrain at a range of
 * depths, each travelling past at its own rate as you scroll, so there is always
 * something moving behind the contours rather than one flat field.
 *
 * They are the finest marks on the sheet, so they behave like it: gated on
 * `calm` SQUARED, which makes them the first thing to disappear when the sheet
 * starts moving and the last thing to settle back once it stops. That is the
 * reward for scrolling slowly.
 *
 * No attribute buffers — every mark's position, depth, size and kind is derived
 * from gl_VertexID, so the whole layer is one drawArrays call with no geometry
 * uploaded at all.
 */

export const MARKS_VERT = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uScroll;
uniform float uCalm;
uniform vec2  uMouse;

flat out float vKind;
flat out float vFade;

float h1(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

void main() {
  float id = float(gl_VertexID);
  float aspect = uRes.x / uRes.y;

  // Near marks are larger and travel faster: that difference IS the parallax.
  float depth = 0.35 + h1(id * 5.3) * 0.65;

  float x = (h1(id * 1.7) * 2.0 - 1.0) * aspect;
  float y = fract(h1(id * 3.1 + 7.0) - uScroll * depth * 1.7) * 2.6 - 1.3;

  x += sin(uTime * 0.14 + id * 0.7) * 0.012;
  y += cos(uTime * 0.11 + id * 1.3) * 0.010;

  // the instrument parts the marks the way it parts the contours
  vec2 dm = vec2(x, y) - uMouse;
  float d2 = dot(dm, dm);
  vec2 dir = dm * inversesqrt(d2 + 1e-4);
  float sw = exp(-d2 * 2.2);
  x += dir.x * sw * 0.17;
  y += dir.y * sw * 0.17;

  gl_Position = vec4(x / aspect, y, 0.0, 1.0);
  gl_PointSize = (3.5 + h1(id * 9.1) * 7.0) * depth * max(uRes.y / 900.0, 0.55);

  vKind = h1(id * 11.3);

  // fade at the wrap edges so nothing pops in or out mid-sheet
  float edge = 1.0 - smoothstep(0.86, 1.26, abs(y));
  vFade = uCalm * uCalm * edge * (0.25 + 0.75 * depth);
}`;

export const MARKS_FRAG = `#version 300 es
precision highp float;

flat in float vKind;
flat in float vFade;

uniform float uDark;
uniform vec3  uBrand;

out vec4 fragColor;

void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r = length(c);

  float a;
  if (vKind < 0.38) {
    // benchmark — a cut cross
    a = max(1.0 - smoothstep(0.06, 0.20, abs(c.x)),
            1.0 - smoothstep(0.06, 0.20, abs(c.y)))
      * (1.0 - smoothstep(0.62, 0.92, r));
  } else if (vKind < 0.74) {
    // station — a ring
    a = 1.0 - smoothstep(0.10, 0.30, abs(r - 0.58));
  } else {
    // spot height — a filled dot
    a = 1.0 - smoothstep(0.16, 0.36, r);
  }

  a *= vFade * 0.5;
  if (a < 0.01) discard;

  vec3 col = uDark > 0.5 ? mix(vec3(0.9), uBrand, 0.12) : vec3(0.1);
  fragColor = vec4(col, a);
}`;

export const MARK_COUNT = 320;
