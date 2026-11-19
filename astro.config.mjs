// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wearevisiblestudio.com',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      // Las URLs actuales ya usan /es/ y /en/: se conservan igual para no perder SEO.
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  prefetch: {
    // Navegación casi instantánea: precarga los enlaces cuando entran en pantalla.
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  redirects: {
    // Redirecciones 301 de URLs viejas que cambian de ruta en el rediseño.
    // El blog está apagado (BLOG_ENABLED en src/i18n/ui.ts): las URLs viejas van al inicio.
    // Cuando lo enciendan, cambien el destino a '/es/blog/' y '/en/blog/'.
    '/es/blogs/': '/es/',
    '/en/blogs/': '/en/',
  },
  integrations: [
    sitemap({
      // Mientras el blog esté apagado, no aparece en el sitemap.
      filter: (page) => !/\/(blog|blogs)\//.test(page),
      i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } },
    }),
  ],
});
