/**
 * Generates PWA icons from src/assets/chillipin.png.
 * Run: npm run gen:icons
 *
 * Outputs:
 *   public/icon-192.png         — 192×192, purpose: any
 *   public/icon-512.png         — 512×512, purpose: any
 *   public/icon-512-maskable.png — 512×512, purpose: maskable (design scaled to 80% safe zone)
 *   public/apple-touch-icon.png — 180×180, for iOS
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHILLI = path.join(__dirname, '../src/assets/chillipin.png');
const PUBLIC = path.join(__dirname, '../public');

const ORANGE = '#f47521';
const WHITE = '#ffffff';

async function genIcon(size, outputPath, scaleFactor = 1.0) {
  const designSize = Math.round(size * scaleFactor);
  const offset = Math.round((size - designSize) / 2);

  const cx = designSize / 2;
  const outerR = designSize * 0.492;
  const strokeW = designSize * 0.078;
  const innerR = outerR - strokeW;

  const chilliH = Math.round(innerR * 2 * 0.9);

  const svgFrame = Buffer.from(
    `<svg width="${designSize}" height="${designSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${designSize}" height="${designSize}" fill="${WHITE}"/>
      <circle cx="${cx}" cy="${cx}" r="${outerR - strokeW / 2}" fill="none" stroke="${ORANGE}" stroke-width="${strokeW}"/>
    </svg>`,
  );

  const chilliResized = await sharp(CHILLI)
    .resize({ height: chilliH, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const { width: cw, height: ch } = await sharp(chilliResized).metadata();

  const design = await sharp(svgFrame)
    .composite([
      {
        input: chilliResized,
        left: Math.round((designSize - cw) / 2),
        top: Math.round((designSize - ch) / 2),
      },
    ])
    .png()
    .toBuffer();

  if (scaleFactor < 1.0) {
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .composite([{ input: design, left: offset, top: offset }])
      .png()
      .toFile(outputPath);
  } else {
    await sharp(design).png().toFile(outputPath);
  }

  console.log(`✓ ${path.basename(outputPath)}`);
}

await genIcon(512, `${PUBLIC}/icon-512.png`);
await genIcon(192, `${PUBLIC}/icon-192.png`);
await genIcon(180, `${PUBLIC}/apple-touch-icon.png`);
await genIcon(512, `${PUBLIC}/icon-512-maskable.png`, 0.8);

console.log('Icons generated.');
