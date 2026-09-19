/**
 * The territory the sheet is a window onto.
 *
 * The graticule used to be decoration — labels derived from the tick index, so
 * they read the same wherever you were. That is the one detail that gives a map
 * away as a picture of a map. Here the numbers are real: scrolling moves the
 * window south and east along the traverse (the same direction plate III cuts
 * its section), and every label, the cursor readout and the contour interval are
 * all derived from that one position.
 *
 * This module is also the single source of the values the shader is compiled
 * with, so a readout can never disagree with what is actually being drawn.
 */

/** North-west corner of the survey, at the top of the document. */
export const ORIGIN = { lat: 13.0208, lon: 77.5169 };

/** Ground covered between the top and the bottom of the whole document. */
export const TRAVERSE = { lat: 0.412, lon: 0.286 };

/**
 * Ground visible on one screen. Chosen so that the gap between labelled ticks
 * is exactly two minutes of arc — the graticule then reads 77°32′, 77°34′,
 * 77°36′ rather than 32′, 33′, 35′, which looks like a rounding fault even
 * though it isn't. The top edge has five major intervals across it and the side
 * four, hence the two different spans.
 */
const LABEL_STEP = 2 / 60; // two minutes, in degrees
export const VIEW = { lat: LABEL_STEP * 4, lon: LABEL_STEP * 5 };

/** Contour count at the top and bottom of the survey. The shader is built from
 *  these exact numbers, so the reported interval is the drawn interval. */
export const LINES_NEAR = 21;
export const LINES_FAR = 27;

/** Sheets are drawn at round intervals, never at 48 m. */
const INTERVALS = [50, 40, 25, 20, 10];

/** Contour interval in metres, from the same value the shader plots with. As
 *  the contour count rises down the survey the interval steps down the ladder,
 *  which is exactly how a real sheet behaves as its scale changes. */
export function contourInterval(scroll: number) {
  const lines = LINES_NEAR + (LINES_FAR - LINES_NEAR) * scroll;
  const raw = 1000 / lines;
  return INTERVALS.reduce((best, v) =>
    Math.abs(v - raw) < Math.abs(best - raw) ? v : best,
  );
}

/** North-west corner of the window currently on screen. */
export function windowAt(scroll: number) {
  return {
    lat: ORIGIN.lat - scroll * TRAVERSE.lat,
    lon: ORIGIN.lon + scroll * TRAVERSE.lon,
  };
}

/** Position under a point given as a fraction across and down the viewport. */
export function positionAt(scroll: number, fx: number, fy: number) {
  const w = windowAt(scroll);
  return { lat: w.lat - fy * VIEW.lat, lon: w.lon + fx * VIEW.lon };
}

function split(value: number) {
  const abs = Math.abs(value);
  let d = Math.floor(abs);
  let m = Math.floor((abs - d) * 60);
  let s = Math.round(((abs - d) * 60 - m) * 60);
  if (s === 60) { s = 0; m += 1; }        // carry, or you get 58′60″
  if (m === 60) { m = 0; d += 1; }
  return { d, m, s };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Full degrees-minutes-seconds, for the cursor readout. */
export function dms(value: number, axis: "N" | "E") {
  const { d, m, s } = split(value);
  return `${d}°${pad(m)}′${pad(s)}″${axis}`;
}

/** Degrees and minutes only — the graticule has no room for seconds. */
export function dm(value: number, axis: "N" | "E") {
  const { d, m } = split(value);
  return `${d}°${pad(m)}′${axis}`;
}

/**
 * Live state of the sheet, written by the renderer each frame and read by the
 * margin. Shared rather than recomputed so the instrumentation can never report
 * something different from what the ground is doing.
 */
export const sheet = {
  scroll: 0,
  /** smoothed scroll speed, 0..~1.4 */
  vel: 0,
  /** 1 when settled, 0 while moving — what detail is gated on */
  calm: 1,
  /** cursor as a fraction across and down the viewport */
  cx: 0.5,
  cy: 0.5,
};

/** How the ground is being plotted right now, in the surveyor's terms. */
export function plottingState(calm: number) {
  if (calm > 0.72) return "Full detail";
  if (calm > 0.22) return "Reducing";
  return "Generalised";
}
