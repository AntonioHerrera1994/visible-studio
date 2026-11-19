/**
 * Genera el mapa de Norteamérica (México, EE. UU. y Canadá) como trazos SVG al compilar.
 * Datos: Natural Earth vía world-atlas (escala 1:110m). No se envía ninguna librería al navegador.
 */
import { feature } from 'topojson-client';
import { geoConicConformal, geoPath } from 'd3-geo';
import world from 'world-atlas/countries-110m.json';

export type CountryCode = 'mx' | 'us' | 'ca';

export const W = 1000;
export const H = 760;

const IDS: Record<string, CountryCode> = { '484': 'mx', '840': 'us', '124': 'ca' };
// Vecinos que se dibujan en gris solo para dar contexto
const CONTEXT = ['304', '320', '084', '192', '340', '222', '558', '188', '591', '044', '332', '214', '388'];

export const TIJUANA: [number, number] = [-117.04, 32.53];

export const cities: Record<CountryCode, { name: string; at: [number, number] }[]> = {
  mx: [
    { name: 'Ciudad de México', at: [-99.13, 19.43] },
    { name: 'Guadalajara', at: [-103.35, 20.67] },
    { name: 'Monterrey', at: [-100.31, 25.69] },
  ],
  us: [
    { name: 'San Diego', at: [-117.16, 32.72] },
    { name: 'Los Ángeles', at: [-118.24, 34.05] },
    { name: 'Phoenix', at: [-112.07, 33.45] },
  ],
  ca: [
    { name: 'Vancouver', at: [-123.12, 49.28] },
    { name: 'Calgary', at: [-114.07, 51.05] },
    { name: 'Toronto', at: [-79.38, 43.65] },
  ],
};

type Geo = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

/** Quita Hawái y el extremo occidental de las Aleutianas para encuadrar mejor el mapa. */
function trim(f: Geo): Geo {
  if (f.geometry.type !== 'MultiPolygon') return f;
  const coordinates = f.geometry.coordinates.filter((poly) => {
    const [lon, lat] = poly[0][0];
    if (lat < 25 && lon < -150) return false; // Hawái
    if (lon > 170 || lon < -170) return false; // Aleutianas lejanas
    return true;
  });
  return { ...f, geometry: { ...f.geometry, coordinates } };
}

let cache: ReturnType<typeof build> | null = null;

function build() {
  const all = (feature(world as any, (world as any).objects.countries) as any).features as (Geo & { id: string })[];
  const main = all.filter((f) => IDS[f.id]).map((f) => ({ ...trim(f), id: f.id }));
  const context = all.filter((f) => CONTEXT.includes(f.id)).map(trim);

  const projection = geoConicConformal()
    .rotate([100, 0])
    .parallels([25, 60])
    .fitExtent([[24, 24], [W - 24, H - 24]], { type: 'FeatureCollection', features: main } as any);
  const path = geoPath(projection);
  const pt = (lonlat: [number, number]) => projection(lonlat) as [number, number];

  const countries = main.map((f) => {
    const code = IDS[f.id];
    // Para el zoom de EE. UU. se encuadran solo los 48 estados contiguos (sin Alaska).
    let framed: Geo = f;
    if (code === 'us' && f.geometry.type === 'MultiPolygon') {
      framed = { ...f, geometry: { ...f.geometry, coordinates: f.geometry.coordinates.filter((poly) => poly[0][0][0] > -130) } };
    }
    const [[x0, y0], [x1, y1]] = path.bounds(framed as any);
    // Zoom: cuánto acercar y a dónde mover para que el país llene el mapa
    const k = Math.min(3.2, 0.82 / Math.max((x1 - x0) / W, (y1 - y0) / H));
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    return {
      code,
      d: path(f as any) ?? '',
      zoom: { k: +k.toFixed(3), tx: +(W / 2 - k * cx).toFixed(1), ty: +(H / 2 - k * cy).toFixed(1) },
    };
  });

  const origin = pt(TIJUANA);
  const routes = Object.fromEntries(
    (Object.keys(cities) as CountryCode[]).map((code) => [
      code,
      cities[code].map((c) => {
        const [x, y] = pt(c.at);
        // Arco suave desde Tijuana hasta la ciudad
        const mx = (origin[0] + x) / 2;
        const my = (origin[1] + y) / 2 - Math.hypot(x - origin[0], y - origin[1]) * 0.25;
        return { name: c.name, x: +x.toFixed(1), y: +y.toFixed(1), d: `M${origin[0].toFixed(1)},${origin[1].toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}` };
      }),
    ]),
  ) as Record<CountryCode, { name: string; x: number; y: number; d: string }[]>;

  return {
    countries,
    context: context.map((f) => path(f as any) ?? ''),
    origin: { x: +origin[0].toFixed(1), y: +origin[1].toFixed(1) },
    routes,
  };
}

export function northAmerica() {
  return (cache ??= build());
}
