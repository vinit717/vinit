import * as THREE from "three";

const W = 640;
const H = 370;

const BG = "#15120f";
const CHROME = "#221d18";
const WHITE = "#f6efe3";
const MUTED = "#8b8177";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fillRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

/**
 * The monitor shows this portfolio, rendered small — the site containing
 * itself. `caret` toggles the address-bar cursor so the screen isn't static.
 */
export function makeScreenTexture(hue: number, caret = true): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const brand = `hsl(${hue}, 68%, 55%)`;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // browser chrome
  ctx.fillStyle = CHROME;
  ctx.fillRect(0, 0, W, 40);
  ["#ec6a5e", "#f4bf4f", "#61c454"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(24 + i * 20, 20, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  fillRound(ctx, 100, 9, 250, 22, 11, "#2e2720");
  ctx.fillStyle = MUTED;
  ctx.font = "500 13px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillText("vinitkhandal.dev", 116, 25);
  if (caret) {
    ctx.fillStyle = brand;
    ctx.fillRect(238, 13, 2, 14);
  }

  // page content
  ctx.fillStyle = brand;
  ctx.font = "600 13px Inter, system-ui, sans-serif";
  ctx.fillText("PORTFOLIO", 44, 92);

  ctx.fillStyle = WHITE;
  ctx.font = "600 46px Georgia, 'Fraunces', serif";
  ctx.fillText("Vinit Khandal", 44, 148);

  ctx.fillStyle = MUTED;
  ctx.font = "400 16px Inter, system-ui, sans-serif";
  ctx.fillText("Software engineer — React, React Native,", 44, 184);
  ctx.fillText("and the backend underneath.", 44, 208);

  fillRound(ctx, 44, 236, 128, 38, 8, brand);
  ctx.fillStyle = "#1a1512";
  ctx.font = "600 14px Inter, system-ui, sans-serif";
  ctx.fillText("View work", 68, 260);

  fillRound(ctx, 186, 236, 116, 38, 8, "#2a231d");
  ctx.fillStyle = WHITE;
  ctx.fillText("Get in touch", 202, 260);

  // a small preview panel on the right, so the layout reads as a real page
  fillRound(ctx, 400, 76, 200, 200, 12, "#1e1915");
  fillRound(ctx, 418, 96, 92, 10, 5, brand);
  [0, 1, 2, 3].forEach((i) => {
    fillRound(ctx, 418, 122 + i * 24, i === 3 ? 96 : 164, 8, 4, "#3a322b");
  });
  fillRound(ctx, 418, 226, 164, 32, 8, "#2a231d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
