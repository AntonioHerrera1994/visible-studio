import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { existsSync, readFileSync } from 'node:fs';
import {
  PROJECTS_API, EXCLUDE, EXCLUDE_BRANDS, FEATURED, USE_API_IMAGE_FALLBACK,
  slugify, tidy, niceTitle, domainOf, descriptionsEn,
} from './lib/projects.config';

const lang = z.enum(['es', 'en']);
const faq = z.array(z.object({ q: z.string(), a: z.string() })).default([]);

/**
 * Servicios: los 4 principales + las landings locales (Tijuana).
 * `slug` es la URL final dentro de /es/servicios/ o /en/services/.
 * `key` une la misma página en ambos idiomas (para hreflang y el selector de idioma).
 */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    lang,
    key: z.string(),
    slug: z.string(),
    kind: z.enum(['core', 'local']).default('core'),
    order: z.number().default(99),
    title: z.string(), // <title> SEO
    description: z.string(), // meta description
    h1: z.string(),
    problem: z.string(), // el problema del cliente, en sus palabras
    lede: z.string(),
    deliverables: z.array(z.string()).default([]),
    process: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    faqs: faq,
  }),
});

const industries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/industries' }),
  schema: z.object({
    lang,
    key: z.string(),
    slug: z.string(),
    order: z.number().default(99),
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    lede: z.string(),
    pains: z.array(z.string()).default([]),
    faqs: faq,
  }),
});


/**
 * Proyectos: se leen de la API de VikingDev al compilar.
 * Si la API no responde, se usa el respaldo local src/data/proyectos.json.
 */
type ApiProject = {
  id: string; image?: string; imageAlt?: string; category?: string; filterCategory?: string;
  title: string; desc?: string; url: string; stack?: string; brand?: string;
};

async function loadApiProjects(): Promise<{ items: ApiProject[]; source: string }> {
  try {
    const res = await fetch(PROJECTS_API, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.proyectos ?? data.projects ?? [];
    if (!items.length) throw new Error('vacía');
    return { items, source: 'api' };
  } catch {
    const items = JSON.parse(readFileSync(new URL('./data/proyectos.json', import.meta.url), 'utf8'));
    return { items, source: 'respaldo local' };
  }
}

const projects = defineCollection({
  loader: async () => {
    const { items, source } = await loadApiProjects();
    console.log(`[proyectos] ${items.length} proyectos desde ${source}`);
    const seen = new Set<string>();
    return items
      .filter((p) => p.title && p.url && !EXCLUDE.includes(p.title) && !EXCLUDE_BRANDS.includes((p.brand ?? '').toLowerCase()))
      .map((p) => {
        const title = niceTitle(p.title.trim());
        let slug = slugify(title);
        while (seen.has(slug)) slug += '-2';
        seen.add(slug);
        const shot = existsSync(`./public/proyectos/${slug}.webp`) ? `/proyectos/${slug}.webp` : undefined;
        const shotFull = existsSync(`./public/proyectos/${slug}-full.webp`) ? `/proyectos/${slug}-full.webp` : undefined;
        let fallbackImage: string | undefined;
        if (USE_API_IMAGE_FALLBACK && p.image) {
          fallbackImage = p.image.startsWith('http') ? p.image : `https://vikingdevtj.com${p.image}`;
        }
        const featuredIndex = FEATURED.indexOf(slug);
        return {
          id: slug,
          slug,
          title,
          url: p.url,
          domain: domainOf(p.url),
          industry: p.filterCategory || 'otro',
          desc: { es: tidy(p.desc ?? ''), en: descriptionsEn[slug] ?? tidy(p.desc ?? '') },
          stack: (p.stack ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          shot,
          shotFull,
          fallbackImage,
          featured: featuredIndex >= 0,
          order: featuredIndex >= 0 ? featuredIndex : 100 + items.indexOf(p),
        };
      });
  },
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    url: z.string(),
    domain: z.string(),
    industry: z.string(),
    desc: z.object({ es: z.string(), en: z.string() }),
    stack: z.array(z.string()),
    shot: z.string().optional(),
    shotFull: z.string().optional(),
    fallbackImage: z.string().optional(),
    featured: z.boolean(),
    order: z.number(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    lang,
    key: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    topic: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, industries, projects, blog };
