import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { STATIONS } from "@/lib/survey";
import { ease } from "@/lib/motion";
import PlateHeader from "./PlateHeader";
import { usePull } from "@/hooks/usePull";

/**
 * Plate II. The work, set as a station index.
 *
 * A triangulation station is a fixed point a surveyor establishes and then
 * measures everything else against — which is a better description of a piece
 * of built work than "project card" is. So each one gets a station mark, and
 * the particulars are set as a survey record (locality, materials, field note)
 * rather than as a title with a paragraph under it.
 */
const StationIndex = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });

  return (
    <section id="stations" className="relative px-8 md:px-16 py-24 md:py-36 plate-ground">
      <div className="max-w-container mx-auto">
        <PlateHeader
          numeral="II"
          title="Triangulation stations."
          note="Four fixed points. Each one established on real ground, and measured against the others."
        />

        <ol ref={ref} className="border-t border-foreground/20">
          {STATIONS.map((s, i) => (
            <motion.li
              key={s.mark}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.08 * i, ease }}
              className="group relative grid md:grid-cols-[auto_1fr] gap-x-8 lg:gap-x-14 gap-y-5 py-10 md:py-12 border-b border-foreground/20"
            >
              {/* the station mark itself */}
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-24">
                <StationMark />
                <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/45">
                  STN {s.mark}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="t-h3 text-[1.65rem] md:text-[2.5rem] mb-6 transition-transform duration-500 group-hover:-translate-y-0.5">
                  {s.name}
                </h3>

                <dl className="grid sm:grid-cols-[auto_1fr] gap-x-8 gap-y-2.5 mb-6">
                  <dt className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40 sm:pt-0.5">
                    Locality
                  </dt>
                  <dd className="text-[13px] text-foreground/85">{s.locality}</dd>

                  <dt className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40 sm:pt-0.5">
                    Materials
                  </dt>
                  <dd className="font-mono text-[11px] leading-relaxed text-foreground/65">
                    {s.materials}
                  </dd>
                </dl>

                <div className="grid sm:grid-cols-[auto_1fr] gap-x-8 gap-y-2.5">
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40 sm:pt-1">
                    Field note
                  </p>
                  <p className="text-[14px] leading-relaxed text-foreground/70 max-w-xl">
                    {s.note}
                  </p>
                </div>
              </div>

              {/* bearing: a sight line drawn to the next station on hover */}
              <span className="absolute left-0 bottom-0 h-px w-full origin-left scale-x-0 bg-foreground/60 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};

/**
 * The station mark leans toward the cursor and lifts very slightly as it does.
 * A survey mark is a physical object driven into the ground — it should feel
 * like it has some mass to it, which a linear CSS hover cannot express.
 */
const StationMark = () => {
  const ref = usePull<HTMLSpanElement>({
    pull: 17, radius: 190, rate: 2.4, damping: 0.44, swirl: 0.45, lift: 0.16,
  });
  return (
    <span ref={ref} className="inline-block">
      <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0 overflow-visible" aria-hidden>
        <path
          d="M12 3 L21.5 20 L2.5 20 Z"
          className="fill-transparent stroke-foreground/45 transition-all duration-500 group-hover:fill-foreground/85 group-hover:stroke-foreground"
          strokeWidth="1.25"
        />
        <circle cx="12" cy="14.5" r="1.1" className="fill-foreground/60" />
      </svg>
    </span>
  );
};

export default StationIndex;
