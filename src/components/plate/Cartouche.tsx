import { motion } from "framer-motion";
import HeadlineRefract from "@/components/HeadlineRefract";
import { CARTOUCHE, PLATES } from "@/lib/survey";
import { scrollToId } from "@/lib/smoothScroll";
import { ease } from "@/lib/motion";
import { usePull } from "@/hooks/usePull";

/**
 * Plate I. Not a hero — a cartouche.
 *
 * A map's title block is a bordered panel set into a corner of the sheet, dense
 * with the particulars of the survey: subject, locality, date of compilation,
 * scale. It is never a big sentence floating in the middle of the page with a
 * status pill above it. Anchoring it low-left leaves the terrain legible across
 * the rest of the sheet, which is the whole reason a cartouche sits in a corner.
 *
 * The sheet index inside it is the site's navigation.
 */
const Cartouche = () => (
  <section
    id="territory"
    className="relative min-h-[100svh] flex items-end px-8 md:px-16 pt-28 pb-20 md:pb-28"
  >
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.15, ease }}
      className="relative w-full max-w-[46rem]"
    >
      {/* the cartouche's own neatline, inset from the sheet's */}
      <div className="absolute -inset-x-5 -inset-y-6 md:-inset-x-8 md:-inset-y-9 border border-foreground/15 pointer-events-none">
        <span className="absolute -top-px -left-px w-2 h-2 border-t border-l border-foreground/45" />
        <span className="absolute -top-px -right-px w-2 h-2 border-t border-r border-foreground/45" />
        <span className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-foreground/45" />
        <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-foreground/45" />
      </div>

      <div className="relative bg-background/80">
        <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-foreground/55 mb-4">
          {CARTOUCHE.overline}
        </p>

        <HeadlineRefract
          lines={CARTOUCHE.lines}
          className="h-[6rem] sm:h-[9rem] md:h-[13.5rem] -ml-0.5 mb-6"
        />

        <div className="h-px bg-foreground/20 mb-6" />

        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 mb-7">
          {CARTOUCHE.meta.map((m) => (
            <div key={m.label}>
              <dt className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40 mb-1.5">
                {m.label}
              </dt>
              <dd className="text-[13px] leading-snug text-foreground/85">{m.value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-[12px] leading-relaxed text-foreground/50 mb-7 max-w-sm">
          {CARTOUCHE.note}
        </p>

        {/* the sheet index is the navigation */}
        <nav aria-label="Sheet index">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
            Sheet index
          </p>
          <ul className="border-t border-foreground/15">
            {PLATES.map((p) => (
              <IndexRow key={p.id} plate={p} />
            ))}
          </ul>
        </nav>
      </div>
    </motion.div>
  </section>
);

/** One row of the sheet index. Split out so each can hold its own spring. */
const IndexRow = ({ plate: p }: { plate: (typeof PLATES)[number] }) => {
  const ref = usePull<HTMLAnchorElement>({ pull: 13, radius: 150, rate: 3.1, damping: 0.5, swirl: 0.3 });
  return (
    <li>
      <a
        ref={ref}
        href={`#${p.id}`}
        onClick={(e) => {
          e.preventDefault();
          scrollToId(`#${p.id}`);
        }}
        className="group flex items-baseline gap-4 py-2 border-b border-foreground/10 hover:border-foreground/40 transition-colors duration-300"
      >
        <span className="font-mono text-[10px] text-foreground/40 w-5 shrink-0 group-hover:text-foreground transition-colors duration-300">
          {p.numeral}
        </span>
        <span className="text-[14px] text-foreground/80 group-hover:text-foreground transition-colors duration-300">
          {p.title}
        </span>
        {/* leader dots, the way an index actually sets */}
        <span className="flex-1 border-b border-dotted border-foreground/25 translate-y-[-3px]" />
          <span className="font-mono text-[10px] text-foreground/30 group-hover:text-foreground/70 transition-colors duration-300">
          ↓
        </span>
      </a>
    </li>
  );
};

export default Cartouche;
