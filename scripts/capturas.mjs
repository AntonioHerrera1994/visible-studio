#!/usr/bin/env node
/**
 * Toma capturas de cada proyecto de la API de VikingDev para el portafolio.
 *
 * Uso (una sola vez, en tu Mac):
 *   npx playwright install chromium   ← solo la primera vez
 *   npm run capturas                  ← captura los que faltan
 *   npm run capturas -- --forzar      ← vuelve a capturar todos
 *   npm run capturas -- --solo=favlash,altive-realty
 *
 * Genera en /public/proyectos/:
 *   <slug>.webp       → pantalla principal (1280 px de ancho)
 *   <slug>-full.webp  → página larga, para que la tarjeta se recorra al pasar el cursor
 *
 * Mantén slugify() y niceTitle() iguales a los de src/lib/projects.config.ts
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'proyectos');
const CONFIG = await readFile(path.join(ROOT, 'src/lib/projects.config.ts'), 'utf8');
const API = process.env.PROJECTS_API ?? CONFIG.match(/PROJECTS_API = '([^']+)'/)?.[1];
const EXCLUDE = [...(CONFIG.match(/EXCLUDE = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);

const EXCLUDE_BRANDS = [...(CONFIG.match(/EXCLUDE_BRANDS = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);

const args = process.argv.slice(2);
const force = args.includes('--forzar');
const only = args.find((a) => a.startsWith('--solo='))?.split('=')[1]?.split(',');

const slugify = (t) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '').replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const niceTitle = (t) =>
  t !== t.toUpperCase() || t.split(/\s+/).length < 3 ? t : t.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
const exists = (f) => access(f).then(() => true, () => false);

async function loadProjects() {
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(res.status);
    console.log(`API: ${API}`);
    return await res.json();
  } catch {
    console.log('No se pudo leer la API, uso src/data/proyectos.json');
    return JSON.parse(await readFile(path.join(ROOT, 'src/data/proyectos.json'), 'utf8'));
  }
}

/** Cierra popups, banners de cookies y chats flotantes que tapan el sitio. */
async function cleanPage(page) {
  await page.keyboard.press('Escape').catch(() => {});
  const closers = [
    '[aria-label*="close" i]', '[aria-label*="cerrar" i]', '.popup-close', '.modal-close', '.close-button',
    'button:has-text("×")', 'button:has-text("Aceptar")', 'button:has-text("Accept")', 'button:has-text("Entendido")',
  ];
  for (const sel of closers) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) await el.click({ timeout: 1500 }).catch(() => {});
  }
  await page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      const big = r.width * r.height > vw * vh * 0.25;
      const isHeader = r.top <= 2 && r.height < 160 && r.width > vw * 0.8;
      // Quita overlays grandes y widgets flotantes (chat, WhatsApp), conserva el header.
      if ((big && !isHeader) || (r.width < 140 && r.height < 140 && r.bottom > vh - 200)) el.remove();
    }
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
  });
}

async function capture(browser, p) {
  const title = niceTitle(p.title.trim());
  const slug = slugify(title);
  const fileMain = path.join(OUT, `${slug}.webp`);
  const fileFull = path.join(OUT, `${slug}-full.webp`);
  if (only && !only.includes(slug)) return;
  if (!force && (await exists(fileMain)) && (await exists(fileFull))) {
    console.log(`  · ${slug} ya existe`);
    return;
  }
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'es-MX' });
  const page = await ctx.newPage();
  try {
    await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await cleanPage(page);

    // Pantalla principal
    const main = await page.screenshot({ type: 'png' });
    await sharp(main).resize({ width: 1280 }).webp({ quality: 80 }).toFile(fileMain);

    // Página larga: baja poco a poco para que carguen imágenes y animaciones
    await page.evaluate(async () => {
      for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += 600) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 250));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await cleanPage(page);
    const full = await page.screenshot({ type: 'png', fullPage: true });
    const img = sharp(full).resize({ width: 1280 });
    const meta = await img.toBuffer({ resolveWithObject: true });
    const height = Math.min(meta.info.height, 2700);
    await sharp(meta.data).extract({ left: 0, top: 0, width: 1280, height }).webp({ quality: 74 }).toFile(fileFull);
    console.log(`  ✓ ${slug}`);
  } catch (err) {
    console.log(`  ✗ ${slug}: ${err.message.split('\n')[0]} (se usará el banner dinámico)`);
  } finally {
    await ctx.close();
  }
}

await mkdir(OUT, { recursive: true });
const projects = (await loadProjects()).filter(
  (p) => p.title && p.url && !EXCLUDE.includes(p.title) && !EXCLUDE_BRANDS.includes((p.brand ?? '').toLowerCase()),
);
console.log(`${projects.length} proyectos. Capturando…`);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const queue = [...projects];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) await capture(browser, queue.shift());
  }),
);
await browser.close();
console.log('Listo. Vuelve a compilar (npm run build) para que el portafolio use las capturas nuevas.');
