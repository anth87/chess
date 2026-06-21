#!/usr/bin/env node
/**
 * Generate favicon.svg and apple-touch-icon.png from the wN.png piece image.
 * Requires PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to be set (or defaults to system chromium).
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KNIGHT_PNG = path.join(ROOT, 'reference', 'pieces', 'wikipedia', 'wN.png');
const FAVICON_SVG = path.join(ROOT, 'favicon.svg');
const APPLE_TOUCH_ICON = path.join(ROOT, 'apple-touch-icon.png');

const BG = '#2d5a27';
const knightB64 = fs.readFileSync(KNIGHT_PNG).toString('base64');
const knightDataUrl = `data:image/png;base64,${knightB64}`;

function makeSvg(size, padding) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${BG}"/>
  <image href="${knightDataUrl}" x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
}

async function main() {
  // Write the SVG favicon (32×32 viewBox, scales to any size)
  const svgContent = makeSvg(32, 3);
  fs.writeFileSync(FAVICON_SVG, svgContent);
  console.log('Written:', FAVICON_SVG);

  // Render 180×180 PNG for apple-touch-icon via Playwright
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 180, height: 180 } });

  const html = `<!DOCTYPE html><html><head><style>
    * { margin: 0; padding: 0; }
    body { width: 180px; height: 180px; background: transparent; }
  </style></head><body>${makeSvg(180, 20)}</body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: APPLE_TOUCH_ICON, clip: { x: 0, y: 0, width: 180, height: 180 }, omitBackground: false });
  await browser.close();
  console.log('Written:', APPLE_TOUCH_ICON);
}

main().catch((err) => { console.error(err.message || err); process.exit(1); });
