/**
 * Configuración del portafolio que viene de la API de VikingDev.
 */

/** API de proyectos. Se lee al compilar; si falla, se usa src/data/proyectos.json */
export const PROJECTS_API = 'https://vikingdevtj.com/api/proyectos.json';

/**
 * Proyectos que no se muestran (por título exacto).
 * Snitch Agency es el sitio de otra agencia: se oculta para no confundir en el portafolio de Visible.
 */
export const EXCLUDE = ['Snitch Agency'];

/** Marcas de la API que no se muestran: todos los proyectos de Snitch Agency se omiten. */
export const EXCLUDE_BRANDS = ['snitch'];

/** Destacados en el inicio y al principio del portafolio (por slug, en orden). */
export const FEATURED = ['altive-realty', 'favlash', 'aslo-auctions'];

/**
 * Orden de respaldo para la imagen de cada proyecto:
 *   1. Captura propia en /public/proyectos/<slug>.webp  (npm run capturas)
 *   2. Banner dinámico generado con los datos del proyecto
 *   3. Imagen del portafolio de VikingDev (solo si esto es true)
 */
export const USE_API_IMAGE_FALLBACK = false;

export const industries: Record<string, { es: string; en: string; hue: number }> = {
  salud: { es: 'Salud', en: 'Healthcare', hue: 340 },
  'bienes-raices': { es: 'Bienes raíces', en: 'Real estate', hue: 28 },
  industrial: { es: 'Industrial', en: 'Industrial', hue: 205 },
  transporte: { es: 'Transporte y logística', en: 'Transport & logistics', hue: 45 },
  tecnologia: { es: 'Tecnología', en: 'Technology', hue: 260 },
  restaurante: { es: 'Restaurantes', en: 'Restaurants', hue: 12 },
  belleza: { es: 'Belleza', en: 'Beauty', hue: 310 },
  educacion: { es: 'Educación', en: 'Education', hue: 160 },
  otro: { es: 'Otros', en: 'Other', hue: 140 },
};

/** Descripciones en inglés (la API solo trae español). Si falta una, se muestra la de la API. */
export const descriptionsEn: Record<string, string> = {
  'aslo-auctions': 'Online auction platform for industrial and tech assets.',
  'paqueteria-rojas': 'Website for Paquetería Rojas, a parcel shipping company.',
  'asm-360': 'Website for ASM 360.',
  'amigo-pro': 'Website and directory platform for service providers.',
  'zac-tech-semi': 'Professional website for an international semiconductor testing lab.',
  perezgrovas: 'Professional website for a customs brokerage.',
  'baja-somms': 'Premium site for a wine tasting club, built to promote exclusive events.',
  itest: 'Corporate website for a leader in stress and latch-up testing.',
  'prime-excess-management': 'Professional website that showcases Prime Excess Management’s services.',
  favlash: 'Lash studio website with online booking, a work gallery and a vibrant on-brand design.',
  'tech-meol-group': 'Corporate site for a technology and innovation company, with services and leadership team.',
  'gynehealth-aesthetic-medicine': 'Corporate website for a women’s health specialist.',
  'altive-realty': 'Professional website promoting full-service real estate.',
  'velora-cargo': 'B2B website for the freight and transport sector.',
  'global-recruiters': 'Bilingual executive recruiting platform with application forms and job listings.',
  'ixaya-residencial': 'Landing page for a residential development with an interactive gallery, map and lead form.',
  'gruas-cervantes': 'Tow service website with a direct WhatsApp call to action and live location.',
  clidpay: 'Website for a digital payments fintech, focused on trust.',
  'mudanzas-hermosillo': 'Corporate website for a moving and transport company.',
  'gyn-and-med': 'Corporate website for a medical practice.',
  'madeiras-collection': 'Online store highlighting design and interior products.',
  'holistic-cancer-coach': 'Professional website focused on oncology wellness and support.',
  'ricetta-restaurant': 'B2B website for restaurant consulting, openings and optimization.',
  'danya-argote': 'Website for therapy and emotional support services.',
  'baja-box': 'B2B website for a packaging company.',
  perioclinic: 'Medical website for a dental clinic, built to convey professionalism.',
  artivia: 'Professional website for a rehabilitation center.',
  rms: 'Corporate website for certification services.',
  'tj-plastic-surgery': 'Premium website for a plastic surgery clinic with an aesthetics-first design.',
  'la-chica-finanzas': 'Personal brand website for financial consulting and coaching.',
  amt: 'Corporate web platform for a medical manufacturer.',
  'radiologia-vascular-intervencionista': 'Website for interventional radiology and vascular procedures.',
  integra: 'Website presenting accounting, tax and financial advisory services for businesses.',
  'pp-solutions': 'Corporate site showcasing service catalogs, specialized maintenance and engineering projects.',
};

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Corrige detalles de redacción comunes de la API sin tocar la API. */
export function tidy(text: string) {
  return text
    .replace(/tecnolg[ií]a/gi, 'tecnología')
    .replace(/\ben linea\b/gi, 'en línea')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "GYNEHEALTH & AESTHETIC MEDICINE" → "Gynehealth & Aesthetic Medicine" */
export function niceTitle(title: string) {
  // Solo títulos largos en mayúsculas; siglas como ASM 360, RMS o AMT se respetan.
  if (title !== title.toUpperCase() || title.split(/\s+/).length < 3) return title;
  return title.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
