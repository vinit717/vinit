/* Kept free of three.js imports so the stage can read captions without
   pulling the whole renderer into the main bundle. */

export type Spot =
  | "screen"
  | "keyboard"
  | "phone"
  | "mug"
  | "plant"
  | "lamp"
  | "books"
  | null;

/** Each prop says something true about how he works — the reveal is the point. */
export const SPOT_CAPTIONS: Record<Exclude<Spot, null>, string> = {
  screen: "React, mostly. This site included.",
  keyboard: "Where the actual work happens.",
  phone: "React Native — same logic, native feel.",
  mug: "Fuel. Refilled more often than admitted.",
  plant: "Still alive. Genuinely a win.",
  lamp: "Flip the site to dark — it comes on.",
  books: "Backend, enough to ship it myself.",
};
