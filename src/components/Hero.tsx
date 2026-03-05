import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const Hero = () => {
  const letterVariants = {
    hidden: { y: 80, opacity: 0, rotateX: -60 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        delay: 0.15 + i * 0.04,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  const firstName = "Vinit";
  const lastName = "Khandal";

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden noise-bg">
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Software Engineer
          </span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.85] mb-8" style={{ perspective: "800px" }}>
          <span className="block overflow-hidden">
            {firstName.split("").map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </span>
          <span className="block overflow-hidden">
            {lastName.split("").map((letter, i) => (
              <motion.span
                key={i}
                custom={i + firstName.length}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="inline-block text-gradient"
              >
                {letter}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed mb-10"
        >
          Building pixel-perfect interfaces at{" "}
          <span className="text-primary font-medium">JUSPAY</span>.
          3 years crafting products that people love to use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <motion.a
            href="#work"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full font-medium text-sm transition-shadow hover:shadow-lg hover:shadow-primary/25"
          >
            View Work
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Get in touch
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-primary/3 rounded-full blur-[120px]" />

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
    </section>
  );
};

export default Hero;
