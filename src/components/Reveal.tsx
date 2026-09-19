import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ease } from "@/lib/motion";

export type Segment = { text: string; className?: string };

type Props = {
  children: string | Segment[];
  className?: string;
  delay?: number;
  /** Seconds between characters. The reference uses 18ms. */
  stagger?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
};

/**
 * Character-level reveal. Each word is its own nowrap flex row so it can never
 * break mid-word, and every character rises from behind its own mask. The full
 * string is exposed once to screen readers; the split copy is aria-hidden.
 */
const Reveal = ({
  children,
  className,
  delay = 0,
  stagger = 0.018,
  as: Tag = "span",
}: Props) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const segments: Segment[] = typeof children === "string" ? [{ text: children }] : children;
  const plain = segments.map((s) => s.text).join("");

  // Flatten to characters first, then group into words. Splitting each segment
  // on spaces independently produced an empty word at segment boundaries, which
  // rendered as a double space.
  const chars: { ch: string; className?: string }[] = [];
  segments.forEach((seg) =>
    Array.from(seg.text).forEach((ch) => chars.push({ ch, className: seg.className })),
  );

  const words: (typeof chars)[] = [];
  let current: typeof chars = [];
  chars.forEach((c) => {
    if (c.ch === " ") {
      if (current.length) words.push(current);
      current = [];
    } else {
      current.push(c);
    }
  });
  if (current.length) words.push(current);

  let charIndex = 0;

  return (
    <Tag ref={ref as never} className={className}>
      <span className="sr-only">{plain}</span>

      <span aria-hidden className="inline-flex flex-wrap">
        {words.map((word, wi) => (
          <span key={wi} className="inline-flex flex-nowrap">
            {word.map((c) => {
              const at = delay + charIndex * stagger;
              charIndex += 1;
              return (
                <span
                  key={charIndex}
                  className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em]"
                >
                  <motion.span
                    className={`inline-block whitespace-pre ${c.className ?? ""}`}
                    initial={{ y: "115%" }}
                    animate={inView ? { y: "0%" } : undefined}
                    transition={{ duration: 0.85, delay: at, ease }}
                  >
                    {c.ch}
                  </motion.span>
                </span>
              );
            })}
            {wi < words.length - 1 && <span className="whitespace-pre">&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  );
};

export default Reveal;
