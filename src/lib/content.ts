import { getCollection, type CollectionKey } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { routes, type RouteKey } from '../i18n/ui';

/** Busca la misma entrada en el otro idioma (por `key`) para hreflang y el selector de idioma. */
export async function alternatesFor(
  collection: CollectionKey,
  key: string,
  base: RouteKey,
): Promise<Record<Lang, string>> {
  const all = (await getCollection(collection)) as { data: { key: string; lang: Lang; slug: string } }[];
  const out = { es: routes[base].es, en: routes[base].en } as Record<Lang, string>;
  for (const e of all) {
    if (e.data.key === key) out[e.data.lang] = `${routes[base][e.data.lang]}${e.data.slug}/`;
  }
  return out;
}

export function pathsFor<T extends { data: { lang: Lang; slug: string } }>(entries: T[], lang: Lang) {
  return entries.filter((e) => e.data.lang === lang).map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }));
}
