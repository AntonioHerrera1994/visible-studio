/**
 * Movimiento e interacción del sitio. Todo se re-inicializa en cada navegación.
 *
 *  [data-reveal]            entra al aparecer en pantalla (variantes: up por defecto, 'mask', 'scale')
 *  [data-stagger]           da a cada hijo con [data-reveal] un retraso escalonado
 *  [data-count]             anima los números del texto de 0 a su valor
 *  [data-magnetic]          el botón se acerca un poco al cursor
 *  [data-tilt]              la tarjeta se inclina en 3D siguiendo el cursor
 *  [data-preview-list]      muestra una tarjeta flotante que sigue al cursor (servicios)
 *  [data-slider]            carrusel con flechas y arrastre
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let io: IntersectionObserver | null = null;

function reveals() {
  io?.disconnect();
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    group.querySelectorAll<HTMLElement>(':scope > [data-reveal], :scope > * > [data-reveal]').forEach((el, i) => {
      el.style.setProperty('--i', String(i));
    });
  });
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in), [data-count]');
  if (reduced()) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  // Los títulos con máscara están recortados al 100% y el navegador los cuenta como invisibles,
  // así que para ellos observamos a su contenedor.
  const targets = new Map<Element, HTMLElement[]>();
  items.forEach((el) => {
    const watch = el.dataset.reveal === 'mask' ? el.parentElement ?? el : el;
    targets.set(watch, [...(targets.get(watch) ?? []), el]);
  });
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        for (const el of targets.get(e.target) ?? []) {
          el.classList.add('is-in');
          if (el.hasAttribute('data-count')) countUp(el);
        }
        io!.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  );
  targets.forEach((_, watch) => io!.observe(watch));
}

function countUp(el: HTMLElement) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const original = el.textContent ?? '';
  const nums = [...original.matchAll(/\d+/g)].map((m) => Number(m[0]));
  if (!nums.length) return;
  const start = performance.now();
  const dur = 1100;
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    let k = 0;
    el.textContent = original.replace(/\d+/g, () => String(Math.round(nums[k++] * eased)));
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = original;
  };
  requestAnimationFrame(step);
}

function magnetic() {
  if (!fine() || reduced()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    if (el.dataset.mag) return;
    el.dataset.mag = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('pointerleave', () => (el.style.translate = '0 0'));
  });
}

function tilt() {
  if (!fine() || reduced()) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    if (el.dataset.tiltReady) return;
    el.dataset.tiltReady = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(px * 9).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

function previewList() {
  document.querySelectorAll<HTMLElement>('[data-preview-list]').forEach((list) => {
    if (list.dataset.ready) return;
    list.dataset.ready = '1';
    const card = list.querySelector<HTMLElement>('[data-preview-card]');
    if (!card) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      card.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = requestAnimationFrame(loop);
    };
    list.querySelectorAll<HTMLElement>('[data-preview]').forEach((item) => {
      item.addEventListener('pointerenter', () => {
        if (!fine()) return;
        const tpl = item.querySelector('template');
        if (tpl) card.replaceChildren(tpl.content.cloneNode(true));
        card.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
    list.addEventListener('pointermove', (e) => {
      // La tarjeta flota en el espacio libre de la derecha y sigue al cursor en vertical,
      // con un ligero desplazamiento horizontal para que se sienta viva.
      const r = list.getBoundingClientRect();
      const w = card.offsetWidth || 260;
      x = r.width - w - 90 + ((e.clientX - r.left) / r.width) * 40;
      y = e.clientY - r.top - card.offsetHeight / 2;
    });
    list.addEventListener('pointerleave', () => {
      card.classList.remove('is-on');
      cancelAnimationFrame(raf);
      raf = 0;
    });
  });
}

function sliders() {
  document.querySelectorAll<HTMLElement>('[data-slider]').forEach((root) => {
    if (root.dataset.ready) return;
    root.dataset.ready = '1';
    const track = root.querySelector<HTMLElement>('[data-track]')!;
    const prev = root.querySelector<HTMLButtonElement>('[data-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-next]');
    const bar = root.querySelector<HTMLElement>('[data-progress]');
    const stepSize = () => (track.firstElementChild as HTMLElement)?.offsetWidth + 20 || track.clientWidth * 0.8;
    prev?.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 1;
      bar?.style.setProperty('--p', String(p));
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    };
    track.addEventListener('scroll', update, { passive: true });
    update();

    // Arrastrar con el mouse en escritorio
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
    });
    track.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
  });
}

function init() {
  reveals();
  magnetic();
  tilt();
  previewList();
  sliders();
}

document.addEventListener('astro:page-load', init);
