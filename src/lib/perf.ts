/**
 * Adaptive quality. Rather than sniffing the user agent, this measures real
 * frame rate for a couple of seconds and downgrades once if the machine can't
 * hold it. `.perf-low` on <html> turns off backdrop blur and thins the field —
 * a fast Mac never notices, a weak laptop stops stuttering.
 */
export function startPerfWatch() {
  const root = document.documentElement;

  // obvious low-power signals: bail before we ever paint an expensive frame
  const cores = navigator.hardwareConcurrency ?? 8;
  if (cores <= 4) {
    root.classList.add("perf-low");
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("perf-low");
    return;
  }

  let frames = 0;
  let windowStart = performance.now();
  let samples = 0;
  let raf = 0;
  let spoiled = document.hidden;

  // A hidden tab throttles requestAnimationFrame to roughly one frame a second.
  // Measured naively that reads as ~1fps and permanently downgrades a machine
  // that is in fact perfectly fast — so any window that overlapped a hidden
  // period is discarded rather than scored.
  const restart = () => {
    frames = 0;
    windowStart = performance.now();
    spoiled = document.hidden;
  };
  document.addEventListener("visibilitychange", restart);

  const tick = () => {
    frames += 1;
    if (document.hidden) spoiled = true;

    const now = performance.now();
    const elapsed = now - windowStart;

    if (elapsed >= 1000) {
      const fps = (frames * 1000) / elapsed;
      const usable = !spoiled;
      frames = 0;
      windowStart = now;
      spoiled = document.hidden;
      if (usable) samples += 1;

      // ignore the first second — it includes mount, shader compile and fonts
      if (usable && samples > 1 && fps < 45) {
        root.classList.add("perf-low");
        document.removeEventListener("visibilitychange", restart);
        return;
      }
      if (samples >= 4) {
        document.removeEventListener("visibilitychange", restart); // settled
        return;
      }
    }

    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", restart);
  };
}

export const isPerfLow = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("perf-low");
