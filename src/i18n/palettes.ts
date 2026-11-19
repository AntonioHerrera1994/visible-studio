/** Las tres paletas del sitio. Los colores reales viven en src/styles/palettes.css */
export const palettes = [
  {
    id: 'limon',
    name: { es: 'Agua de Limón', en: 'Lime Water' },
    note: { es: 'Negro y verde. La original.', en: 'Black and green. The original.' },
    swatch: ['#000000', '#2dc65c', '#eef2ec'],
    theme: '#000000',
  },
  {
    id: 'jamaica',
    name: { es: 'Jamaica', en: 'Hibiscus' },
    note: { es: 'Vino de noche y rosa flor.', en: 'Night wine and flower pink.' },
    swatch: ['#22030e', '#ff3d7f', '#ffe3ec'],
    theme: '#22030e',
  },
  {
    id: 'mango',
    name: { es: 'Mango con Chile', en: 'Mango & Chili' },
    note: { es: 'Amarillo mango con picante rojo.', en: 'Mango yellow with a red kick.' },
    swatch: ['#ffb703', '#d62a1e', '#fff4cf'],
    theme: '#ffb703',
  },
] as const;

export type PaletteId = (typeof palettes)[number]['id'];
export const defaultPalette: PaletteId = 'limon';
