// Genera los íconos PNG de la app a partir del logo (requiere Chromium de Playwright).
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mark = (pad) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#2848c9"/>
  <g transform="translate(${pad} ${pad}) scale(${(512 - pad * 2) / 512})">
    <path d="M112 176V112h64M336 112h64v64M400 336v64h-64M176 400h-64v-64" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M168 312c40-96 136-112 176-48" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="34" stroke-linecap="round"/>
    <circle cx="344" cy="264" r="40" fill="#fff"/>
  </g>
</svg>`;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, size, pad, radius] of [
  ['icon-512.png', 512, 0, 96],
  ['icon-192.png', 192, 0, 36],
  ['icon-maskable-512.png', 512, 64, 0],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;border-radius:${radius}px;overflow:hidden">${mark(pad).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</div></body></html>`,
  );
  await page.screenshot({ path: path.join(root, 'public/icons', file), omitBackground: true });
  console.log('ok', file);
}
await browser.close();
