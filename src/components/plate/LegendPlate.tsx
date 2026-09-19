import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LEGEND, SURVEYOR_NOTES } from "@/lib/survey";
import { ease } from "@/lib/motion";
import PlateHeader from "./PlateHeader";

/** The key's marks, drawn rather than typed, so they read as cartography. */
const Mark = ({ kind }: { kind: (typeof LEGEND)[number]["symbol"] }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden>
    {kind === "triangle" && (
      <path
        d="M12 4 L20.5 19 L3.5 19 Z"
        className="fill-none stroke-foreground/70"
        strokeWidth="1.4"
      />
    )}
    {kind === "diamond" && (
      <path
        d="M12 3.5 L20.5 12 L12 20.5 L3.5 12 Z"
        className="fill-none stroke-foreground/70"
        strokeWidth="1.4"
      />
    )}
    {kind === "circle" && (
      <>
        <circle cx="12" cy="12" r="8" className="fill-none stroke-foreground/70" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="1.6" className="fill-foreground/70" />
      </>
    )}
    {kind === "rule" && (
      <>
        <line x1="2" y1="12" x2="22" y2="12" className="stroke-foreground/70" strokeWidth="1.4" />
        <line x1="7" y1="8.5" x2="7" y2="15.5" className="stroke-foreground/70" strokeWidth="1.4" />
        <line x1="17" y1="8.5" x2="17" y2="15.5" className="stroke-foreground/70" strokeWidth="1.4" />
      </>
    )}
  </svg>
);

/**
 * Plate IV. What the marks mean.
 *
 * A legend is the one part of a map that explains the mapmaker's own system, so
 * it is the honest place for what would otherwise be an "About" section: each
 * symbol paired with what it stands for and what was read off the ground with
 * it. The surveyor's own notes sit in the margin beside it, as they would.
 */
const LegendPlate = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });

  return (
    <section id="legend" className="relative px-8 md:px-16 py-24 md:py-36 plate-ground">
      <div className="max-w-container mx-auto">
        <PlateHeader
          numeral="IV"
          title="What the marks mean."
          note="Every symbol on the preceding plates, and the ground it was read off."
        />

        <div ref={ref} className="grid lg:grid-cols-[1.55fr_1fr] gap-12 lg:gap-20">
          {/* the key itself, boxed the way a key always is */}
          <div className="border border-foreground/20">
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-foreground/45 px-6 py-3.5 border-b border-foreground/20">
              Key to the sheet
            </p>
            {LEGEND.map((l, i) => (
              <motion.div
                key={l.heading}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : undefined}
                transition={{ duration: 0.6, delay: 0.1 * i, ease }}
                className="grid grid-cols-[auto_1fr] gap-x-5 px-6 py-6 border-b border-foreground/15 last:border-b-0"
              >
                <div className="pt-0.5">
                  <Mark kind={l.symbol} />
                </div>
                <div className="min-w-0">
                  <h3 className="t-h3 text-lg mb-2">{l.heading}</h3>
                  <p className="font-mono text-[10.5px] leading-relaxed text-foreground/55 mb-3">
                    {l.tools}
                  </p>
                  <p className="text-[13.5px] leading-relaxed text-foreground/70">{l.reading}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* marginalia */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-foreground/45 mb-6">
              Surveyor's notes
            </p>
            <ul>
              {SURVEYOR_NOTES.map((n, i) => (
                <motion.li
                  key={n}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease }}
                  className="flex items-baseline gap-4 py-4 border-b border-dotted border-foreground/25"
                >
                  <span className="font-mono text-[10px] text-foreground/35 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] leading-relaxed text-foreground/75">{n}</span>
                </motion.li>
              ))}
            </ul>

            <p className="mt-8 text-[12.5px] leading-relaxed text-foreground/45">
              I like the parts of the stack that aren't glamorous: getting a config
              schema right, making a component genuinely reusable, or making sure a
              mobile screen feels as considered as a web one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegendPlate;
