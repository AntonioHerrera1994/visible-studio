# Visible Studio: rediseño en Astro

Concepto: **los ojos**. Un par de ojos que siguen el cursor por todo el sitio, se emocionan con los botones importantes, leen lo que escribes en los formularios y parpadean solos.

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera /dist
npm run preview  # sirve /dist
```

## Estructura

```
src/
  components/Eyes.astro      Los ojos (SVG). Variantes: hero, mini (logo), cta
  scripts/eyes.ts            Lógica: seguimiento, parpadeo, estados (emocionado, leyendo, sorpresa)
  i18n/ui.ts                 Textos de interfaz, rutas por idioma y DATOS DE CONTACTO
  content/                   Contenido en Markdown (se edita aquí)
    services/                Servicios principales + landings de Tijuana (mismas URLs que el sitio actual)
    industries/              Páginas por industria
    cases/                   Casos de estudio (placeholder: true = muestra "Contenido de ejemplo")
    blog/
  views/                     Plantillas de cada página (compartidas entre es/en)
  pages/es, pages/en         Rutas
  styles/global.css          Colores, tipografía y escala
```

Para que los ojos reaccionen a un elemento, agrégale `data-eyes-attract`.

## Paletas

Tres paletas que el visitante elige desde el menú (botón de tres puntos): **Agua de Limón** (la original), **Jamaica** y **Mango con Chile**.
Los colores están en `src/styles/palettes.css` como tokens (`--bg`, `--fg`, `--accent`, `--surface`…).
Nunca pongas un color fijo en un componente: usa siempre un token para que las tres paletas funcionen.

## Movimiento e interacción (`src/scripts/motion.ts`)

| Atributo | Efecto |
|---|---|
| `data-reveal` | Entra al aparecer en pantalla (`mask` para títulos, `scale` para bloques) |
| `data-stagger` | Escalona la entrada de los hijos |
| `data-count` | Anima los números del texto |
| `data-magnetic` | El botón se acerca al cursor |
| `data-tilt` | Inclinación 3D con brillo |
| `data-preview-list` | Tarjeta flotante que sigue al cursor |
| `data-slider` | Carrusel con flechas y arrastre |

Todo respeta `prefers-reduced-motion`.

## Portafolio (API de VikingDev)

Los proyectos se leen de `https://vikingdevtj.com/api/proyectos.json` cada vez que compilas.
Si la API no responde, se usa el respaldo `src/data/proyectos.json`.
La configuración está en `src/lib/projects.config.ts`: proyectos ocultos, destacados, textos en inglés y si se usan las imágenes de VikingDev.

Cada tarjeta muestra, en este orden:
1. Captura propia (`public/proyectos/<slug>.webp`). Si existe `<slug>-full.webp`, la página se recorre al pasar el cursor.
2. Banner dinámico generado con los datos del proyecto.
3. Imagen del portafolio de VikingDev, solo si `USE_API_IMAGE_FALLBACK = true`.

### Tomar las capturas

```bash
npx playwright install chromium   # solo la primera vez
npm run capturas                  # captura los proyectos que faltan
npm run capturas -- --forzar      # vuelve a capturar todos
npm run capturas -- --solo=favlash,altive-realty
```

El script cierra popups, banners de cookies y botones flotantes antes de capturar. Si un sitio falla, ese proyecto se queda con el banner dinámico.

## Antes de publicar

- [ ] Datos reales de contacto en `src/i18n/ui.ts` (correo, teléfono, WhatsApp, redes)
- [ ] `PUBLIC_FORM_ENDPOINT` en `.env` (Formspree, webhook de GoHighLevel, etc.)
- [ ] Correr `npm run capturas` para tener la captura real de cada proyecto
- [ ] Equipo en `src/views/About.astro`
- [ ] Migrar el contenido de las landings de Tijuana (`src/content/services/es/local/`) con dirección, mapa y reseñas
- [ ] Revisar los slugs en inglés de servicios contra el sitio actual y agregar redirecciones 301 en `astro.config.mjs`
- [ ] Decidir qué artículos del blog se migran y redirigir los demás
- [ ] Textos legales en `src/views/Legal.astro`
- [ ] Imagen para redes en `public/og.png`
