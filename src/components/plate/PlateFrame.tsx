import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sun, Moon, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PLATES } from "@/lib/survey";
import {
  VIEW,
  contourInterval,
  dm,
  dms,
  plottingState,
  positionAt,
  sheet,
  windowAt,
} from "@/lib/territory";
import { enableTilt, recentre, tilt, tiltAvailable } from "@/lib/tilt";
import { springSnappy } from "@/lib/motion";
import { attach } from "@/lib/springs";

/**
 * The sheet the whole survey is drawn on.
 *
 * This replaces the navbar outright. A map sheet doesn't carry a logo in the
 * top-left and a menu on the right — it carries a neatline, a graticule ticked
 * along all four edges, registration crosses at the corners, and the plate's
 * identity set into the margin.
 *
 * Every number in that margin is live. The graticule reads out the ground
 * actually under the window, so scrolling walks the coordinates south and east
 * along the traverse; the readout follows the cursor to the second; the contour
 * interval is computed from the very constants the shader was compiled with; and
 * the plotting state reports the renderer's own smoothed scroll speed, which is
 * what makes the "slow down and more detail appears" mechanic discoverable
 * rather than something you have to notice by accident.
 */

const TICKS = 40; // along the long edges
const SIDE_TICKS = 24;
const MAJOR = 8;
const SIDE_MAJOR = 6;

/** ~8 updates a second: fast enough to feel continuous, far cheaper than 120. */
const READOUT_MS = 120;

type Live = {
  lon: string[];
  lat: string[];
  cursor: string;
  interval: string;
  state: string;
  percent: number;
  levelled: boolean;
};

const PlateFrame = () => {
  const [dark, setDark] = useState(true);
  const [plate, setPlate] = useState(PLATES[0]);
  const [live, setLive] = useState<Live>({
    lon: [],
    lat: [],
    cursor: "",
    interval: "",
    state: "",
    percent: 0,
    levelled: false,
  });
  const liveRef = useRef(live);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // The registration crosses lean toward the cursor when it comes near them.
  // A far wider radius and a softer spring than the links: corner furniture
  // should breathe with the hand, not chase it.
  const detach = useRef<Map<Element, () => void>>(new Map());
  const corner = useCallback((el: HTMLSpanElement | null) => {
    const map = detach.current;
    if (!el) return;
    if (map.has(el)) return;
    map.set(el, attach(el, { pull: 10, radius: 300, rate: 1.6, damping: 0.46, swirl: 0.6 }));
  }, []);
  useEffect(() => () => { detach.current.forEach((off) => off()); detach.current.clear(); }, []);

  useEffect(() => {
    let raf = 0;
    let last = 0;

    const read = (now: number) => {
      raf = requestAnimationFrame(read);
      if (now - last < READOUT_MS) return;
      last = now;

      // Progress is derived here rather than read from the renderer: the render
      // loop pauses when the tab is hidden or motion is reduced, and the margin
      // must still be correct when it does.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      const win = windowAt(progress);
      const cur = positionAt(progress, sheet.cx, sheet.cy);

      const next: Live = {
        lon: Array.from({ length: TICKS / MAJOR - 1 }, (_, i) =>
          dm(win.lon + ((i + 1) * MAJOR / TICKS) * VIEW.lon, "E"),
        ),
        lat: Array.from({ length: SIDE_TICKS / SIDE_MAJOR - 1 }, (_, i) =>
          dm(win.lat - ((i + 1) * SIDE_MAJOR / SIDE_TICKS) * VIEW.lat, "N"),
        ),
        cursor: `${dms(cur.lat, "N")}   ${dms(cur.lon, "E")}`,
        interval: `Int ${contourInterval(progress)} m`,
        state: plottingState(sheet.calm),
        percent: Math.round(progress * 100),
        levelled: tilt.active,
      };

      const prev = liveRef.current;
      const same =
        prev.cursor === next.cursor &&
        prev.interval === next.interval &&
        prev.state === next.state &&
        prev.percent === next.percent &&
        prev.levelled === next.levelled &&
        prev.lon.join() === next.lon.join() &&
        prev.lat.join() === next.lat.join();
      if (!same) {
        liveRef.current = next;
        setLive(next);
      }

      // whichever plate owns the upper third of the viewport is the current one
      const line = window.innerHeight * 0.34;
      let current = PLATES[0];
      for (const p of PLATES) {
        const el = document.getElementById(p.id);
        if (el && el.getBoundingClientRect().top <= line) current = p;
      }
      setPlate((c) => (c.id === current.id ? c : current));
    };

    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, []);

  // The ticks never move, so they are built once and kept out of the update.
  const ticks = useMemo(
    () => (
      <>
        {Array.from({ length: TICKS + 1 }, (_, i) => {
          const major = i % MAJOR === 0;
          return (
            <div key={`h${i}`} aria-hidden>
              <span
                className={`absolute top-0 w-px ${major ? "h-2.5 bg-foreground/40" : "h-1.5 bg-foreground/20"}`}
                style={{ left: `${(i / TICKS) * 100}%` }}
              />
              <span
                className={`absolute bottom-0 w-px ${major ? "h-2.5 bg-foreground/40" : "h-1.5 bg-foreground/20"}`}
                style={{ left: `${(i / TICKS) * 100}%` }}
              />
            </div>
          );
        })}
        {Array.from({ length: SIDE_TICKS + 1 }, (_, i) => {
          const major = i % SIDE_MAJOR === 0;
          return (
            <div key={`v${i}`} aria-hidden>
              <span
                className={`absolute left-0 h-px ${major ? "w-2.5 bg-foreground/40" : "w-1.5 bg-foreground/20"}`}
                style={{ top: `${(i / SIDE_TICKS) * 100}%` }}
              />
              <span
                className={`absolute right-0 h-px ${major ? "w-2.5 bg-foreground/40" : "w-1.5 bg-foreground/20"}`}
                style={{ top: `${(i / SIDE_TICKS) * 100}%` }}
              />
            </div>
          );
        })}
      </>
    ),
    [],
  );

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute inset-3 md:inset-5 border border-foreground/15">
        {/* registration crosses, one per corner */}
        {[
          "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
          "top-0 right-0 translate-x-1/2 -translate-y-1/2",
          "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
          "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
        ].map((pos) => (
          <div key={pos} className={`absolute ${pos} w-3.5 h-3.5`}>
            {/* The cross itself is sprung, inside a wrapper that owns the
                positioning translate — a single element cannot hold both, since
                the physics writes `transform` wholesale every frame. */}
            <span ref={corner} className="absolute inset-0 block">
              <span className="absolute top-1/2 left-0 w-full h-px bg-foreground/35" />
              <span className="absolute left-1/2 top-0 h-full w-px bg-foreground/35" />
            </span>
          </div>
        ))}

        {ticks}

        {/* graticule readings — these walk as the window moves over the ground */}
        {live.lon.map((label, i) => (
          <span
            key={`lon${i}`}
            aria-hidden
            className="absolute top-3.5 font-mono text-[8px] tracking-widest text-foreground/30 -translate-x-1/2 hidden md:block tabular-nums"
            style={{ left: `${(((i + 1) * MAJOR) / TICKS) * 100}%` }}
          >
            {label}
          </span>
        ))}
        {live.lat.map((label, i) => (
          <span
            key={`lat${i}`}
            aria-hidden
            className="absolute left-3.5 font-mono text-[8px] tracking-widest text-foreground/30 -translate-y-1/2 hidden md:block tabular-nums"
            style={{ top: `${(((i + 1) * SIDE_MAJOR) / SIDE_TICKS) * 100}%` }}
          >
            {label}
          </span>
        ))}

        {/* north point */}
        <div className="absolute top-8 right-6 hidden md:flex flex-col items-center gap-1 opacity-30">
          <svg viewBox="0 0 12 24" className="w-2.5 h-5" aria-hidden>
            <path d="M6 1 L10 21 L6 17 L2 21 Z" className="fill-none stroke-foreground" strokeWidth="1" />
          </svg>
          <span className="font-mono text-[8px] tracking-[0.2em] text-foreground">N</span>
        </div>

        {/* margin: current plate, top-left */}
        <div className="absolute top-0 left-0 -translate-y-1/2 pl-6 md:pl-9">
          <span className="bg-background pr-3 font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/70">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={plate.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="inline-block"
              >
                Plate {plate.numeral} — {plate.title}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        {/* margin: how the ground is being plotted, and the one control */}
        <div className="absolute top-0 right-0 -translate-y-1/2 pr-6 md:pr-9 flex items-center">
          <span className="bg-background px-3 hidden md:inline font-mono text-[9px] tracking-[0.18em] uppercase text-foreground/40 tabular-nums">
            {live.interval} · {live.state}
          </span>
          {/* A phone has no cursor, so the instrument is levelled against the
              handset itself. Tapping once asks for orientation (iOS only hands
              it over inside a gesture); tapping again takes the current
              attitude as level. */}
          {tiltAvailable() && (
            <span className="bg-background pl-3 md:hidden pointer-events-auto">
              <motion.button
                onClick={() => (live.levelled ? recentre() : enableTilt())}
                whileTap={{ scale: 0.86 }}
                transition={springSnappy}
                aria-label={live.levelled ? "Re-level the sheet" : "Level the sheet to your device"}
                className={`w-6 h-6 flex items-center justify-center transition-colors ${
                  live.levelled ? "text-foreground" : "text-foreground/50"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
              </motion.button>
            </span>
          )}

          <span className="bg-background pl-3 pointer-events-auto">
            <motion.button
              onClick={() => setDark(!dark)}
              whileTap={{ scale: 0.86 }}
              transition={springSnappy}
              aria-label="Toggle daylight"
              className="w-6 h-6 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
            >
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </motion.button>
          </span>
        </div>

        {/* margin: scale bar doubling as progress, bottom-left */}
        <div className="absolute bottom-0 left-0 translate-y-1/2 pl-6 md:pl-9">
          <span className="bg-background pr-3 inline-flex items-center gap-2.5 align-middle">
            <span className="relative block w-20 h-1.5 border border-foreground/30">
              <span
                className="absolute inset-y-0 left-0 bg-foreground/45"
                style={{ width: `${live.percent}%` }}
              />
              <span className="absolute top-0 bottom-0 left-1/4 w-px bg-foreground/30" />
              <span className="absolute top-0 bottom-0 left-2/4 w-px bg-foreground/30" />
              <span className="absolute top-0 bottom-0 left-3/4 w-px bg-foreground/30" />
            </span>
            <span className="font-mono text-[9px] tracking-widest text-foreground/40 tabular-nums">
              {live.percent}%
            </span>
          </span>
        </div>

        {/* margin: where the instrument is standing. Shown on a phone only once
            the sheet is levelled, since that is the point at which it starts
            answering to the handset and the numbers begin to mean something. */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 ${
            live.levelled ? "block" : "hidden md:block"
          }`}
        >
          <span className="bg-background px-3 font-mono text-[9px] tracking-[0.16em] text-foreground/45 tabular-nums whitespace-pre">
            {live.cursor}
          </span>
        </div>

        {/* margin: the surveyor's hand, bottom-right */}
        <div
          className={`absolute bottom-0 right-0 translate-y-1/2 pr-6 md:pr-9 ${
            live.levelled ? "hidden md:block" : ""
          }`}
        >
          <span className="bg-background pl-3 font-mono text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-foreground/45">
            V. Khandal · surveyed 2022—2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlateFrame;
