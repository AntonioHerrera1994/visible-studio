/**
 * Contenido del mapa por país (México, EE. UU., Canadá) para cada servicio e industria,
 * y los "Datos que importan" de cada industria. Cada dato lleva su fuente.
 */
import type { CountryCode } from '../lib/map';
import type { Lang } from '../i18n/ui';

export interface Stat { value: string; label: string; source: string; url: string }
export interface RegionCopy { title: string; points: string[]; stat?: Stat }
export type RegionSet = Record<CountryCode, Record<Lang, RegionCopy>>;

export const countryNames: Record<CountryCode, Record<Lang, string>> = {
  mx: { es: 'México', en: 'Mexico' },
  us: { es: 'Estados Unidos', en: 'United States' },
  ca: { es: 'Canadá', en: 'Canada' },
};

// ---------- Fuentes ----------
const SRC = {
  pbb: {
    es: 'Patients Beyond Borders, vía The National (2023)',
    en: 'Patients Beyond Borders, via The National (2023)',
    url: 'https://thenationalnews.com/world/the-americas/2023/06/28/why-do-millions-of-americans-go-to-mexico-for-health-care',
  },
  fraserWait: {
    es: 'Fraser Institute, Waiting Your Turn 2025',
    en: 'Fraser Institute, Waiting Your Turn 2025',
    url: 'https://www.fraserinstitute.org/STUDIES/WAITING-YOUR-TURN-WAIT-TIMES-FOR-HEALTH-CARE-IN-CANADA-2025',
  },
  fraserAbroad: {
    es: 'Fraser Institute, vía The Hub (2026)',
    en: 'Fraser Institute, via The Hub (2026)',
    url: 'https://thehub.ca/2026/01/21/over-105000-patients-left-canada-for-health-care-treatments-in-other-countries-in-',
  },
  statcan: {
    es: 'Statistics Canada, Tourism activity 2025',
    en: 'Statistics Canada, Tourism activity 2025',
    url: 'https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2026029-eng.htm',
  },
  bts: {
    es: 'U.S. Bureau of Transportation Statistics (2025)',
    en: 'U.S. Bureau of Transportation Statistics (2025)',
    url: 'https://www.bts.gov/newsroom/border-crossing-data-annual-release-2025',
  },
  costa: {
    es: 'Mexico Daily Post (2025)',
    en: 'Mexico Daily Post (2025)',
    url: 'https://mexicodailypost.news/2025/02/18/mexican-american-community-transforms-the-real-estate-market-in-baja-california',
  },
  zona: {
    es: 'Constitución Mexicana, art. 27, vía Global Property Guide',
    en: 'Mexican Constitution, art. 27, via Global Property Guide',
    url: 'https://www.globalpropertyguide.com/north-america/mexico/buying-guide',
  },
  sdTourism: {
    es: 'San Diego Tourism Authority',
    en: 'San Diego Tourism Authority',
    url: 'https://www.sandiego.org/article/san-diegos-cross-border-spirit',
  },
};
const src = (k: keyof typeof SRC, lang: Lang) => ({ source: SRC[k][lang], url: SRC[k].url });

// Datos reutilizables
const stat = {
  usMedical: (l: Lang): Stat => ({
    value: l === 'es' ? '~1 millón' : '~1 million',
    label: l === 'es'
      ? 'de estadounidenses viajan a México cada año por atención médica y dental, con ahorros de 40% a 65%.'
      : 'Americans travel to Mexico every year for medical and dental care, saving 40% to 65%.',
    ...src('pbb', l),
  }),
  caWait: (l: Lang): Stat => ({
    value: l === 'es' ? '28.6 semanas' : '28.6 weeks',
    label: l === 'es'
      ? 'es la espera mediana en Canadá entre la referencia del médico general y el tratamiento (2025).'
      : 'is the median wait in Canada from a GP referral to treatment (2025).',
    ...src('fraserWait', l),
  }),
  caAbroad: (l: Lang): Stat => ({
    value: '105,529',
    label: l === 'es'
      ? 'pacientes canadienses salieron de su país para atenderse en 2025, 66% más que hace una década.'
      : 'Canadian patients went abroad for care in 2025, 66% more than a decade earlier.',
    ...src('fraserAbroad', l),
  }),
  caVisits: (l: Lang): Stat => ({
    value: l === 'es' ? '2.66 millones' : '2.66 million',
    label: l === 'es'
      ? 'de visitas de canadienses a México en 2025: su destino número uno fuera de Estados Unidos.'
      : 'Canadian visits to Mexico in 2025: their top destination outside the United States.',
    ...src('statcan', l),
  }),
  sanYsidro: (l: Lang): Stat => ({
    value: l === 'es' ? '15.3 millones' : '15.3 million',
    label: l === 'es'
      ? 'de cruces en auto particular por San Ysidro en 2025: el 20% de todos los que entran desde México.'
      : 'personal-vehicle crossings through San Ysidro in 2025: 20% of all entries from Mexico.',
    ...src('bts', l),
  }),
  costa: (l: Lang): Stat => ({
    value: '75%',
    label: l === 'es'
      ? 'de los propietarios en la zona costa de Tijuana a Ensenada son estadounidenses o mexicoamericanos, según el sector inmobiliario local.'
      : 'of owners along the Tijuana–Ensenada coast are American or Mexican-American, according to local real estate experts.',
    ...src('costa', l),
  }),
  zona: (l: Lang): Stat => ({
    value: '50 / 100 km',
    label: l === 'es'
      ? 'de la costa o la frontera: dentro de esa zona, un extranjero compra mediante fideicomiso bancario.'
      : 'from the coast or border: inside that zone, foreigners buy through a bank trust (fideicomiso).',
    ...src('zona', l),
  }),
};

// ---------- Servicios ----------
export const serviceRegions: Record<string, RegionSet> = {
  branding: {
    mx: {
      es: { title: 'Una marca que destaque en tu ciudad', points: ['Identidad pensada para tu mercado y tu competencia directa', 'Piezas listas para tu local, redes y Google', 'Un tono en español que conecta con tus clientes'] },
      en: { title: 'A brand that stands out in your city', points: ['Identity built for your market and direct competitors', 'Assets ready for your storefront, social media and Google', 'A Spanish voice that connects with your customers'] },
    },
    us: {
      es: { title: 'Una marca que se entienda en inglés', points: ['Nombre, tono y mensajes revisados para el público estadounidense', 'Identidad bilingüe que no pierde fuerza al traducirse', 'Confianza para clientes que cruzan la frontera por ti'] },
      en: { title: 'A brand that works in English', points: ['Name, tone and messaging checked for US audiences', 'A bilingual identity that keeps its punch in translation', 'Trust for customers who cross the border for you'] },
    },
    ca: {
      es: { title: 'Lista para el visitante canadiense', points: ['Mensajes en inglés, y en francés si tu mercado es Quebec', 'Certificaciones, reseñas y garantías a la vista', 'Identidad que luce en campañas de temporada de invierno'] },
      en: { title: 'Ready for Canadian visitors', points: ['Messaging in English, plus French if you target Quebec', 'Certifications, reviews and guarantees up front', 'An identity that shines in winter-season campaigns'] },
    },
  },
  web: {
    mx: {
      es: { title: 'Un sitio rápido para el celular', points: ['Hecho para conexiones móviles y pagos en pesos', 'WhatsApp a un toque desde cualquier página', 'SEO local desde la estructura del sitio'] },
      en: { title: 'A fast site for phones', points: ['Built for mobile connections and peso payments', 'WhatsApp one tap away from every page', 'Local SEO baked into the site structure'] },
    },
    us: {
      es: { title: 'Un sitio bilingüe con precios claros', points: ['Versión en inglés completa, no traducción automática', 'Precios en dólares y cómo llegar desde la frontera', 'Formularios que llegan a tu CRM al instante'] },
      en: { title: 'A bilingual site with clear prices', points: ['A full English version, not machine translation', 'Prices in dollars and directions from the border', 'Forms that reach your CRM instantly'] },
    },
    ca: {
      es: { title: 'Confianza antes del viaje', points: ['Información de traslado, estancia y seguimiento', 'Testimonios y certificaciones visibles', 'Horarios de contacto pensados para Canadá'] },
      en: { title: 'Trust before the trip', points: ['Travel, stay and follow-up information', 'Visible testimonials and certifications', 'Contact hours that work for Canada'] },
    },
  },
  seo: {
    mx: {
      es: { title: 'Aparece cuando te buscan cerca', points: ['Ficha de Google completa y activa', 'Páginas por colonia y ciudad', 'Reseñas que suben tu posición en Maps'] },
      en: { title: 'Show up when people search nearby', points: ['A complete, active Google Business Profile', 'Pages by neighborhood and city', 'Reviews that lift your Maps ranking'] },
    },
    us: {
      es: { title: 'Que te encuentren desde EE. UU.', points: ['Palabras clave en inglés con intención de compra', 'Contenido que resuelve las dudas de quien cruza', 'Visibilidad en ChatGPT y otras IA en inglés'] },
      en: { title: 'Get found from the US', points: ['English keywords with buying intent', 'Content that answers cross-border questions', 'Visibility in ChatGPT and other AI tools in English'] },
    },
    ca: {
      es: { title: 'Que te encuentren desde Canadá', points: ['Búsquedas en inglés y francés desde Canadá', 'Contenido para quien planea su viaje con semanas de anticipación', 'Menciones en sitios que leen los canadienses'] },
      en: { title: 'Get found from Canada', points: ['English and French searches from Canada', 'Content for people planning weeks ahead', 'Mentions on sites Canadians read'] },
    },
  },
  marketing: {
    mx: {
      es: { title: 'Anuncios que llenan tu agenda', points: ['Campañas por ciudad y radio de distancia', 'Mensajes a WhatsApp en lugar de formularios largos', 'Presupuesto en pesos optimizado cada semana'] },
      en: { title: 'Ads that fill your calendar', points: ['Campaigns by city and distance radius', 'WhatsApp messages instead of long forms', 'Peso budgets optimized weekly'] },
    },
    us: {
      es: { title: 'Campañas en el sur de California y más allá', points: ['Segmentación en San Diego, Los Ángeles y Arizona', 'Anuncios en inglés con ofertas claras en dólares', 'Seguimiento de cada llamada y cita'] },
      en: { title: 'Campaigns in Southern California and beyond', points: ['Targeting in San Diego, Los Angeles and Arizona', 'English ads with clear dollar offers', 'Every call and appointment tracked'] },
    },
    ca: {
      es: { title: 'Campañas para la temporada canadiense', points: ['Anuncios activos en invierno, cuando más viajan', 'Segmentación en Vancouver, Calgary y Toronto', 'Remarketing para quien planea con tiempo'] },
      en: { title: 'Campaigns for the Canadian season', points: ['Ads running in winter, when they travel most', 'Targeting in Vancouver, Calgary and Toronto', 'Remarketing for people who plan ahead'] },
    },
  },
};

// ---------- Industrias ----------
export const industryRegions: Record<string, RegionSet> = {
  salud: {
    mx: {
      es: { title: 'Pacientes locales que te encuentran', points: ['Ficha de Google Maps con horarios, fotos y reseñas', 'Agenda por WhatsApp con respuesta inmediata', 'Contenido médico claro que genera confianza'] },
      en: { title: 'Local patients who find you', points: ['A Google Maps profile with hours, photos and reviews', 'WhatsApp booking with instant replies', 'Clear medical content that builds trust'] },
    },
    us: {
      es: { title: 'Turismo médico desde Estados Unidos', points: ['Sitio en inglés con precios en dólares y paquetes', 'Guía para cruzar la frontera y llegar a tu clínica', 'Anuncios en San Diego, Los Ángeles y Arizona'], stat: stat.usMedical('es') },
      en: { title: 'Medical tourism from the United States', points: ['An English site with dollar prices and packages', 'A guide to crossing the border and reaching your clinic', 'Ads in San Diego, Los Angeles and Arizona'], stat: stat.usMedical('en') },
    },
    ca: {
      es: { title: 'Canadienses que no quieren esperar', points: ['Mensajes que comparan tiempos de espera', 'Plan de viaje: traslado, recuperación y seguimiento', 'Testimonios de pacientes canadienses'], stat: stat.caWait('es') },
      en: { title: 'Canadians who don’t want to wait', points: ['Messaging that compares wait times', 'A trip plan: transfer, recovery and follow-up', 'Testimonials from Canadian patients'], stat: stat.caWait('en') },
    },
  },
  inmobiliario: {
    mx: {
      es: { title: 'Compradores nacionales', points: ['Fichas con precio, crédito y ubicación', 'Campañas por perfil: primera vivienda o inversión', 'Seguimiento automático de cada prospecto'] },
      en: { title: 'Mexican buyers', points: ['Listings with price, financing and location', 'Campaigns by profile: first home or investment', 'Automatic follow-up for every lead'] },
    },
    us: {
      es: { title: 'Compradores de California', points: ['Sitio en inglés con precios en dólares', 'El fideicomiso explicado en palabras simples', 'Tours virtuales para comprar a distancia'], stat: stat.costa('es') },
      en: { title: 'California buyers', points: ['An English site with dollar prices', 'The bank trust (fideicomiso) explained simply', 'Virtual tours for buying remotely'], stat: stat.costa('en') },
    },
    ca: {
      es: { title: 'Inversionistas canadienses', points: ['Contenido para segunda casa y retiro', 'Comparativos de costo de vida frente a Canadá', 'Campañas en la temporada de invierno'], stat: stat.caVisits('es') },
      en: { title: 'Canadian investors', points: ['Content for second homes and retirement', 'Cost-of-living comparisons with Canada', 'Campaigns during the winter season'], stat: stat.caVisits('en') },
    },
  },
  restaurantes: {
    mx: {
      es: { title: 'Comensales de tu ciudad', points: ['Ficha de Google con menú, fotos y horario al día', 'Respuestas a cada reseña', 'Promociones por día para llenar entre semana'] },
      en: { title: 'Diners in your city', points: ['A Google profile with an up-to-date menu, photos and hours', 'A reply to every review', 'Daily offers to fill weekday tables'] },
    },
    us: {
      es: { title: 'Visitantes desde San Diego', points: ['Menú y reservas en inglés', 'Presencia en guías y recorridos gastronómicos', 'Anuncios de fin de semana en el sur de California'], stat: stat.sanYsidro('es') },
      en: { title: 'Visitors from San Diego', points: ['Menu and reservations in English', 'A presence in food guides and tours', 'Weekend ads in Southern California'], stat: stat.sanYsidro('en') },
    },
    ca: {
      es: { title: 'Turistas canadienses', points: ['Perfiles en inglés en Google y apps de reseñas', 'Contenido para quien visita Baja en invierno', 'Paquetes con vinos del Valle de Guadalupe'], stat: stat.caVisits('es') },
      en: { title: 'Canadian tourists', points: ['English profiles on Google and review apps', 'Content for winter visitors to Baja', 'Pairings with Valle de Guadalupe wines'], stat: stat.caVisits('en') },
    },
  },
};

// ---------- Datos que importan (página de cada industria) ----------
export const industryFacts: Record<string, Record<Lang, Stat[]>> = {
  salud: {
    es: [stat.usMedical('es'), stat.caWait('es'), stat.caAbroad('es'), stat.sanYsidro('es')],
    en: [stat.usMedical('en'), stat.caWait('en'), stat.caAbroad('en'), stat.sanYsidro('en')],
  },
  inmobiliario: {
    es: [stat.zona('es'), stat.costa('es'), stat.caVisits('es')],
    en: [stat.zona('en'), stat.costa('en'), stat.caVisits('en')],
  },
  restaurantes: {
    es: [
      stat.sanYsidro('es'),
      { value: 'Baja Med', label: 'nació en Tijuana y hoy define la cocina "Cali-Baja" que buscan los visitantes de San Diego.', ...src('sdTourism', 'es') },
      stat.caVisits('es'),
    ],
    en: [
      stat.sanYsidro('en'),
      { value: 'Baja Med', label: 'was born in Tijuana and now defines the "Cali-Baja" cuisine San Diego visitors look for.', ...src('sdTourism', 'en') },
      stat.caVisits('en'),
    ],
  },
};

/** Qué servicios recomendamos para cada industria (por key de servicio). */
export const industryServices: Record<string, string[]> = {
  salud: ['web', 'seo', 'marketing'],
  inmobiliario: ['web', 'marketing', 'branding'],
  restaurantes: ['branding', 'seo', 'marketing'],
};
