import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Check, Code2, Copy, Heart, Layers3, Pause, Play, Sparkles } from "lucide-react";
import Workbench, { Flower } from "@/components/edition/Workbench";
import { CORRESPONDENCE, STATIONS, TRAVERSE } from "@/lib/survey";
import { scrollToId } from "@/lib/smoothScroll";
import "./edition.css";

const ease = [0.22, 1, 0.36, 1] as const;
const filters = ["All work", "Interfaces", "Mobile", "Systems"] as const;
type Filter = typeof filters[number];
const categories: Filter[] = ["Systems", "Mobile", "Interfaces", "Systems"];

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.65, ease }}>{children}</motion.div>;
}

function Jump({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return <a href={`#${id}`} className={className} onClick={event => { event.preventDefault(); scrollToId(`#${id}`); window.history.replaceState(null, "", `#${id}`); }}>{children}</a>;
}

function ProjectDemo({ index }: { index: number }) {
  const [theme, setTheme] = useState(0);
  const [paid, setPaid] = useState(false);
  const [tab, setTab] = useState(0);

  if (index === 0) return <div className={`project-art system-art theme-${theme}`}>
    <span className="art-label"><Layers3 size={14} /> ONE FOUNDATION. EVERY EXPRESSION.</span>
    <span className="system-background-type" aria-hidden="true">Aa</span>
    <div className="token-card" aria-hidden="true"><span>THE LITTLE DETAILS</span><div><i /><i /><i /><i /></div><p>color / type / rhythm</p></div>
    <div className="system-window"><div className="demo-window-top"><span /><span /><span /></div><div className="demo-brand"><span className="brand-symbol">✳</span>{["Forma", "Mellow", "Studio"][theme]}</div><p className="system-tagline">A system that<br /><em>feels like you.</em></p><button className="demo-primary" aria-label="Try the next design-system theme" onClick={() => setTheme((theme + 1) % 3)}>Make it yours <ArrowUpRight size={17} /></button><div className="demo-colors">{["#666fa0", "#c4775d", "#3c614b"].map((color, i) => <button key={color} style={{ background: color }} aria-label={`Preview ${["violet", "peach", "forest"][i]} theme`} aria-pressed={theme === i} onClick={() => setTheme(i)}>{theme === i && <Check size={14} />}</button>)}<span>Try a color ↖</span></div></div>
    <span className="art-caption">INTERACTIVE STUDY 01</span>
  </div>;

  if (index === 1) return <div className="project-art mobile-art">
    <span className="art-label">A FAMILIAR FEELING. EVERYWHERE.</span><div className="mobile-halo" /><span className="mobile-word" aria-hidden="true">on the<br /><em>move.</em></span>
    <div className="phone"><div className="phone-island" /><div className="phone-time">9:41 <span>••• ▰</span></div><p className="phone-greeting">A little more possibility.</p><h4>{tab === 0 ? <>Everyday,<br />made easier.</> : <>A place for<br />everything.</>}</h4><div className="phone-orb"><Flower /></div><div className="phone-card"><span>{tab === 0 ? "YOUR SPACE" : "YOUR COLLECTION"}</span><strong>{tab === 0 ? "Good things ahead" : "All the little things"}</strong><ArrowUpRight size={18} /></div><div className="phone-tabs">{["Discover", "Saved"].map((label, i) => <button key={label} aria-pressed={tab === i} onClick={() => setTab(i)}>{i === 0 ? <Sparkles size={14} /> : <Heart size={14} />}{label}</button>)}</div></div>
    <span className="art-caption">INTERACTIVE STUDY 02</span>
  </div>;

  if (index === 2) return <div className="project-art payment-art">
    <span className="art-label">COMPLEX UNDERNEATH. SIMPLE UP HERE.</span><div className="payment-orbit" /><div className={`payment-window ${paid ? "is-paid" : ""}`}><div className="payment-icon">{paid ? <Check size={30} /> : <Sparkles size={29} />}</div><span className="demo-eyebrow">THE FEELING OF GETTING IT RIGHT</span><h4>{paid ? "And you’re all set." : "One less thing to think about."}</h4><p>{paid ? "A small interaction. A little reassurance." : "Thoughtful details, right to the finish."}</p><button className="demo-primary" onClick={() => setPaid(!paid)}>{paid ? "Try it again" : "Try the interaction"}{paid ? <ArrowRight size={17} /> : <ArrowUpRight size={17} />}</button><span className="payment-demo-note">Just a demo. No payment involved.</span></div><span className="payment-spark spark-one" aria-hidden="true">✳</span><span className="payment-spark spark-two" aria-hidden="true">✧</span><span className="art-caption">INTERACTIVE STUDY 03</span>
  </div>;

  return <div className="project-art testing-art"><span className="art-label">THE QUIET CONFIDENCE OF GOOD FOUNDATIONS.</span><div className="terminal"><div className="terminal-bar"><span /><span /><span /><p>behind-the-scenes / checks</p></div><div className="terminal-content"><p><span className="terminal-purple">›</span> building something dependable</p>{["Types that make sense", "Components that hold up", "Journeys that just work", "Ready for what comes next"].map((s, i) => <div key={s}><Check size={15} /><span>{s}</span><small>0.{i + 2}s</small></div>)}<div className="terminal-result"><span>4 checks passed</span><span>all good ↗</span></div></div></div><div className="quality-stamp" aria-hidden="true"><Check size={24} /><span>BUILT TO<br />HOLD UP</span></div><span className="art-caption">ILLUSTRATIVE STUDY 04</span></div>;
}

export default function Index() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("All work");
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const still = paused || !!reduced;
  const visibleProjects = STATIONS.map((project, index) => ({ ...project, index })).filter(project => filter === "All work" || categories[project.index] === filter);

  useEffect(() => () => { clearTimeout(copyTimer.current); }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(CORRESPONDENCE.links[0].value);
      setCopied(true);
      setCopyFailed(false);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch { setCopyFailed(true); }
  }

  return <div id="intro" className={`edition ${still ? "motion-paused" : ""}`}>
    <a className="skip-link" href="#work">Skip to selected work</a>
    <motion.div className="reading-progress" style={{ scaleX: reduced ? scrollYProgress : progress }} />
    <header className="edition-header">
      <Jump id="intro" className="wordmark"><span className="wordmark-flower">✳</span>vinit<span className="wordmark-dot">.</span></Jump>
      <span className="header-note">A builder. A tinkerer. A curious human.</span>
      <nav aria-label="Main navigation"><Jump id="work">Work <sup>04</sup></Jump><Jump id="about">About</Jump><Jump id="contact" className="nav-contact">Say hello <ArrowUpRight size={15} /></Jump></nav>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="status-dot" /> VINIT KHANDAL · SOFTWARE ENGINEER</p>
          <h1><span>Built to work.</span><em>Made to feel.</em><svg className="headline-underline" viewBox="0 0 420 22" fill="none" aria-hidden="true"><path d="M3 13C119-2 285 2 413 9M25 21C171 8 302 10 369 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></h1>
          <p className="hero-description">I’m Vinit. I turn complex problems into thoughtful interfaces, useful systems, and little moments of delight.</p>
          <div className="hero-actions"><Jump id="work" className="primary-link">Explore my work <ArrowDown size={18} /></Jump><Jump id="about" className="text-link">A little about me <ArrowUpRight size={16} /></Jump></div>
          <div className="hero-location"><span className="location-symbol">↗</span><p>Currently building at <strong>Juspay</strong><span>Bengaluru, India · A little corner of the internet</span></p></div>
        </div>
        <Workbench paused={still} />
        <div className="hero-bottom"><span>GOOD ENGINEERING. A HUMAN TOUCH.</span><span className="scroll-hint">Take a look around <ArrowDown size={14} /></span><button className="motion-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? "Resume ambient animation" : "Pause ambient animation"} aria-pressed={paused}>{still ? <Play size={12} /> : <Pause size={12} />}{still ? "Motion paused" : "A little motion"}</button></div>
      </section>

      <section id="work" className="work-section">
        <Reveal className="section-heading"><div><p className="eyebrow"><span>01</span> SELECTED WORK</p><h2>Good things take<br /><em>a little care.</em></h2></div><p>A few things I’ve helped bring to life.<br />From the details you touch to the<br className="desktop-break" /> systems you don’t have to think about.</p></Reveal>
        <div className="work-toolbar"><div className="work-filters" role="group" aria-label="Filter selected work">{filters.map(name => <button key={name} onClick={() => setFilter(name)} aria-pressed={filter === name}>{name}{name === "All work" && <span>04</span>}</button>)}</div><span className="work-count" role="status">{String(visibleProjects.length).padStart(2, "0")} selected pieces</span></div>
        <div className="projects-grid">{visibleProjects.map(project => <Reveal key={project.mark} className={`project project-${project.index}`}>
          <ProjectDemo index={project.index} />
          <div className="project-meta"><span>{project.locality} <i /> {categories[project.index]}</span><span>0{project.index + 1}</span></div>
          <h3>{project.name}</h3><p className="project-description">{project.note}</p><div className="project-tags">{project.materials.split(" · ").map(tag => <span key={tag}>{tag}</span>)}</div>
        </Reveal>)}</div>
        <p className="work-note"><span>↳</span> A little peek at the thinking. These are interactive illustrations of my work, not production screenshots.</p>
      </section>

      <section className="belief-strip" aria-label="Approach to building"><span>Thoughtful by design.</span><Flower /><span>Playful by nature.</span><Flower /><span>Built with care.</span><Flower /></section>

      <section id="about" className="about-section">
        <Reveal className="about-intro"><p className="eyebrow"><span>02</span> THE HUMAN BEHIND THE CODE</p><div className="about-title-row"><h2>Serious about the craft.<br /><em>Curious about everything.</em></h2><span className="about-doodle" aria-hidden="true">✳</span></div></Reveal>
        <div className="about-grid">
          <Reveal className="about-story"><div className="hello-card"><div className="hello-card-top"><span>A SMALL INTRODUCTION</span><ArrowUpRight size={20} /></div><span className="hello-script">hello, I’m</span><span className="hello-name">Vinit<span>☺</span></span><div className="hello-card-bottom"><span>SOFTWARE ENGINEER</span><span>BENGALURU, IN</span></div><div className="paper-tape" /></div><p>I care about how software feels. The way a button responds. How a screen flows. Whether a complicated task suddenly feels simple.</p><p>My work spans interfaces, design systems, and mobile apps — with enough curiosity to follow a problem all the way through.</p><a className="text-link" href={CORRESPONDENCE.links[1].href} target="_blank" rel="noopener noreferrer">See what I’m building <ArrowUpRight size={16} /></a></Reveal>
          <div className="journey"><p className="journey-label">THE JOURNEY SO FAR <span>2022 — NOW</span></p>{TRAVERSE.slice().reverse().map((role, i) => <Reveal key={role.locality} className="journey-row"><div className="journey-date"><span>{role.from} — {i === 0 ? "NOW" : role.to}</span>{i === 0 && <span className="current-label"><i className="status-dot" />CURRENTLY</span>}</div><h3>{role.locality}<ArrowUpRight size={20} /></h3><span className="journey-role">{role.role} · {role.place}</span><p>{role.note}</p></Reveal>)}</div>
        </div>
        <Reveal className="toolbox"><span><Code2 size={18} /> THINGS I REACH FOR</span><div>{["React", "TypeScript", "React Native", "PureScript", "Design systems"].map(tool => <span key={tool}>{tool}</span>)}</div></Reveal>
      </section>

      <footer id="contact" className="contact-section">
        <div className="contact-top"><span className="eyebrow"><span>03</span> GOOD THINGS START WITH A HELLO</span><span><i className="status-dot" /> OPEN TO A GOOD CONVERSATION</span></div>
        <div className="contact-main"><Reveal><h2>Have a good idea?<br /><em>Let’s make it real.</em></h2><p>A project, a tricky problem, or just a friendly hello.<br />There’s always room for a good conversation.</p><div className="contact-actions"><a className="contact-cta" href={CORRESPONDENCE.links[0].href}>Get in touch <ArrowUpRight size={20} /></a><button className="copy-email" onClick={copyEmail} aria-label="Copy email address">{copied ? <Check size={16} /> : <Copy size={16} />}<span aria-live="polite">{copied ? "Email copied" : "Copy email"}</span></button></div>{copyFailed && <p className="copy-fallback" role="status">You can copy it here: <a href={CORRESPONDENCE.links[0].href}>{CORRESPONDENCE.links[0].value}</a></p>}</Reveal><div className="contact-flower"><Flower /><span>something good<br />could grow here.</span></div></div>
        <div className="footer-bottom"><Jump id="intro" className="wordmark"><span className="wordmark-flower">✳</span>vinit<span className="wordmark-dot">.</span></Jump><span>MADE WITH CARE & A LITTLE CURIOSITY. © {new Date().getFullYear()}</span><div>{CORRESPONDENCE.links.slice(1).map(link => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={14} /></a>)}<Jump id="intro" className="back-top">Back to top <ArrowUp size={15} /></Jump></div></div>
      </footer>
    </main>
  </div>;
}
