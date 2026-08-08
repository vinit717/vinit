import { useSyncExternalStore } from "react";

export const brandSwatches = [
  { name: "Terracotta", hue: 13 },
  { name: "Indigo", hue: 250 },
  { name: "Forest", hue: 150 },
  { name: "Berry", hue: 325 },
  { name: "Ocean", hue: 195 },
];

let currentHue = brandSwatches[0].hue;
const listeners = new Set<() => void>();

/** Rewrites the accent tokens on :root — every component reads these, including the 3D scene. */
export function applyBrandHue(hue: number) {
  const root = document.documentElement.style;
  const value = `${hue} 68% 50%`;
  root.setProperty("--primary", value);
  root.setProperty("--accent", value);
  root.setProperty("--ring", value);
  root.setProperty("--sidebar-primary", value);
  root.setProperty("--sidebar-ring", value);

  currentHue = hue;
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Live brand hue, for anything that can't read a CSS variable (canvas, WebGL). */
export function useBrandHue() {
  return useSyncExternalStore(
    subscribe,
    () => currentHue,
    () => currentHue,
  );
}
