import { useState, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, User, FolderGit2, Briefcase, PenLine, Mail } from "lucide-react";
import { scrollToId } from "@/lib/smoothScroll";
import { springSnappy } from "@/lib/motion";

const navItems = [
  { label: "About", href: "#about", caption: "who I am", icon: User },
  { label: "Work", href: "#work", caption: "selected projects", icon: FolderGit2 },
  { label: "Experience", href: "#experience", caption: "where I've been", icon: Briefcase },
  { label: "Writing", href: "#writing", caption: "notes & experiments", icon: PenLine },
  { label: "Contact", href: "#contact", caption: "say hello", icon: Mail },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  // matches the class already on <html> so the first paint doesn't flip
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToId(href);
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "border-b border-transparent"
      }`}
    >
      <nav className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-[15px] font-medium tracking-tight"
        >
          Vinit Khandal
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="group relative link-underline text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {item.label}
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 flex items-center gap-1 whitespace-nowrap font-serif italic text-xs text-primary opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                <item.icon className="w-3 h-3 not-italic" strokeWidth={2} />
                {item.caption}
              </span>
            </a>
          ))}
          <motion.button
            onClick={() => setDark(!dark)}
            whileTap={{ scale: 0.88 }}
            transition={springSnappy}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-200 overflow-hidden"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                transition={springSnappy}
                className="flex"
              >
                {dark ? <Sun className="w-[15px] h-[15px]" /> : <Moon className="w-[15px] h-[15px]" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <motion.button
            onClick={() => setDark(!dark)}
            whileTap={{ scale: 0.88 }}
            transition={springSnappy}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground overflow-hidden"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                transition={springSnappy}
                className="flex"
              >
                {dark ? <Sun className="w-[15px] h-[15px]" /> : <Moon className="w-[15px] h-[15px]" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <motion.button
            onClick={() => setMobileOpen(!mobileOpen)}
            whileTap={{ scale: 0.88 }}
            transition={springSnappy}
            className="w-8 h-8 flex items-center justify-center text-foreground overflow-hidden"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                transition={springSnappy}
                className="flex"
              >
                {mobileOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden overflow-hidden bg-background border-b border-border"
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5"
            >
              {item.label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Navbar;
