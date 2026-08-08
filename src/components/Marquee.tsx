const items = [
  "React",
  "TypeScript",
  "React Native",
  "Design Systems",
  "PureScript",
  "Tailwind CSS",
  "REST APIs",
  "Node",
  "Framer Motion",
  "Three.js",
  "Git",
  "CI/CD",
];

const Track = ({ ariaHidden }: { ariaHidden?: boolean }) => (
  <ul
    className="flex shrink-0 items-center gap-10 pr-10 marquee-track"
    aria-hidden={ariaHidden}
  >
    {items.map((item) => (
      <li key={item} className="flex items-center gap-10 whitespace-nowrap">
        <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-foreground/55">
          {item}
        </span>
        <span className="w-1 h-1 rounded-full bg-primary/60" />
      </li>
    ))}
  </ul>
);

/** Full-bleed ticker — gives the page a band of continuous motion between static sections. */
const Marquee = () => (
  <div
    className="relative border-y border-border bg-primary/[0.035] py-4 overflow-hidden marquee"
    style={{
      // masked here, not on the track — this is the only element at viewport width
      maskImage:
        "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      WebkitMaskImage:
        "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
    }}
  >
    <div className="flex w-max">
      <Track />
      <Track ariaHidden />
    </div>
  </div>
);

export default Marquee;
