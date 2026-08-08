import { motion } from "framer-motion";
import { ArrowUpRight, Coffee, Moon, Terminal, GitBranch, Smartphone, Blocks } from "lucide-react";
import { scrollToId } from "@/lib/smoothScroll";
import Magnetic from "@/components/Magnetic";
import IconReveal from "@/components/IconReveal";
import SystemStage from "@/components/SystemStage";
import { springSnappy, ease } from "@/lib/motion";

const traits = [
  { icon: Coffee, caption: "Runs on coffee" },
  { icon: Moon, caption: "Night owl" },
  { icon: Terminal, caption: "Lives in the terminal" },
  { icon: GitBranch, caption: "Ships often" },
  { icon: Smartphone, caption: "Mobile-first" },
  { icon: Blocks, caption: "Systems thinker" },
];

const Hero = () => (
  <section className="px-6 pt-28 pb-16 md:pt-32 md:pb-20 relative overflow-hidden">
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.06) 1px, transparent 1px)`,
        backgroundSize: "26px 26px",
        maskImage: "radial-gradient(ellipse 60% 55% at 12% 0%, black, transparent)",
      }}
    />

    <div className="relative max-w-container mx-auto grid lg:grid-cols-[1fr_1.08fr] gap-12 lg:gap-16 items-center">
      {/* min-w-0: without it the canvas's intrinsic width blows the fr tracks open */}
      <div className="min-w-0">
        <motion.div
          initial={{ opacity: 0, rotate: -6 }}
          animate={{ opacity: 1, rotate: -2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/[0.06]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[13px] text-foreground/80">
            Bengaluru, India · available for select work
          </span>
        </motion.div>

        <p className="font-serif italic text-xl md:text-2xl text-muted-foreground mb-3">
          Hi, I'm Vinit —
        </p>

        <div className="overflow-hidden mb-6">
          <motion.h1
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="font-serif text-4xl md:text-5xl xl:text-6xl leading-[1.12]"
          >
            I build things that <span className="italic text-primary">just work</span>.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
          className="text-base md:text-lg text-foreground/70 leading-relaxed mb-9 max-w-xl"
        >
          Mostly React, some React Native, and enough backend to ship the
          whole thing myself. Right now I'm at{" "}
          <span className="text-foreground font-medium">Juspay</span>,
          building a white-labeled design system that lets every team
          reshape it to their own brand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease }}
          className="flex flex-wrap gap-3 items-center"
        >
          <Magnetic>
            <motion.a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("#work");
              }}
              whileTap={{ scale: 0.96 }}
              transition={springSnappy}
              className="group flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium transition-opacity hover:opacity-90"
            >
              View work
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </Magnetic>
          <Magnetic>
            <motion.a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("#contact");
              }}
              whileTap={{ scale: 0.96 }}
              transition={springSnappy}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium border border-border text-foreground hover:border-foreground/30 transition-colors duration-200"
            >
              Get in touch
            </motion.a>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-wrap gap-5 mt-12"
        >
          {traits.map((trait) => (
            <IconReveal key={trait.caption} icon={trait.icon} caption={trait.caption} />
          ))}
        </motion.div>
      </div>

      <SystemStage />
    </div>
  </section>
);

export default Hero;
