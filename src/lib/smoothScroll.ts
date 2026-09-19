import Lenis from "lenis";

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (lenis || typeof window === "undefined") return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  // Lenis rewrites <html> className when it initialises, which drops the theme
  // class set in index.html and left the site defaulting to light.
  const root = document.documentElement;
  const preserved = Array.from(root.classList);

  lenis = new Lenis({
    // Heavier glide: a longer tail with an exponential ease is what gives scroll
    // its weight. The previous 1.1s cubic settled too fast to feel like momentum.
    duration: 1.5,
    easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    wheelMultiplier: 0.9,
    touchMultiplier: 1.6,
  });

  requestAnimationFrame(() => {
    preserved.forEach((c) => root.classList.add(c));
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  return lenis;
}

export function scrollToId(id: string) {
  const target = document.querySelector(id);
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { offset: -16 });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
}
