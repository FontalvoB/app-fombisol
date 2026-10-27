/**
 * Genera los iconos PWA de PeopleNet a partir de la marca oficial
 * (src/redesign/assets/peoplenet-mark.svg) sobre el gradiente navy del
 * splash (#1668d8 → #0b3e8f, ver src/redesign/startup.css).
 *
 * Salidas en public/icons/:
 *   - pwa-192.png / pwa-512.png           (purpose any)
 *   - pwa-maskable-192.png / -512.png     (purpose maskable, zona segura)
 *   - apple-touch-icon.png                (180×180, iOS standalone)
 *
 * Uso: node scripts/generate-pwa-icons.mjs  (desde la raíz del repo)
 */

import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const markPath = path.join(repoRoot, "src", "redesign", "assets", "peoplenet-mark.svg");
const outDir = path.join(repoRoot, "public", "icons");
mkdirSync(outDir, { recursive: true });

/** Contenido interno del SVG de marca (defs + paths, sin el tag <svg>). */
const markInner = readFileSync(markPath, "utf8")
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");

/** viewBox de la marca: 128×139 (más alta que ancha). */
const MARK_W = 128;
const MARK_H = 139;

/**
 * Composita el icono: fondo gradiente + marca centrada al `ratio` del alto.
 * Maskable usa ratio menor: el launcher Android recorta un círculo y la
 * zona segura exige la marca dentro del 80 % central.
 */
function iconSvg(size, ratio) {
  const scale = (size * ratio) / MARK_H;
  const tx = (size - MARK_W * scale) / 2;
  const ty = (size - MARK_H * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="pwa-bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#1668d8"/>
      <stop offset="1" stop-color="#0b3e8f"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#pwa-bg)"/>
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})">
${markInner}
  </g>
</svg>`;
}

const targets = [
  { file: "pwa-192.png", size: 192, ratio: 0.62 },
  { file: "pwa-512.png", size: 512, ratio: 0.62 },
  { file: "pwa-maskable-192.png", size: 192, ratio: 0.58 },
  { file: "pwa-maskable-512.png", size: 512, ratio: 0.58 },
  { file: "apple-touch-icon.png", size: 180, ratio: 0.62 },
];

for (const { file, size, ratio } of targets) {
  const out = path.join(outDir, file);
  await sharp(Buffer.from(iconSvg(size, ratio))).png().toFile(out);
  console.log(`✓ ${file} (${size}×${size})`);
}

console.log("Iconos PWA generados en public/icons/");
