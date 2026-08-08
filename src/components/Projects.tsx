import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, FileCode } from "lucide-react";
import { useSpotlight } from "@/hooks/useSpotlight";
import { springSoft } from "@/lib/motion";
import ThemePicker from "@/components/ThemePicker";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const projects = [
  {
    title: "White-label Design System",
    description:
      "A design system built to be reconfigured, not forked — every team can restyle tokens, swap components, and reshape theming to their own brand without touching the underlying code.",
    tags: ["Design Tokens", "Theming", "Component Library"],
    number: "01",
    interactive: true,
  },
  {
    title: "Cross-platform Mobile App",
    description:
      "A React Native app sharing business logic with the web platform while keeping native-feeling performance across iOS and Android.",
    tags: ["React Native", "iOS", "Android"],
    number: "02",
    interactive: false,
  },
];

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const spotlight = useSpotlight();

  return (
    <section id="work" className="py-20 md:py-28 px-6 border-t border-border" ref={ref}>
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="mb-14"
        >
          <p className="text-[13px] text-primary mb-5">What I've built</p>
          <h2 className="font-serif text-2xl md:text-3xl">Selected work</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05, ease }}
          className="rounded-xl border border-border overflow-hidden bg-card/40"
        >
          {/* editor tab bar */}
          <div className="flex items-center gap-4 px-4 h-11 border-b border-border bg-card">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ec6a5e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f4bf4f]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#61c454]" />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileCode className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">selected-work.tsx</span>
            </div>
          </div>

          <div className="flex">
            {/* decorative line-number rail — repeating so it always matches the content height */}
            <div
              className="hidden md:block w-11 shrink-0 border-r border-border select-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(hsl(var(--muted-foreground) / 0.28) 0 1px, transparent 1px 26px)",
                backgroundPosition: "0 2rem",
                backgroundSize: "14px 100%",
                backgroundRepeat: "repeat-y",
              }}
              aria-hidden
            />

            <div className="flex-1 p-4 md:p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((project, i) => {
                  const tilt = i % 2 === 0 ? -1.5 : 1.5;
                  return (
                    <motion.div
                      key={project.title}
                      initial={{ opacity: 0, y: 30, rotate: tilt * 5 }}
                      animate={isInView ? { opacity: 1, y: 0, rotate: tilt } : {}}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease }}
                      whileHover={{ y: -4, rotate: 0, transition: springSoft }}
                      whileTap={{ scale: 0.98, transition: springSoft }}
                      onMouseMove={spotlight.onMouseMove}
                      className={`group relative bg-card border border-border rounded-lg p-7 md:p-8 hover:border-foreground/25 transition-colors duration-300 cursor-pointer overflow-hidden ${spotlight.className}`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <span className="font-mono text-xs text-muted-foreground">
                          {project.number}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                      </div>

                      <h3 className="font-serif text-lg mb-2.5">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 text-xs font-mono text-muted-foreground rounded-md border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {project.interactive && <ThemePicker />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
