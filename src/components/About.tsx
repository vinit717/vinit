import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const skills = [
    "React", "TypeScript", "PureScript", "JavaScript",
    "Tailwind CSS", "Framer Motion", "UI/UX", "Design Systems",
    "Performance", "Accessibility", "Git", "Figma"
  ];

  return (
    <section id="about" className="py-24 md:py-32 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-4">
            // about
          </p>

          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
            I build interfaces that{" "}
            <span className="text-gradient">feel right</span>.
          </h2>

          <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg mb-12">
            <p>
              Developer with a proven track record of building innovative features
              and delivering impactful projects. Currently shaping payment experiences
              at JUSPAY — India's leading payment infrastructure company.
            </p>
            <p>
              I obsess over the details that make software feel crafted: micro-interactions,
              type scales, whitespace, and the invisible work that separates good
              from great.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p className="font-mono text-xs text-muted-foreground mb-6 uppercase tracking-widest">
            Technologies
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.04 }}
                whileHover={{ scale: 1.08, y: -2 }}
                className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-mono rounded-full border border-border cursor-default magnetic-hover"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
