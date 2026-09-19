/**
 * The instrument, for a device with no cursor.
 *
 * On a phone every cursor-driven part of the sheet — the lens that halves the
 * contour interval, the reticle, the swell and swirl in the ground — simply had
 * no input, so the whole interaction was missing. Device tilt is the honest
 * substitute: you tip the sheet and the ground answers, the way you would tilt a
 * paper map to catch the light across it.
 *
 * The reading is always RELATIVE to a baseline captured on the first event, so
 * it works the same whether the phone is held flat on a table or upright in a
 * hand — an absolute reading would peg the instrument to the edge of the sheet
 * for anyone not holding their phone at exactly the angle we guessed.
 */

import { sheet } from "./territory";

export const tilt = {
  /** true once orientation events are actually arriving */
  active: false,
  /** -1..1, left to right across the sheet */
  x: 0,
  /** -1..1, bottom to top of the sheet */
  y: 0,
};

/** Degrees of tilt that take the instrument from the centre to the edge. */
const RANGE = 22;

let baseline: { beta: number; gamma: number } | null = null;
let listening = false;

const clamp = (v: number) => Math.max(-1, Math.min(v, 1));

function onOrient(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  if (!baseline) baseline = { beta: e.beta, gamma: e.gamma };

  // Tipping the top of the phone away from you lowers beta, and should send the
  // instrument further up the sheet — hence the negation.
  tilt.x = clamp((e.gamma - baseline.gamma) / RANGE);
  tilt.y = clamp(-(e.beta - baseline.beta) / RANGE);
  tilt.active = true;

  // Publish the instrument's position here rather than from the render loop.
  // That loop pauses on a hidden tab and under reduced motion, and the margin's
  // coordinates must keep answering the handset regardless — the same reason
  // the margin derives scroll progress for itself.
  sheet.cx = (tilt.x + 1) / 2;
  sheet.cy = (1 - tilt.y) / 2;
}

/** Whether it is even worth offering. */
export function tiltAvailable() {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

/** iOS 13+ will only hand over orientation from inside a user gesture. */
export function needsPermission() {
  const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } })
    .DeviceOrientationEvent;
  return typeof D?.requestPermission === "function";
}

export async function enableTilt(): Promise<boolean> {
  if (!tiltAvailable()) return false;

  if (needsPermission()) {
    const D = window.DeviceOrientationEvent as unknown as {
      requestPermission: () => Promise<string>;
    };
    try {
      if ((await D.requestPermission()) !== "granted") return false;
    } catch {
      return false;
    }
  }

  if (!listening) {
    window.addEventListener("deviceorientation", onOrient);
    listening = true;
  }
  return true;
}

export function disableTilt() {
  if (listening) {
    window.removeEventListener("deviceorientation", onOrient);
    listening = false;
  }
  tilt.active = false;
  baseline = null;
}

/** Take the current attitude as level again. */
export function recentre() {
  baseline = null;
}
