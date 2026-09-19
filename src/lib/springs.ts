/**
 * The motion system.
 *
 * One integrator, one loop, one set of rules — every micro-interaction on the
 * sheet is the same damped spring, so the whole page moves like one material
 * instead of like a dozen unrelated CSS easings.
 *
 * Principles, all of them load-bearing:
 *
 *   REAL PHYSICS   Semi-implicit (symplectic) Euler at a FIXED 1/120 s step,
 *                  consumed from an accumulator. Explicit Euler pumps energy
 *                  into a spring and diverges; rounding the step count per frame
 *                  runs the motion up to 50% fast on a 90 Hz display. A CSS
 *                  transition cannot do either of these things correctly,
 *                  because it restarts from zero velocity every time the target
 *                  changes — which is exactly what makes interrupted CSS motion
 *                  feel dead. A spring carries its velocity through.
 *
 *   FLUID          A magnet that only pulls radially feels mechanical. Three
 *                  parts make it read as fluid: a gaussian SWELL so it eases in
 *                  and out rather than spiking, a TANGENTIAL component so the
 *                  field curls instead of just being tugged, and DRAG — the
 *                  cursor the elements chase is itself a lagged copy of the real
 *                  one, so everything trails a little behind the hand.
 *
 *   IT COSTS NOTHING AT REST
 *                  Every node parks when all of its degrees of freedom are still,
 *                  and the loop stops entirely when every node is parked. An idle
 *                  page runs no frames.
 *
 *   IT RESPECTS THE USER
 *                  Under prefers-reduced-motion nothing is registered at all.
 */

const STEP = 1 / 120;
const MAX_STEPS = 6;

/** Under a device pixel and under a tenth of a degree: parking here is invisible. */
const REST_POS = 0.06;
const REST_VEL = 0.5;
const REST_SCALE = 0.0008;

export type PullOptions = {
  /** px of travel toward the cursor at closest approach */
  pull?: number;
  /** px — how far away the element starts to feel it */
  radius?: number;
  /** Hz */
  rate?: number;
  /** damping ratio; < 1 overshoots, 1 is critical */
  damping?: number;
  /** how much of the pull is tangential rather than radial — this is the curl */
  swirl?: number;
  /** scale added at closest approach */
  lift?: number;
};

type Node = {
  el: HTMLElement;
  x: number; y: number; vx: number; vy: number;
  s: number; vs: number;
  cx: number; cy: number;   // element centre, viewport coords
  asleep: boolean;
  /** was this node inside the cursor's radius on the last step? */
  pulled: boolean;
  o: Required<PullOptions>;
};

const DEFAULTS: Required<PullOptions> = {
  pull: 8,
  radius: 130,
  rate: 2.6,
  damping: 0.58,
  swirl: 0.35,
  lift: 0,
};

const nodes = new Set<Node>();

/** The hand, and the lagged copy everything actually chases. */
const hand = { x: -1e5, y: -1e5, on: false };
const drag = { x: -1e5, y: -1e5 };

let raf = 0;
let running = false;
let last = 0;
let acc = 0;
let measureDirty = true;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function measure() {
  for (const n of nodes) {
    const r = n.el.getBoundingClientRect();
    // undo the current offset so the centre is the laid-out position
    n.cx = r.left + r.width / 2 - n.x;
    n.cy = r.top + r.height / 2 - n.y;
  }
  measureDirty = false;
}

function step() {
  const w = Math.PI * 2;
  for (const n of nodes) {
    if (n.asleep) continue;
    const o = n.o;
    const wn = w * o.rate;
    const ww = wn * wn;
    const zc = 2 * o.damping * wn;

    // where this node would like to be
    let tx = 0;
    let ty = 0;
    let ts = 0;
    n.pulled = false;
    if (hand.on) {
      const dx = drag.x - n.cx;
      const dy = drag.y - n.cy;
      const d2 = dx * dx + dy * dy;
      const rr = o.radius * o.radius;
      if (d2 < rr) {
        // gaussian swell: eases in and out instead of spiking at the centre
        const fall = Math.exp((-d2 / rr) * 2.4);
        const inv = 1 / (Math.sqrt(d2) + 1e-4);
        const ux = dx * inv;
        const uy = dy * inv;
        // radial pull plus a tangential component — the curl is what reads as fluid
        tx = (ux + -uy * o.swirl) * o.pull * fall;
        ty = (uy + ux * o.swirl) * o.pull * fall;
        ts = o.lift * fall;
        n.pulled = true;
      }
    }

    const ax = -ww * (n.x - tx) - zc * n.vx;
    const ay = -ww * (n.y - ty) - zc * n.vy;
    const as = -ww * (n.s - ts) - zc * n.vs;
    n.vx += ax * STEP; n.vy += ay * STEP; n.vs += as * STEP;
    n.x += n.vx * STEP; n.y += n.vy * STEP; n.s += n.vs * STEP;
  }
}

/** `stepped` guards the parking test. On the first frame after waking, dt is
 *  ~0 and the accumulator runs no steps at all — so `pulled` still holds its
 *  initial false and every node would park before the physics had a single
 *  chance to mark it as being pulled. Never decide "at rest" on a frame where
 *  nothing was simulated. */
function paint(stepped: boolean) {
  let awake = false;
  for (const n of nodes) {
    if (n.asleep) continue;
    // every degree of freedom, or something still sliding counts as at rest
    const still =
      Math.abs(n.x) < REST_POS && Math.abs(n.y) < REST_POS &&
      Math.abs(n.vx) < REST_VEL && Math.abs(n.vy) < REST_VEL &&
      Math.abs(n.s) < REST_SCALE && Math.abs(n.vs) < REST_VEL * 0.01;
    if (stepped && still && !n.pulled) {
      n.x = n.y = n.vx = n.vy = n.s = n.vs = 0;
      n.asleep = true;
      n.el.style.transform = "";
      continue;
    }
    awake = true;
    n.el.style.transform =
      `translate3d(${n.x.toFixed(2)}px,${n.y.toFixed(2)}px,0)` +
      (n.o.lift ? ` scale(${(1 + n.s).toFixed(4)})` : "");
  }
  return awake;
}

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.25);
  last = now;

  // the hand is chased viscously, so everything trails a little behind it
  const k = 1 - Math.pow(0.0015, dt);
  drag.x += (hand.x - drag.x) * k;
  drag.y += (hand.y - drag.y) * k;

  if (measureDirty) measure();

  acc += dt;
  let n = 0;
  while (acc >= STEP && n < MAX_STEPS) { step(); acc -= STEP; n++; }
  if (n === MAX_STEPS) acc = 0;   // drop the backlog rather than spiral

  const awake = paint(n > 0);
  if (awake) raf = requestAnimationFrame(frame);
  else running = false;
}

function play() {
  if (running || !nodes.size) return;
  running = true;
  last = performance.now();
  acc = 0;
  raf = requestAnimationFrame(frame);
}

function wake() {
  for (const n of nodes) n.asleep = false;
  play();
}

let listening = false;
function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pointermove", (e) => {
    hand.x = e.clientX; hand.y = e.clientY;
    if (!hand.on) { drag.x = hand.x; drag.y = hand.y; }  // no lurch on first move
    hand.on = true;
    wake();
  }, { passive: true });
  // A pointer that leaves the window must release everything, or the last
  // elements it touched stay displaced for ever.
  window.addEventListener("pointerleave", () => { hand.on = false; wake(); });
  window.addEventListener("blur", () => { hand.on = false; wake(); });
  const dirty = () => { measureDirty = true; play(); };
  window.addEventListener("scroll", dirty, { passive: true });
  window.addEventListener("resize", dirty);
}

/** Register an element with the field. Returns an unsubscribe. */
export function attach(el: HTMLElement, opts: PullOptions = {}) {
  if (reduced()) return () => {};
  listen();
  const n: Node = {
    el,
    x: 0, y: 0, vx: 0, vy: 0, s: 0, vs: 0,
    cx: 0, cy: 0,
    asleep: false,
    pulled: false,
    o: { ...DEFAULTS, ...opts },
  };
  nodes.add(n);
  measureDirty = true;
  play();
  return () => {
    nodes.delete(n);
    el.style.transform = "";
    // nothing left to drive: stop the loop rather than leave it spinning
    if (!nodes.size) { cancelAnimationFrame(raf); running = false; }
  };
}
