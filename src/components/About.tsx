import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Layers } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const facts = [
  { label: "Role", value: "Software Engineer" },
  { label: "Company", value: "Juspay" },
  { label: "Based in", value: "Bengaluru, India" },
  { label: "Focus", value: "React, mobile, design systems" },
];

const skills = [
  "React", "React Native", "TypeScript", "PureScript", "JavaScript",
  "REST APIs", "Tailwind CSS", "Design Systems", "Git",
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="py-20 md:py-28 px-6 border-t border-border relative overflow-hidden" ref={ref}>
      <Layers
        className="hidden md:block absolute -left-12 bottom-0 w-64 h-64 text-foreground/[0.04] pointer-events-none"
        strokeWidth={1}
        style={{ transform: "rotate(10deg)" }}
      />
      <div className="relative max-w-container mx-auto grid md:grid-cols-[1.3fr_1fr] gap-12 md:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-[13px] text-primary mb-5">About</p>

          <h2 className="font-serif text-2xl md:text-3xl leading-snug mb-6">
            I move between the app, the API, and the system underneath.
          </h2>

          <div className="space-y-4 text-foreground/70 leading-relaxed text-[15px]">
            <p>
              I'm a software engineer at Juspay, India's leading payment
              infrastructure company. Most of my time is spent in React,
              with React Native for mobile and enough backend work to ship
              a feature end to end. Lately that's meant building a
              white-labeled design system that lets every team reconfigure
              tokens, components, and theming to their own brand — without
              touching the underlying code.
            </p>
            <p>
              I like the parts of the stack that aren't glamorous: getting a
              config schema right, making a component genuinely reusable, or
              making sure a mobile screen feels as considered as a web one.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <dl className="space-y-4 mb-10">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3 border-b border-border">
                <dt className="text-[13px] text-muted-foreground">{fact.label}</dt>
                <dd className="text-sm text-right">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <p className="text-[13px] text-muted-foreground mb-3">Technologies</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 text-[13px] text-muted-foreground rounded-md border border-border"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
