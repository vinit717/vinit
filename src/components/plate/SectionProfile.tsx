import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TRAVERSE, SURVEY_START, SURVEY_END } from "@/lib/survey";
import { ease } from "@/lib/motion";
import PlateHeader from "./PlateHeader";

/**
 * Plate III. The years, drawn as a section.
 *
 * Surveyors don't only draw plans — they cut a section through the ground and
 * draw its profile, so you can read the shape of a traverse at a glance. That
 * is a far truer picture of three years of work than a stacked list of jobs:
 * the ground rises, and where each locality sits on it is the point.
 */

const W = 1000;
const H = 330;
const BASE = 268;
const AMP = 200;
const L = 58;
const R = 942;

const xFor = (year: number) =>
  L + ((year - SURVEY_START) / (SURVEY_END - SURVEY_START)) * (R - L);
const yFor = (rise: number) => BASE - rise * AMP;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Control points the ground passes through, in survey order. */
const CONTROL: [number, number][] = [
  [0, 0.16],
  ...TRAVERSE.map(
    (t) =>
      [
        ((t.from + t.to) / 2 - SURVEY_START) / (SURVEY_END - SURVEY_START),
        t.rise,
      ] as [number, number],
  ),
  [1, 0.93],
];

/** Interpolate between control points, then rough it up so it reads as ground
 *  rather than as a chart line. Deterministic — no randomness in render. */
function heightAt(t: number) {
  let base = CONTROL[CONTROL.length - 1][1];
  for (let i = 0; i < CONTROL.length - 1; i++) {
    const [t0, h0] = CONTROL[i];
    const [t1, h1] = CONTROL[i + 1];
    if (t >= t0 && t <= t1) {
      base = h0 + (h1 - h0) * smooth((t - t0) / (t1 - t0));
      break;
    }
  }
  return base + Math.sin(t * 37) * 0.016 + Math.sin(t * 61 + 1.2) * 0.011;
}

const POINTS = Array.from({ length: 160 }, (_, i) => {
  const t = i / 159;
  return [L + t * (R - L), yFor(heightAt(t))] as const;
});

const RIDGE = POINTS.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const GROUND = `${RIDGE} L${R} ${BASE} L${L} ${BASE} Z`;

const YEARS = Array.from(
  { length: SURVEY_END - SURVEY_START + 1 },
  (_, i) => SURVEY_START + i,
);

const SectionProfile = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });

  return (
    <section id="section" className="relative px-8 md:px-16 py-24 md:py-36 plate-ground">
      <div className="max-w-container mx-auto">
        <PlateHeader
          numeral="III"
          title="Section through three years."
          note="Cut west to east along the traverse. Vertical exaggeration considerable; the ground is real."
        />

        {/* A section is a wide drawing. Squeezing it into a phone shrinks the
            annotation to a few pixels, so let the drawing keep its proportions
            and scroll within its own frame instead. */}
        <div ref={ref} className="mb-16 md:mb-20 -mx-8 md:mx-0 px-8 md:px-0 overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto min-w-[680px] overflow-visible"
            role="img"
            aria-label={`Elevation section of roles from ${SURVEY_START} to ${SURVEY_END}`}
          >
            <defs>
              <pattern
                id="hatch"
                width="7"
                height="7"
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
              >
                <line y2="7" className="stroke-foreground/25" strokeWidth="0.6" />
              </pattern>
            </defs>

            {/* the cut ground, hatched the way a section always is */}
            <motion.path
              d={GROUND}
              fill="url(#hatch)"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : undefined}
              transition={{ duration: 1.2, delay: 0.5, ease }}
            />

            {/* the ridge line, drawn as though by hand */}
            <motion.path
              d={RIDGE}
              fill="none"
              className="stroke-foreground/70"
              strokeWidth="1.4"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : undefined}
              transition={{ duration: 1.8, ease }}
            />

            {/* datum */}
            <line x1={L} y1={BASE} x2={R} y2={BASE} className="stroke-foreground/35" strokeWidth="1" />

            {YEARS.map((y) => (
              <g key={y}>
                <line
                  x1={xFor(y)}
                  y1={BASE}
                  x2={xFor(y)}
                  y2={BASE + 8}
                  className="stroke-foreground/35"
                  strokeWidth="1"
                />
                <text
                  x={xFor(y)}
                  y={BASE + 26}
                  textAnchor="middle"
                  className="fill-foreground/45 font-mono"
                  style={{ fontSize: 13, letterSpacing: "0.12em" }}
                >
                  {y}
                </text>
              </g>
            ))}

            {TRAVERSE.map((t, i) => {
              const x = xFor((t.from + t.to) / 2);
              const y = yFor(t.rise);
              return (
                <motion.g
                  key={t.locality}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : undefined}
                  transition={{ duration: 0.6, delay: 1.0 + i * 0.18, ease }}
                >
                  {/* plumb line down to the datum */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={BASE}
                    className="stroke-foreground/40"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  {/* the span this locality covers, bracketed on the datum */}
                  <line
                    x1={xFor(t.from)}
                    y1={BASE}
                    x2={xFor(t.to)}
                    y2={BASE}
                    className="stroke-foreground"
                    strokeWidth="2.5"
                  />
                  <path
                    d={`M${x} ${y - 11} L${x + 9} ${y + 5} L${x - 9} ${y + 5} Z`}
                    className="fill-background stroke-foreground"
                    strokeWidth="1.4"
                  />
                  <text
                    x={x}
                    y={y - 24}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ fontSize: 21, letterSpacing: "-0.02em" }}
                  >
                    {t.locality}
                  </text>
                  <text
                    x={x}
                    y={y - 42}
                    textAnchor="middle"
                    className="fill-foreground/45 font-mono"
                    style={{ fontSize: 12, letterSpacing: "0.16em" }}
                  >
                    {t.role.toUpperCase()}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* the written record that accompanies any drawn section */}
        <ol className="border-t border-foreground/20">
          {TRAVERSE.slice()
            .reverse()
            .map((t, i) => (
              <motion.li
                key={t.locality}
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease }}
                className="grid md:grid-cols-[1fr_1.3fr_auto] gap-x-10 gap-y-3 items-baseline py-7 border-b border-foreground/20"
              >
                <h3 className="t-h3 text-xl md:text-2xl">{t.locality}</h3>
                <div>
                  <p className="text-[13px] mb-1.5 text-foreground/85">{t.role}</p>
                  <p className="text-[13px] leading-relaxed text-foreground/55 max-w-md">
                    {t.note}
                  </p>
                </div>
                <p className="font-mono text-[10px] tracking-[0.14em] text-foreground/45 md:text-right whitespace-nowrap">
                  {t.from} — {t.to === SURVEY_END ? "present" : t.to} · {t.place}
                </p>
              </motion.li>
            ))}
        </ol>
      </div>
    </section>
  );
};

export default SectionProfile;
