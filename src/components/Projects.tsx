import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Design System",
    description:
      "Created a comprehensive component library ensuring visual consistency across multiple product verticals.",
    tags: ["Components", "Tokens", "Documentation"],
    number: "01",
  },
  {
    title: "Interactive Dashboards",
    description:
      "Built data-rich dashboards with real-time analytics, complex filtering, and responsive visualizations.",
    tags: ["TypeScript", "Charts", "Performance"],
    number: "02",
  },
];

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="work" className="py-24 md:py-32 px-6 noise-bg" ref={ref}>
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-4">
            // selected work
          </p>
          <h2 className="text-3xl md:text-5xl font-bold">Things I've built</h2>
        </motion.div>

        <div className="grid gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group relative bg-card border border-border rounded-2xl p-7 md:p-9 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-mono text-4xl md:text-5xl font-bold text-muted-foreground/20">
                  {project.number}
                </span>
                <motion.div
                  whileHover={{ scale: 1.3, rotate: 12 }}
                  className="p-2 rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </motion.div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-mono bg-secondary text-muted-foreground rounded-full border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hover glow */}
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/8 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
