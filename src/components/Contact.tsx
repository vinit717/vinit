import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Linkedin, Github, Mail } from "lucide-react";

const links = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/vinit-khandal/", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/vinit717", icon: Github },
  { label: "Email", href: "mailto:vinit224488@gmail.com", icon: Mail },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="py-24 md:py-32 px-6" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="font-mono text-xs tracking-widest text-primary uppercase mb-4">
            // let's connect
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            Got a project in
            <br />
            <span className="text-gradient">mind?</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-12 max-w-md mx-auto">
            I'm always open to discussing new opportunities, collaborations, or just geeking out about interfaces.
          </p>

          <div className="flex justify-center gap-4">
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 px-5 py-3 rounded-full bg-secondary border border-border text-secondary-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 font-mono text-sm"
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-24 md:mt-32 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-center"
        >
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 Vinit Khandal
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Designed & Built with care
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
