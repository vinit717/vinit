import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PenLine, ArrowUpRight } from "lucide-react";
import { scrollToId } from "@/lib/smoothScroll";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const Writing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="writing" className="py-20 md:py-28 px-6 border-t border-border" ref={ref}>
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="mb-10"
        >
          <p className="text-[13px] text-primary mb-5">Writing</p>
          <h2 className="font-serif text-2xl md:text-3xl">Notes from building things</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="flex flex-col sm:flex-row sm:items-center gap-5 p-7 md:p-8 rounded-lg border border-dashed border-border"
        >
          <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-md border border-border text-muted-foreground">
            <PenLine className="w-[18px] h-[18px]" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] mb-1">Nothing published yet.</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I'm planning to write up what I learn while building — design
              system internals, React Native quirks, backend gotchas. First
              post is coming soon.
            </p>
          </div>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("#contact");
            }}
            className="group link-underline shrink-0 flex items-center gap-1.5 text-sm text-foreground"
          >
            Suggest a topic
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Writing;
