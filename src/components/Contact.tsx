import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Linkedin, Github, Mail } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const links = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/vinit-khandal/", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/vinit717", icon: Github },
  { label: "Email", href: "mailto:vinit224488@gmail.com", icon: Mail },
];

const lookingFor = [
  "Problems worth solving properly",
  "Systems that outlast the people who built them",
  "Teams that ship, not just plan",
  "Room to work across the whole stack",
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="py-20 md:py-28 px-6 border-t border-border" ref={ref}>
      <div className="max-w-container mx-auto grid md:grid-cols-[1.2fr_1fr] gap-12 md:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-[13px] text-primary mb-5">Let's connect</p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-6">
            Got a project in mind?
          </h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-10 max-w-md">
            I'm always open to discussing new opportunities, collaborations,
            or just talking through a tricky React, mobile, or backend
            problem.
          </p>

          <div className="flex flex-wrap gap-6">
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease }}
                className="group link-underline flex items-center gap-2 text-sm"
              >
                <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>{link.label}</span>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, rotate: 1.5 }}
          animate={isInView ? { opacity: 1, y: 0, rotate: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="p-7 rounded-lg border border-border bg-card h-fit"
        >
          <p className="font-serif text-lg mb-5">What I look for</p>
          <ul className="space-y-4">
            {lookingFor.map((item) => (
              <li key={item} className="flex items-start gap-3 pb-4 border-b border-dashed border-border last:border-b-0 last:pb-0">
                <span className="mt-0.5 w-4 h-4 shrink-0 rounded-sm border border-muted-foreground/40" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="md:col-span-2 mt-4 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Vinit Khandal
          </p>
          <p className="text-xs text-muted-foreground">
            Designed & built with care
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
