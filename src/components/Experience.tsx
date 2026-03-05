import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
  {
    role: "UI Developer",
    company: "JUSPAY",
    period: "Nov 2024 — Present",
    location: "Bengaluru, India",
    description:
      "Building and scaling payment UIs serving millions of transactions. Working on design systems and frontend architecture for India's leading payment infrastructure.",
  },
  {
    role: "Software Developer",
    company: "Previous Role",
    period: "2022 — 2024",
    location: "India",
    description:
      "Developed innovative features, delivered impactful projects, and collaborated across teams to ship high-quality software products.",
  },
];

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="experience" className="py-24 md:py-32 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-4">
            // experience
          </p>
          <h2 className="text-3xl md:text-5xl font-bold">Where I've worked</h2>
        </motion.div>

        <div className="space-y-0">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              whileHover={{ x: 4 }}
              className="group border-t border-border py-8 md:py-10 grid md:grid-cols-[1fr_2fr] gap-4 md:gap-8 hover:bg-secondary/40 transition-all duration-300 px-5 -mx-5 rounded-xl cursor-default"
            >
              <div className="text-center md:text-left">
                <p className="font-mono text-xs text-muted-foreground mb-1">{exp.period}</p>
                <p className="text-sm text-muted-foreground">{exp.location}</p>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                  {exp.role}
                </h3>
                <p className="text-primary font-mono text-sm mb-3">{exp.company}</p>
                <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
};

export default Experience;
