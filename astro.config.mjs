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
    // Agrega aquí las del blog cuando decidan qué artículos se quedan.
    '/es/blogs/': '/es/blog/',
    '/en/blogs/': '/en/blog/',
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } },
    }),
  ],
});
