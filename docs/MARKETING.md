# Marketing & SEO — GymCat

## Estrategia SEO

### Páginas indexables

| Ruta | Título | Descripción |
|------|--------|-------------|
| `/` | GymCat — Comparador de gimnasios en Cataluña | Precios reales, instalaciones y reseñas |
| `/gimnasios` | Gimnasios en Cataluña — Compara precios | Listado completo con filtros |
| `/gimnasios/[slug]` | [Nombre] — Precios, instalaciones y opiniones | Ficha individual por gimnasio |
| `/mapa` | Mapa de gimnasios en Barcelona y Cataluña | Mapa interactivo |
| `/comparar` | Comparador de Gimnasios | Compara dos gimnasios cara a cara |
| `/quienes-somos` | Quiénes Somos — GymCat | Historia del fundador |

### Meta tags por página
- `metaTitle` y `metaDescription` personalizados en cada gimnasio
- `canonical` URL en `BaseLayout`
- Schema.org pendiente (LocalBusiness para cada gimnasio)

### Sitemap
- Generado dinámicamente en `/sitemap.xml.ts`
- Incluye todas las URLs de gimnasios activos

---

## Estrategia de contenidos

### Blog (pendiente)
- "Cómo elegir gimnasio en Barcelona: guía completa"
- "Gimnasios 24h en Barcelona: comparativa"
- "¿Merece la pena pagar permanencia en un gimnasio?"
- "ClassPass vs suscripción tradicional: ¿qué conviene?"

### RRSS
- Instagram: [@dg.tovar](https://instagram.com/dg.tovar)
- LinkedIn: [Diego Tovar](https://linkedin.com/in/dgtovar)

---

## Palabras clave objetivo

| Keyword | Volumen (est.) | Competencia |
|---------|----------------|-------------|
| gimnasios barcelona | Alto | Alta |
| comparar gimnasios | Medio | Media |
| gimnasio barato barcelona | Medio | Alta |
| gimnasio 24h barcelona | Bajo | Media |
| gimnasio con piscina barcelona | Medio | Media |
| gimnasio sin permanencia | Bajo | Baja |
| mejor gimnasio barcelona | Alto | Alta |

---

## Analytics

### Eventos trackeados
- `landing_view` — visitas a la homepage
- `page_view` — navegación general
- `gym_view` — visitas a fichas de gimnasio
- `search` — búsquedas (filtros aplicados)
- `website_click` — clicks a webs externas

### Dashboard
- `/admin/analytics`: landing views, búsquedas, clicks, visitantes únicos
- Top gimnasios más vistos (últimos 7/30/90 días)
- Vercel Web Analytics: page views, países, dispositivos

---

## Optimización de conversión

- **CTA principal**: "Buscar gimnasios" en la landing
- **Botones "Visitar web"**: enlace directo al gimnasio
- **"Comparar"**: invita a comparar 2 gimnasios
- **Badge "Sin permanencia"**: filtro verde que atrae clics
- **Precio verificado**: genera confianza (precio real pagado)

---

## Competidores

| Competidor | Fortaleza | Debilidad |
|------------|-----------|-----------|
| Google Maps | Tráfico masivo | Sin comparación de precios reales |
| FitnessKPI | Datos de franquicias | No enfocado en usuario final |
| Gympass/ClassPass | Reservas | No compara precios mensuales |
| Webs de cadenas | Datos oficiales | No comparan con competencia |

**Ventaja GymCat**: precios reales verificados, comparación cruzada de cadenas, sin sesgo comercial.
