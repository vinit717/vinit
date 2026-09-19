import { useEffect, useRef } from "react";
import { FIELD_VERT, FIELD_FRAG, FIELD_COUNT } from "./field";
import { sheet } from "@/lib/territory";
import { tilt } from "@/lib/tilt";
import { useBrandHue } from "@/lib/themes";
import { useDarkMode } from "@/hooks/useDarkMode";
import { isPerfLow } from "@/lib/perf";

/* One fixed full-viewport canvas behind everything. A single program draws the
   whole field: 90,000 additively-blended segments flown through on scroll. */

/**
 * The field is vertex-bound, not fragment-bound — it draws a great many very
 * small marks rather than shading every pixel — so it wants resolution rather
 * than fewer pixels. The old budget also sized the backing store in CSS pixels
 * and never applied the device ratio, so on a retina display everything was
 * rendered at half resolution and scaled back up.
 */
const BUDGET = 2_400_000;

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

function hslToRgb(hDeg: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + hDeg / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("field shader failed:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function link(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vert);
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("field program failed:", gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

const NAMES = ["Res", "Time", "Scroll", "Vel", "Mouse", "Brand", "Dark"];
type Locs = Record<string, WebGLUniformLocation | null>;

const ArtBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hue = useBrandHue();
  const dark = useDarkMode();
  const hueRef = useRef(hue);
  const darkRef = useRef(dark);
  hueRef.current = hue;
  darkRef.current = dark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true });
    if (!gl) return;

    // The GPU can take the context away at any time — a driver reset, too many
    // live contexts, a laptop switching GPUs. Everything below is rebuildable.
    let prog: WebGLProgram | null = null;
    let u: Locs = {};

    const build = () => {
      prog = link(gl, FIELD_VERT, FIELD_FRAG);
      if (!prog) return false;
      u = Object.fromEntries(NAMES.map((n) => [n, gl.getUniformLocation(prog!, `u${n}`)]));
      gl.enable(gl.BLEND);
      gl.useProgram(prog);
      return true;
    };
    // Deliberately not bailing on failure: if the context is already lost at
    // mount, returning here would skip the restore listener below and the canvas
    // could never come back. Every draw path guards on a null program.
    build();

    const low = isPerfLow();
    const budget = low ? BUDGET * 0.45 : BUDGET;
    const count = low ? Math.round(FIELD_COUNT * 0.35) : FIELD_COUNT;

    let w = 0;
    let h = 0;
    let repaint = () => {};
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const s = Math.min(1, Math.sqrt(budget / (r.width * dpr * r.height * dpr)));
      w = Math.max(1, Math.round(r.width * dpr * s));
      h = Math.max(1, Math.round(r.height * dpr * s));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      repaint(); // setting width clears the buffer; a paused loop must redraw
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const aspect = innerWidth / innerHeight;
      target.x = ((e.clientX / innerWidth) * 2 - 1) * aspect;
      target.y = -((e.clientY / innerHeight) * 2 - 1);
      sheet.cx = e.clientX / innerWidth;
      sheet.cy = e.clientY / innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    const t0 = performance.now();
    let last = t0;
    let scroll = 0;
    let lastPx = scrollY;
    let vel = 0;

    const frame = (now: number) => {
      if (!prog || gl.isContextLost()) { running = false; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const max = document.documentElement.scrollHeight - innerHeight;
      const to = max > 0 ? Math.min(scrollY / max, 1) : 0;
      scroll += (to - scroll) * (1 - Math.pow(0.02, dt));

      // Asymmetric smoothing: snap up, ease down. Symmetric damping feels mushy;
      // fast-rise/slow-fall is what makes the streaks read as momentum.
      const instant = Math.min(Math.abs(scrollY - lastPx) / Math.max(dt, 1e-3) / 2400, 1.4);
      lastPx = scrollY;
      vel += (instant - vel) * (instant > vel ? 1 - Math.pow(0.0004, dt) : 1 - Math.pow(0.14, dt));

      sheet.scroll = scroll;
      sheet.vel = vel;
      sheet.calm = 1 - smoothstep(0.04, 0.42, vel);

      // On a phone the tilt IS the cursor.
      if (tilt.active) {
        target.x = tilt.x * (innerWidth / innerHeight);
        target.y = tilt.y;
      }
      const k = 1 - Math.pow(0.0009, dt);
      mouse.x += (target.x - mouse.x) * k;
      mouse.y += (target.y - mouse.y) * k;

      const isDark = darkRef.current;
      const [r, g, b] = hslToRgb(hueRef.current, 0.62, 0.62);

      // Additive on a dark page so overlapping marks accumulate into light;
      // ordinary source-over on paper, where they have to darken instead.
      if (isDark) gl.blendFunc(gl.ONE, gl.ONE);
      else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(prog);
      gl.uniform2f(u.Res, w, h);
      gl.uniform1f(u.Time, reduced ? 0 : (now - t0) / 1000);
      gl.uniform1f(u.Scroll, scroll);
      gl.uniform1f(u.Vel, vel);
      gl.uniform2f(u.Mouse, mouse.x, mouse.y);
      gl.uniform3f(u.Brand, r, g, b);
      gl.uniform1f(u.Dark, isDark ? 1 : 0);
      gl.drawArrays(gl.LINES, 0, count * 2);

      if (reduced) { running = false; return; }
      raf = requestAnimationFrame(frame);
    };

    function play() {
      if (running || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVis);

    // preventDefault is what makes the loss recoverable; without it the browser
    // never fires a restore and the canvas stays blank for good.
    const onLost = (e: Event) => { e.preventDefault(); pause(); prog = null; };
    const onRestored = () => { if (build()) { resize(); play(); } };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    // Paint one frame unconditionally before gating: a page mounted in a
    // background tab must not stay permanently blank.
    repaint = () => { if (!running) frame(performance.now()); };
    frame(performance.now());
    pause();
    play();

    return () => {
      pause();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (prog) gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default ArtBackground;
