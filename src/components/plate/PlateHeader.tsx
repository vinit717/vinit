import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ease } from "@/lib/motion";
import Reveal from "@/components/Reveal";

type Props = { numeral: string; title: string; note: string };

/** Every plate opens the same way: numeral, a rule that draws itself across the
 *  sheet, the plate's title, and a one-line explanatory note in the margin. */
const PlateHeader = ({ numeral, title, note }: Props) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <div ref={ref} className="mb-14 md:mb-20">
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-foreground/60 whitespace-nowrap">
          Plate {numeral}
        </span>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : undefined}
          transition={{ duration: 1.1, ease }}
          className="flex-1 h-px bg-foreground/25 origin-left"
        />
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-16 items-end">
        <Reveal as="h2" className="t-h2 text-[2.25rem] md:text-[3.75rem]" stagger={0.05}>
          {title}
        </Reveal>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="text-[13px] leading-relaxed text-foreground/50 md:pb-2"
        >
          {note}
        </motion.p>
      </div>
    </div>
  );
};

export default PlateHeader;
