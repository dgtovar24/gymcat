# GymCat — Documentación Técnica

> Comparador de gimnasios en Cataluña. Precios reales, instalaciones verificadas, reseñas analizadas por IA.

---

## 📐 Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                    Vercel (Edge)                      │
│  ┌────────────────────────────────────────────────┐  │
│  │         Astro 5 SSR + @astrojs/vercel           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │  Pages   │  │ API Routes│  │  Components  │  │  │
│  │  │ (.astro) │  │  (.ts)   │  │  (.astro)    │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────────┐
│  PostgreSQL │  │  DeepSeek API │  │  Google Maps    │
│  (externo)  │  │  (chat + V4) │  │  Places/Geo/    │
│  15 + GIS   │  │  Temp=0 JSON │  │  Photos APIs    │
└─────────────┘  └──────────────┘  └─────────────────┘
```

### Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Hosting** | Vercel (Serverless) | Hobby |
| **Framework** | Astro + SSR | 5.18 |
| **Estilos** | Tailwind CSS v4 + CSS custom properties | 4.x |
| **BD** | PostgreSQL + PostGIS + pgvector | 15 |
| **ORM** | Drizzle ORM | 0.38 |
| **Mapas** | Google Maps JS API + Places + Photos | v3 |
| **IA** | DeepSeek Chat (V4 Flash) | API v1 |
| **Scraping** | ScrapingBee (JS rendering) | - |
| **Analytics** | Vercel Web Analytics + Custom DB events | - |

### Estructura del proyecto

```
gymcat/
├── src/
│   ├── pages/           # Rutas Astro (SSR + API)
│   │   ├── index.astro          # Landing page con buscador IA
│   │   ├── gimnasios/
│   │   │   ├── index.astro      # Listado + filtros client-side
│   │   │   └── [slug].astro     # Ficha detallada
│   │   ├── comparar.astro       # Comparador A vs B
│   │   ├── mapa.astro           # Mapa Google Maps full
│   │   ├── quienes-somos.astro  # About page
│   │   ├── contacto.astro       # Contacto
│   │   ├── api/
│   │   │   ├── search.ts        # DeepSeek → filtros JSON
│   │   │   ├── analytics.ts     # Tracking eventos
│   │   │   └── admin/
│   │   │       ├── generate.ts  # IA: PDF + Web + Reviews
│   │   │       ├── parse-pdf.ts # Extract PDF text
│   │   │       └── analytics.ts # Dashboard datos
│   │   └── admin/
│   │       ├── index.astro      # Panel CRUD gimnasios
│   │       ├── analytics.astro  # Dashboard analytics
│   │       └── settings.astro   # Configuración
│   ├── components/ui/          # Header, Footer
│   ├── layouts/BaseLayout.astro # Layout raíz
│   ├── lib/
│   │   ├── db/index.ts         # Conexión PostgreSQL
│   │   ├── db/schema/index.ts  # Drizzle schema (11 tablas)
│   │   └── ai.ts               # Cliente DeepSeek
│   └── styles/global.css       # Design system
├── public/
│   ├── favicon.svg             # Gato negro
│   ├── GymCatLogo.png          # Logo
│   ├── map-init.js             # Google Maps init
│   └── gym-list.js             # Filtrado client-side
├── scripts/                    # Scripts de utilidad
│   ├── import-full-gyms.ts     # Import masivo gimnasios
│   ├── verify-gyms.ts          # Verificar vs Google Maps
│   ├── fix-coords-from-maps.ts # Corregir coordenadas
│   ├── set-gym-photos.ts      # Fotos desde Places API
│   └── migrate-analytics.ts    # Migración analytics
├── drizzle/                    # Migraciones Drizzle
├── vercel.json                 # Config Vercel
└── .env                        # Variables de entorno
```

### Base de datos — 11 tablas

| Tabla | Descripción | Campos clave |
|-------|-------------|-------------|
| `gyms` | Gimnasios (35 campos) | name, lat/lng, prices, permanencia, IA summaries, embedding |
| `chains` | Cadenas (DiR, VivaGym...) | name, slug, logoUrl |
| `cities` | Ciudades | name, province, region |
| `neighborhoods` | Barrios | cityId, name, slug |
| `facilities` | Instalaciones (27) | name, slug, icon, category |
| `gym_facilities` | M2M gym↔facility | gymId, facilityId |
| `gym_images` | Galería de imágenes | gymId, imageUrl, sortOrder |
| `gym_urls` | URLs para análisis | gymId, url, label |
| `prices_history` | Historial de precios | gymId, priceType, amount, validFrom/To |
| `reviews_summary` | Reseñas agregadas | gymId, rating, topPros, topCons |
| `analytics_events` | Eventos de tracking | eventType, gymId, sessionId, ipHash |

**Extensiones Postgres**: PostGIS 3.3.2 (geometría), pgvector 0.8.2 (embeddings), uuid-ossp.

### Diseño — Cal.com design system

- **Colores**: White bg, Charcoal `#242424` texto, Inter body, Cal Sans display
- **Sombras**: Multi-layer `rgba(19,19,22,0.7)`
- **Bordes**: `6-8px` radius buttons, `8-12px` radius cards
- **Pills**: `9999px` border-radius para badges
- **Tipografía**: Inter (body), Cal Sans (display/headings), Roboto Mono (precios)
- **Sin emojis**: SVG inline con `stroke="currentColor"` para todos los iconos
