/**
 * Generates minimal SVG-based app icons for the PWA manifest.
 * Run once: node scripts/generate-icons.mjs
 * Requires: npm install -D sharp  (only needed at build time)
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir  = join(__dirname, '..', 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

// SVG source — indigo gradient with a target emoji
const svgSrc = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#g)"/>
  <text x="50%" y="54%" font-size="${size * 0.52}" text-anchor="middle" dominant-baseline="middle" font-family="serif">🎯</text>
</svg>
`;

// Write SVG files (these work as icon fallbacks in some contexts)
writeFileSync(join(iconsDir, 'icon-192.svg'), svgSrc(192));
writeFileSync(join(iconsDir, 'icon-512.svg'), svgSrc(512));

// Try to use sharp if available, otherwise skip PNG generation
try {
  const sharp = (await import('sharp')).default;
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svgSrc(size)))
      .png()
      .toFile(join(iconsDir, `icon-${size}.png`));
    console.log(`✓ Generated icon-${size}.png`);
  }
} catch {
  console.warn('sharp not installed — writing SVG placeholder PNGs.');
  console.warn('Run: npm install -D sharp && node scripts/generate-icons.mjs');
  // Write a valid minimal 1×1 white PNG as a placeholder so the build doesn't fail
  // (real icons should be added before deploying)
  const MINIMAL_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  for (const size of [192, 512]) {
    writeFileSync(join(iconsDir, `icon-${size}.png`), MINIMAL_PNG);
    console.log(`  Wrote placeholder icon-${size}.png`);
  }
}
