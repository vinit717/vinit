import { useEffect, useRef } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

/**
 * The headline is drawn to an offscreen canvas, then sampled three times —
 * once per colour channel — through a lens that follows the cursor. Where the
 * lens is flat the samples coincide and the type is plain white; where it bends
 * they separate and the letter edges split into spectrum, like type seen
 * through glass. No background, no field: the type is the whole effect.
 */

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform vec2  uRes;
uniform vec2  uMouse;
uniform float uStrength;
uniform float uTime;
uniform vec3  uPage;   // what the canvas is composited over
uniform vec3  uInk;    // what the type is drawn in

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;

  vec2 d = uv - uMouse;
  d.x *= uRes.x / uRes.y;

  // a soft lens, plus a slow breathing warp so it is never completely still
  float bump = exp(-dot(d, d) * 16.0);
  vec2  k = d * bump * uStrength;
  k += vec2(sin(uv.y * 9.0 + uTime * 0.5), cos(uv.x * 7.0 - uTime * 0.4)) * 0.0016;

  // per-channel offsets: coincident where flat, split where the lens bends
  float r = texture(uTex, uv - k * 1.45).a;
  float g = texture(uTex, uv - k * 1.00).a;
  float b = texture(uTex, uv - k * 0.58).a;

  float a = max(max(r, g), b);
  if (a < 0.004) discard;

  // The three channels have different coverage; a canvas has only one alpha, so
  // solve for the colour that lands on the right composite. Source-over gives
  // final = page*(1-a) + C*a, and we want final = page - k*(page - ink) per
  // channel — hence C below. Emitting the coverage itself as the colour only
  // ever works on a black page, which is why the type vanished in light mode.
  vec3 cov = vec3(r, g, b) / a;
  fragColor = vec4(uPage - cov * (uPage - uInk), a);
}`;

/** "rgb(9, 9, 9)" / "rgba(…)" → 0..1 triple. Falls back if the page hands back
 *  a keyword or `transparent`, which is what a body with no explicit background
 *  reports. */
function parseRgb(value: string, fallback: [number, number, number]) {
  const m = value.match(/-?[\d.]+/g);
  if (!m || m.length < 3) return fallback;
  const a = m.length > 3 ? Number(m[3]) : 1;
  if (a === 0) return fallback;
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255] as const;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("headline shader failed:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

type Props = { lines: string[]; className?: string };

const HeadlineRefract = ({ lines, className }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const paintRef = useRef<() => void>();
  const dark = useDarkMode();

  // Re-rasterise when the theme flips. Twice, because the palette is animated by
  // a global colour transition and getComputedStyle mid-transition still reports
  // the outgoing colour — the second pass picks up the settled one.
  useEffect(() => {
    paintRef.current?.();
    const t = setTimeout(() => paintRef.current?.(), 400);
    return () => clearTimeout(t);
  }, [dark]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    // This canvas IS the h1, so a lost context leaves a blank rectangle where the
    // headline should be. Everything the GPU owns has to be rebuildable.
    type Locs = Record<string, WebGLUniformLocation | null>;
    let prog: WebGLProgram | null = null;
    let tex: WebGLTexture | null = null;
    let u: Locs = {};

    const build = () => {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);

      u = {
        tex: gl.getUniformLocation(prog, "uTex"),
        res: gl.getUniformLocation(prog, "uRes"),
        mouse: gl.getUniformLocation(prog, "uMouse"),
        strength: gl.getUniformLocation(prog, "uStrength"),
        time: gl.getUniformLocation(prog, "uTime"),
        page: gl.getUniformLocation(prog, "uPage"),
        ink: gl.getUniformLocation(prog, "uInk"),
      };

      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.uniform1i(u.tex, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      return true;
    };
    if (!build()) return;

    const text = document.createElement("canvas");
    const ctx = text.getContext("2d")!;

    let w = 0;
    let h = 0;
    let repaint = () => {};

    const paint = () => {
      if (!prog || gl.isContextLost()) return;
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.round(rect.width * dpr);
      h = Math.round(rect.height * dpr);

      canvas.width = w;
      canvas.height = h;
      text.width = w;
      text.height = h;
      gl.viewport(0, 0, w, h);

      // Fit the type to the box in BOTH axes. Sizing off width alone lets a tall
      // headline overflow the bitmap, and since the canvas clips, the overflow
      // silently eats the top of the first line — cap-height horizontals go
      // first, so "The work of" rasterises as "I he work ot".
      const count = Math.max(linesRef.current.length, 1);
      const fontPx =
        Math.min(rect.width / 8.2, 116, (rect.height / count) * 0.82) * dpr;
      const lineH = fontPx * 0.95;

      // Take ink and paper from the live palette rather than assuming a black
      // page: the canvas IS the headline, so a hardcoded white left the h1
      // white-on-white the moment anyone flipped to the light theme.
      const ink = parseRgb(getComputedStyle(host).color, [1, 1, 1]);
      const page = parseRgb(
        getComputedStyle(document.body).backgroundColor,
        [0.035, 0.035, 0.035],
      );
      gl.uniform3f(u.page, page[0], page[1], page[2]);
      gl.uniform3f(u.ink, ink[0], ink[1], ink[2]);

      ctx.clearRect(0, 0, w, h);
      // only coverage is sampled downstream, so any opaque fill works here
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "alphabetic";
      ctx.font = `400 ${fontPx}px Inter, system-ui, sans-serif`;
      if ("letterSpacing" in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          `${-0.055 * fontPx}px`;
      }

      const top = (h - lineH * linesRef.current.length) / 2 + fontPx * 0.82;
      linesRef.current.forEach((line, i) => ctx.fillText(line, 0, top + i * lineH));

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, text);
      repaint();
    };

    paintRef.current = paint;
    // fonts land after first paint; redraw once they do or the type renders in a fallback
    document.fonts?.ready.then(paint);
    paint();

    const ro = new ResizeObserver(paint);
    ro.observe(host);

    const target = { x: 0.5, y: 0.5 };
    const cur = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    let onScreen = true;
    const start = performance.now();
    let last = start;

    const frame = (now: number) => {
      if (!prog || gl.isContextLost()) { running = false; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.pow(0.001, dt);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;

      gl.uniform2f(u.res, w, h);
      gl.uniform2f(u.mouse, cur.x, cur.y);
      gl.uniform1f(u.strength, reduced ? 0 : 0.09);
      gl.uniform1f(u.time, (now - start) / 1000);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    };

    // Gate the loop: an ungated rAF keeps running when the hero is scrolled away
    // or the tab is buried, burning GPU for something nobody can see.
    function play() {
      if (running || !onScreen || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const vis = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      onScreen ? play() : pause();
    });
    vis.observe(host);

    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    // preventDefault is what makes the loss recoverable; without it no restore
    // event ever fires and the headline stays a blank rectangle.
    const onLost = (e: Event) => {
      e.preventDefault();
      pause();
      prog = null;
    };
    const onRestored = () => {
      if (!build()) return;
      paint();
      play();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    repaint = () => { if (!running) frame(performance.now()); };
    frame(performance.now());
    pause();
    play();

    return () => {
      pause();
      vis.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (prog) gl.deleteProgram(prog);
      if (tex) gl.deleteTexture(tex);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div ref={hostRef} className={`relative ${className ?? ""}`}>
      {/* the real heading stays in the DOM for screen readers and SEO */}
      <h1 className="sr-only">{lines.join(" ")}</h1>
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden />
    </div>
  );
};

export default HeadlineRefract;
