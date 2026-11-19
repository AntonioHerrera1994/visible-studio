/**
 * Controlador de los ojos. Un solo loop para todos los pares [data-eyes] de la página.
 * Se re-escanea en cada navegación (View Transitions) con 'astro:page-load'.
 */

type Mood = 'idle' | 'excited' | 'reading' | 'surprised';

interface Iris {
  el: SVGGElement;
  cx: number;
  cy: number;
  x: number;
  y: number;
}
interface EyeSet {
  svg: SVGSVGElement;
  irises: Iris[];
  visible: boolean;
}

const MAX_X = 28; // desplazamiento máximo del iris (unidades del viewBox)
const MAX_Y = 26;

let sets: EyeSet[] = [];
let target = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
let override: { x: number; y: number } | null = null;
let mood: Mood = 'idle';
let lastMove = performance.now();
let wanderAt = 0;
let started = false;
let observer: IntersectionObserver | null = null;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function scan() {
  observer?.disconnect();
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = sets.find((set) => set.svg === e.target);
      if (s) s.visible = e.isIntersecting;
    }
  });
  sets = [...document.querySelectorAll<SVGSVGElement>('svg[data-eyes]')].map((svg) => {
    observer!.observe(svg);
    const irises = [...svg.querySelectorAll<SVGGElement>('[data-iris]')].map((el) => ({
      el,
      cx: Number(el.dataset.cx),
      cy: Number(el.dataset.cy),
      x: 0,
      y: 0,
    }));
    return { svg, irises, visible: true };
  });
  applyMood();
}

function setMood(next: Mood) {
  if (mood === next) return;
  mood = next;
  applyMood();
}

function applyMood() {
  for (const { svg } of sets) {
    svg.classList.toggle('is-excited', mood === 'excited');
    svg.classList.toggle('is-reading', mood === 'reading');
    svg.classList.toggle('is-surprised', mood === 'surprised');
  }
}

function centerOf(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Punto aproximado del cursor de texto dentro de un input/textarea. */
function caretPoint(field: HTMLInputElement | HTMLTextAreaElement) {
  const r = field.getBoundingClientRect();
  const fontSize = parseFloat(getComputedStyle(field).fontSize) || 16;
  const chars = (field.value || '').split('\n').pop()!.length;
  const x = Math.min(r.left + 16 + chars * fontSize * 0.52, r.right - 12);
  return { x, y: r.top + Math.min(r.height / 2, 28) };
}

function tick(now: number) {
  // Si nadie se mueve, los ojos curiosean por la pantalla.
  if (!override && !reduced() && now - lastMove > 4500 && now > wanderAt) {
    target = {
      x: window.innerWidth * (0.15 + Math.random() * 0.7),
      y: window.innerHeight * (0.1 + Math.random() * 0.8),
    };
    wanderAt = now + 1400 + Math.random() * 1800;
  }
  const goal = override ?? target;
  const ease = reduced() ? 1 : 0.14;

  for (const set of sets) {
    if (!set.visible) continue;
    const box = set.svg.getBoundingClientRect();
    if (!box.width) continue;
    const scale = box.width / 520; // ancho del viewBox
    for (const iris of set.irises) {
      const ex = box.left + iris.cx * scale;
      const ey = box.top + iris.cy * scale;
      const dx = goal.x - ex;
      const dy = goal.y - ey;
      const dist = Math.hypot(dx, dy) || 1;
      // Más lejos = más desplazamiento, con tope dentro del ojo.
      const reach = Math.min(1, dist / 320);
      const tx = (dx / dist) * MAX_X * reach;
      const ty = (dy / dist) * MAX_Y * reach;
      iris.x += (tx - iris.x) * ease;
      iris.y += (ty - iris.y) * ease;
      iris.el.setAttribute('transform', `translate(${iris.x.toFixed(2)} ${iris.y.toFixed(2)})`);
    }
  }
  requestAnimationFrame(tick);
}

function blinkLoop() {
  const wait = 2200 + Math.random() * 4200;
  window.setTimeout(() => {
    if (!reduced() && mood !== 'reading') {
      const double = Math.random() < 0.22;
      blink();
      if (double) window.setTimeout(blink, 260);
    }
    blinkLoop();
  }, wait);
}

function blink() {
  for (const { svg, visible } of sets) {
    if (!visible) continue;
    svg.classList.add('is-blinking');
    window.setTimeout(() => svg.classList.remove('is-blinking'), 130);
  }
}

function bindGlobalEvents() {
  window.addEventListener(
    'pointermove',
    (e) => {
      target = { x: e.clientX, y: e.clientY };
      lastMove = performance.now();
    },
    { passive: true },
  );

  // Elementos que llaman la atención: botones de llamada a la acción, casos, etc.
  document.addEventListener('pointerover', (e) => {
    const el = (e.target as Element).closest?.('[data-eyes-attract]');
    if (el && !override) {
      setMood('excited');
    }
  });
  document.addEventListener('pointerout', (e) => {
    const el = (e.target as Element).closest?.('[data-eyes-attract]');
    const to = (e.relatedTarget as Element | null)?.closest?.('[data-eyes-attract]');
    if (el && !to && mood === 'excited') setMood('idle');
  });

  // Teclado: si enfocas un botón importante, los ojos lo miran.
  document.addEventListener('focusin', (e) => {
    const el = e.target as HTMLElement;
    if (el.matches('input:not([type=checkbox]):not([type=radio]), textarea')) {
      override = caretPoint(el as HTMLInputElement);
      setMood('reading');
    } else if (el.closest('[data-eyes-attract]')) {
      override = centerOf(el);
      setMood('excited');
    }
  });
  document.addEventListener('focusout', () => {
    override = null;
    setMood('idle');
  });
  document.addEventListener('input', (e) => {
    const el = e.target as HTMLElement;
    if (el.matches('input, textarea')) override = caretPoint(el as HTMLInputElement);
  });

  // Un clic sorprende un instante.
  document.addEventListener('pointerdown', () => {
    if (mood !== 'idle' || reduced()) return;
    setMood('surprised');
    window.setTimeout(() => mood === 'surprised' && setMood('idle'), 260);
  });

  // En móvil no hay cursor: al hacer scroll los ojos siguen el contenido.
  window.addEventListener(
    'scroll',
    () => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        target = { x: window.innerWidth / 2, y: window.innerHeight * 0.85 };
        lastMove = performance.now();
      }
    },
    { passive: true },
  );
}

export function initEyes() {
  scan();
  if (started) return;
  started = true;
  bindGlobalEvents();
  blinkLoop();
  requestAnimationFrame(tick);
}

document.addEventListener('astro:page-load', initEyes);
