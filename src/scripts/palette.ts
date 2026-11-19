/**
 * Cambio de paleta con transición circular que nace desde el botón que se tocó.
 * La paleta elegida se guarda en localStorage y se aplica antes de pintar (ver Base.astro).
 */
import { palettes, defaultPalette, type PaletteId } from '../i18n/palettes';

const KEY = 'vs-palette';

export function currentPalette(): PaletteId {
  try {
    const saved = localStorage.getItem(KEY) as PaletteId | null;
    if (saved && palettes.some((p) => p.id === saved)) return saved;
  } catch {}
  return defaultPalette;
}

function apply(id: PaletteId) {
  document.documentElement.dataset.palette = id;
  const theme = palettes.find((p) => p.id === id)?.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme ?? '#000');
  document.querySelectorAll<HTMLElement>('[data-palette-option]').forEach((btn) => {
    btn.setAttribute('aria-checked', String(btn.dataset.paletteOption === id));
  });
}

function choose(id: PaletteId, origin: { x: number; y: number }) {
  if (id === document.documentElement.dataset.palette) return;
  try { localStorage.setItem(KEY, id); } catch {}

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // @ts-ignore: startViewTransition existe en navegadores modernos
  if (!document.startViewTransition || reduced) {
    apply(id);
    return;
  }
  const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
  document.documentElement.classList.add('palette-switching');
  // @ts-ignore
  const vt = document.startViewTransition(() => apply(id));
  vt.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
  vt.finished.finally(() => document.documentElement.classList.remove('palette-switching'));
}

function init() {
  apply(currentPalette());
}

document.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLElement>('[data-palette-option]');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  choose(btn.dataset.paletteOption as PaletteId, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
});

document.addEventListener('astro:page-load', init);
// Al navegar, el nuevo documento llega sin el atributo: lo reponemos antes de pintar.
document.addEventListener('astro:after-swap', () => {
  document.documentElement.dataset.palette = currentPalette();
  document.documentElement.classList.add('js');
});
