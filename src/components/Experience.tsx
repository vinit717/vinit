import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ease } from "@/lib/motion";

const experiences = [
  {
    role: "UI Developer",
    company: "Juspay",
    period: "Nov 2024 — Present",
    location: "Bengaluru, India",
    description:
      "Building and scaling payment UIs. Working on design systems and frontend architecture for India's leading payment infrastructure.",
    tags: ["Design Systems", "Frontend Architecture", "Payment UIs"],
    current: true,
  },
  {
    role: "Full Stack Developer",
    company: "Bliro",
    period: "2023 — 2024",
    location: "Remote, Germany",
    description:
      "Strengthened engineering quality by building a comprehensive testing ecosystem (unit, integration, E2E), migrating the desktop app to TypeScript, establishing CI/CD and linting standards, and integrating Stripe and Jira to streamline payments and issue tracking.",
    tags: ["TypeScript", "Testing", "CI/CD", "Stripe"],
    current: false,
  },
  {
    role: "Frontend Developer",
    company: "Quinite Technologies",
    period: "2022 — 2023",
    location: "Remote, India",
    description:
      "Developed features, delivered impactful projects, and collaborated across teams to ship high-quality software products.",
    tags: ["Frontend", "Feature Delivery"],
    current: false,
  },
];

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="experience" className="py-20 md:py-28 px-6 border-t border-border" ref={ref}>
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
          className="mb-14"
        >
          <p className="text-[13px] text-primary mb-5">Experience</p>
          <h2 className="font-serif text-2xl md:text-3xl">Where I've worked</h2>
        </motion.div>

        <div className="relative">
          {/* the rail the nodes hang off — stops at the last entry, not the section edge */}
          <span
            className="hidden md:block absolute left-[7px] top-4 bottom-16 w-px bg-border"
            aria-hidden
          />

          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.08 + i * 0.08, ease }}
              className="group relative md:pl-10 py-8 border-b border-border last:border-b-0"
            >
              <span
                className={`hidden md:block absolute left-0 top-[38px] w-[15px] h-[15px] rounded-full border-2 transition-colors duration-300 ${
                  exp.current
                    ? "bg-primary border-primary"
                    : "bg-background border-border group-hover:border-primary"
                }`}
                aria-hidden
              />

              <div className="grid md:grid-cols-[190px_1fr] gap-2 md:gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">{exp.period}</p>
                  <p className="text-sm text-muted-foreground">{exp.location}</p>
                </div>

                <div>
                  <h3 className="text-[15px] font-medium mb-1.5">
                    {exp.role}{" "}
                    <span className="text-muted-foreground font-normal">— {exp.company}</span>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm mb-4 max-w-2xl">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs font-mono text-muted-foreground rounded-md border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
