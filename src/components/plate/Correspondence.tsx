import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CORRESPONDENCE } from "@/lib/survey";
import { ease } from "@/lib/motion";
import PlateHeader from "./PlateHeader";
import { usePull } from "@/hooks/usePull";

/**
 * Plate V. The colophon.
 *
 * Old sheets close with the imprint: who compiled the survey, where to write to
 * them, and what the sheet was drawn with. That is exactly a contact section, so
 * it is set as an imprint rather than as a "Got a project in mind?" call to
 * action — the addresses are the content, and they are given as an address block.
 */
const Correspondence = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });

  return (
    <section id="correspondence" className="relative px-8 md:px-16 pt-24 md:pt-36 pb-28 md:pb-36 plate-ground">
      <div className="max-w-container mx-auto">
        <PlateHeader
          numeral="V"
          title="Address for correspondence."
          note="The survey is ongoing. Corrections, additions and new ground all welcome."
        />

        <div ref={ref} className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20">
          <div>
            <p className="t-lead text-[1.35rem] md:text-[1.75rem] text-foreground/85 max-w-lg mb-10">
              {CORRESPONDENCE.standfirst}
            </p>

            <dl className="border-t border-foreground/20">
              {CORRESPONDENCE.links.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease }}
                  className="border-b border-foreground/20"
                >
                  <AddressRow l={l} />
                </motion.div>
              ))}
            </dl>
          </div>

          {/* the imprint block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="border border-foreground/20 p-7 md:p-9 h-fit"
          >
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase text-foreground/45 mb-7">
              Imprint
            </p>
            <dl className="space-y-5">
              {[
                { k: "Compiled by", v: "Vinit Khandal" },
                { k: "Station", v: "Bengaluru, India" },
                { k: "Drawn with", v: "React · TypeScript · WebGL · Tailwind" },
                { k: "Terrain", v: "Generated live; contours redrawn every frame" },
                { k: "Edition", v: "2026" },
              ].map((row) => (
                <div key={row.k} className="grid grid-cols-[7.5rem_1fr] gap-4 items-baseline">
                  <dt className="font-mono text-[9px] tracking-[0.18em] uppercase text-foreground/40">
                    {row.k}
                  </dt>
                  <dd className="text-[13px] leading-snug text-foreground/80">{row.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 pt-6 border-t border-dotted border-foreground/25">
              <p className="text-[11.5px] leading-relaxed text-foreground/40">
                Move the cursor across the sheet to displace the contours. The
                ground is not an image — it is solved for every pixel, every frame.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/**
 * An address row. The whole row is in the cursor's field, so it leans toward the
 * hand as you approach and settles behind it — the row acknowledges you before
 * you have arrived, which is what makes a page feel attentive rather than inert.
 */
const AddressRow = ({ l }: { l: (typeof CORRESPONDENCE.links)[number] }) => {
  const ref = usePull<HTMLAnchorElement>({
    pull: 11, radius: 180, rate: 3.0, damping: 0.52, swirl: 0.26,
  });
  return (
    <a
      ref={ref}
      href={l.href}
      target={l.href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group grid grid-cols-[7rem_1fr_auto] items-baseline gap-4 py-5"
    >
      <dt className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40">
        {l.label}
      </dt>
      <dd className="text-[14px] md:text-[15px] text-foreground/85 group-hover:text-foreground transition-colors duration-300 truncate">
        {l.value}
      </dd>
      <ArrowUpRight className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
    </a>
  );
};

export default Correspondence;
