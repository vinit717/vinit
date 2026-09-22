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
    // A short easing tail keeps the story fluid without making scrolling sluggish.
    duration: 1.05,
    easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    wheelMultiplier: 0.9,
    touchMultiplier: 1,
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
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
}
