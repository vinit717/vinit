/* The field.
 *
 * Not a drawing — a volume you are flying through. The engraving was line work
 * on a flat plane, which is why it could never read like the reference: there
 * was no depth in it, so nothing could pass you, and nothing could streak.
 *
 * Every particle is one GL_LINES segment: the head sits at the particle's
 * position, the tail one "streak" further back down the tunnel. At rest the
 * streak is a few thousandths and each mark is effectively a point; as scroll
 * speed rises the tail is dragged back and the whole field pulls into radial
 * streaks from the vanishing point. That is the entire visual language of
 * forward motion in the reference, and it costs one extra vertex.
 *
 * Detail comes from COUNT and ACCUMULATION, not from any single clever term.
 * Ninety thousand one-pixel segments blended additively build a luminous volume
 * out of marks far too small to resolve individually — which is exactly how the
 * reference gets its density without any of its material being procedural.
 *
 * Depth does the rest: brightness falls as 1/(1+z²), so near marks are brilliant
 * and far ones sink to nothing. That contrast — near-black holding a few very
 * bright things — is what makes it read as photographic rather than as maths.
 */

export const FIELD_VERT = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uScroll;
uniform float uVel;
uniform vec2  uMouse;

out float vShade;

float h1(float n) { return fract(sin(n * 127.1) * 43758.5453123); }

void main() {
  int vid = gl_VertexID;
  float id = float(vid >> 1);
  float end = float(vid & 1);          // 0 = head, 1 = tail

  float aspect = uRes.x / uRes.y;

  // A GAUSSIAN radius, not a disc. sqrt(u) fills a disc evenly, which means it
  // stops dead at its edge — and that edge projects to a hard bright circle
  // across the middle of the sheet. The Box-Muller radius has no edge at all:
  // dense in the core, thinning for ever outwards, which is what makes it read
  // as a volume rather than as a cut-out.
  float rr  = sqrt(-2.0 * log(max(h1(id + 0.13), 1e-5))) * 0.52;
  float ang = h1(id + 2.70) * 6.28318;
  float z0  = h1(id + 5.10);

  // The camera runs forward for ever. fract() wraps the particle to the far end
  // when it passes, so the tunnel is endless with a fixed particle count.
  float travel = uScroll * 7.0 + uTime * 0.045;
  float zh = fract(z0 - travel);

  // The tail is further down the tunnel, never wrapped — if it wrapped
  // independently of the head the segment would fire clean across the screen.
  float streak = 0.004 + uVel * 0.085;
  float z = zh + end * streak;
  float depth = 0.10 + z * 3.10;

  // a slow vortex: the further away, the more it has turned
  float sw = depth * 0.55 + uTime * 0.08;
  vec2 base = vec2(cos(ang + sw), sin(ang + sw)) * rr;
  base += 0.16 * vec2(sin(depth * 2.3 + id * 0.7), cos(depth * 1.9 + id * 1.3));

  // The vanishing point sits right of centre while the cartouche is on screen,
  // then walks to the middle as you travel in — so the type is never fighting
  // the densest part of the cloud for the same space.
  vec2 vp = vec2(0.62 - 0.62 * smoothstep(0.02, 0.30, uScroll), 0.0);
  vec2 proj = base / depth + vp;       // perspective — vp is the vanishing point

  // The cursor parts the field it passes through. NOT normalised: a unit-length
  // push means every mark sitting on the cursor is displaced the same fixed
  // distance in whatever direction it happened to lie, which scoops a clean
  // empty disc out of the field. Scaling by d instead goes to zero at the
  // centre, so this swells the field aside rather than deleting it.
  vec2 d = proj - uMouse;
  proj += d * exp(-dot(d, d) * 2.2) * 0.55;

  gl_Position = vec4(proj.x / aspect, proj.y, 0.0, 1.0);

  // Fade computed from the HEAD only, so both ends of a segment share one
  // brightness and a streak never comes out half-lit.
  // The only marks that project near the vanishing point are the DEEP ones, so
  // fading depth hard punches a black hole through the middle of the tunnel —
  // exactly where it should be brightest. Attenuate gently and linearly, and
  // hold the far marks almost to the end of the run.
  float fadeFar  = smoothstep(1.00, 0.70, zh);
  // Fade out well before the mark reaches the camera. A mark at depth ~0.1
  // projects its radius across the whole screen, so the last few hundredths of
  // the run produce single streaks the length of the page.
  float fadeNear = smoothstep(0.02, 0.30, zh);
  // Motion blur conserves energy: a mark smeared over a longer streak spreads
  // the same light across more pixels, so it must get DIMMER as it lengthens.
  // Without this the streaks keep full brightness as they grow and additive
  // accumulation saturates the whole sheet to white the moment you scroll fast.
  float spread = 1.0 + uVel * 4.0;
  vShade = fadeFar * fadeNear / ((1.0 + depth * 0.55) * spread);
}`;

export const FIELD_FRAG = `#version 300 es
precision highp float;

in float vShade;

uniform vec2  uRes;
uniform vec3  uBrand;
uniform float uDark;
uniform float uScroll;

out vec4 fragColor;

void main() {
  float a = vShade * 0.62;

  // hold the cartouche column clear, then let the field cross the whole sheet
  float sx = gl_FragCoord.x / uRes.x;
  a *= mix(0.34 + 0.66 * smoothstep(0.06, 0.86, sx), 1.0,
           smoothstep(0.02, 0.26, uScroll));

  if (a < 0.002) discard;

  if (uDark > 0.5) {
    // premultiplied, for straight additive accumulation
    vec3 c = mix(vec3(1.0), uBrand, 0.10);
    fragColor = vec4(c * a, a);
  } else {
    fragColor = vec4(vec3(0.05), a * 0.7);
  }
}`;

/** Segments, not vertices — two vertices are issued per particle, so this is
 *  120,000 vertices a frame. Enough to read as a volume, well inside what a
 *  vertex-bound draw can hold at 120fps. */
export const FIELD_COUNT = 60_000;
