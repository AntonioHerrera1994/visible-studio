export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

/** Rutas por idioma. Las de servicios conservan los slugs del sitio actual. */
export const routes = {
  home: { es: '/es/', en: '/en/' },
  work: { es: '/es/trabajo/', en: '/en/work/' },
  services: { es: '/es/servicios/', en: '/en/services/' },
  industries: { es: '/es/industrias/', en: '/en/industries/' },
  about: { es: '/es/nosotros/', en: '/en/about/' },
  blog: { es: '/es/blog/', en: '/en/blog/' },
  contact: { es: '/es/contacto/', en: '/en/contact/' },
  audit: { es: '/es/diagnostico/', en: '/en/visibility-check/' },
  privacy: { es: '/es/aviso-privacidad/', en: '/en/privacy-policy/' },
} as const;
export type RouteKey = keyof typeof routes;

export const contact = {
  // TODO: reemplazar con los datos reales de Visible Studio.
  email: 'hola@wearevisiblestudio.com',
  phone: '+52 664 000 0000',
  whatsapp: '526640000000',
  city: 'Tijuana, Baja California, México',
  social: {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    tiktok: 'https://www.tiktok.com/',
    behance: 'https://www.behance.net/',
    dribbble: 'https://dribbble.com/',
  },
};

export const ui = {
  es: {
    'nav.work': 'Trabajo',
    'nav.services': 'Servicios',
    'nav.industries': 'Industrias',
    'nav.about': 'Nosotros',
    'nav.blog': 'Blog',
    'nav.cta': 'Agenda tu diagnóstico',
    'nav.menu': 'Menú',
    'nav.close': 'Cerrar',
    'skip': 'Saltar al contenido',
    'whatsapp': 'Escríbenos por WhatsApp',
    'footer.tagline': 'Estudio creativo de diseño y marketing digital en Tijuana. Trabajamos con negocios de México y Estados Unidos.',
    'footer.contact': 'Contacto',
    'footer.explore': 'Explora',
    'footer.follow': 'Síguenos',
    'footer.legal': 'Aviso de privacidad',
    'example': 'Contenido de ejemplo',
    'faq.title': 'Preguntas frecuentes',
    'readCase': 'Ver el caso',
    'seeService': 'Ver servicio',
  },
  en: {
    'nav.work': 'Work',
    'nav.services': 'Services',
    'nav.industries': 'Industries',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.cta': 'Book your free check',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'skip': 'Skip to content',
    'whatsapp': 'Message us on WhatsApp',
    'footer.tagline': 'Creative design and digital marketing studio in Tijuana. We work with businesses in Mexico and the United States.',
    'footer.contact': 'Contact',
    'footer.explore': 'Explore',
    'footer.follow': 'Follow us',
    'footer.legal': 'Privacy policy',
    'example': 'Placeholder content',
    'faq.title': 'Frequently asked questions',
    'readCase': 'Read the case',
    'seeService': 'See service',
  },
} as const;

export function t(lang: Lang, key: keyof (typeof ui)['es']) {
  return ui[lang][key] ?? ui[defaultLang][key];
}

export function route(lang: Lang, key: RouteKey) {
  return routes[key][lang];
}
