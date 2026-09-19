import { useSyncExternalStore } from "react";

export const brandSwatches = [
  { name: "Terracotta", hue: 13 },
  { name: "Indigo", hue: 250 },
  { name: "Forest", hue: 150 },
  { name: "Berry", hue: 325 },
  { name: "Ocean", hue: 195 },
];

export const RADII = [
  { id: "sharp", label: "Sharp", value: "0rem" },
  { id: "soft", label: "Soft", value: "0.5rem" },
  { id: "round", label: "Round", value: "1.25rem" },
] as const;

export const DENSITIES = [
  { id: "compact", label: "Compact", value: 0.7 },
  { id: "regular", label: "Regular", value: 1 },
  { id: "airy", label: "Airy", value: 1.35 },
] as const;

export const SCALES = [
  { id: "tight", label: "Tight", value: 0.92 },
  { id: "regular", label: "Regular", value: 1 },
  { id: "large", label: "Large", value: 1.1 },
] as const;

export type SystemConfig = {
  hue: number;
  radius: (typeof RADII)[number]["id"];
  density: (typeof DENSITIES)[number]["id"];
  scale: (typeof SCALES)[number]["id"];
};

let config: SystemConfig = {
  hue: brandSwatches[0].hue,
  radius: "soft",
  density: "regular",
  scale: "regular",
};

const listeners = new Set<() => void>();

/**
 * Writes the whole configuration out as CSS custom properties. Nothing in the
 * page reads these values directly — they only ever read the tokens, which is
 * the point being demonstrated.
 */
function apply() {
  const root = document.documentElement.style;

  const accent = `${config.hue} 68% 50%`;
  root.setProperty("--primary", accent);
  root.setProperty("--accent", accent);
  root.setProperty("--ring", accent);
  root.setProperty("--sidebar-primary", accent);
  root.setProperty("--sidebar-ring", accent);

  root.setProperty("--radius", RADII.find((r) => r.id === config.radius)!.value);

  const density = DENSITIES.find((d) => d.id === config.density)!.value;
  root.setProperty("--pane-pad-y", `${5 * density}rem`);
  root.setProperty("--pane-pad-x", `${3 * density}rem`);

  const scale = SCALES.find((s) => s.id === config.scale)!.value;
  root.setProperty("--type-scale", String(scale));

  listeners.forEach((fn) => fn());
}

export function setSystem(patch: Partial<SystemConfig>) {
  config = { ...config, ...patch };
  apply();
}

/** Kept for the shader, which needs the raw hue rather than a CSS variable. */
export function applyBrandHue(hue: number) {
  setSystem({ hue });
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useSystem() {
  return useSyncExternalStore(subscribe, () => config, () => config);
}

export function useBrandHue() {
  return useSyncExternalStore(subscribe, () => config.hue, () => config.hue);
}
