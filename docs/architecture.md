# Arquitectura del Sistema

## Visión General

GymCat es un comparador de gimnasios impulsado por IA para Cataluña. Extrae datos estructurados de webs de gimnasios mediante DeepSeek AI y los presenta en un frontend Astro de alto rendimiento con un diseño monocromático inspirado en Linear y Stripe.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN / Edge                           │
│                      (Vercel)                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Astro Frontend (Hybrid)                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────────┐  │
│  │ SSG Pages│  │SSR Routes│  │  React Islands             │  │
│  │ (SEO)    │  │ (Search) │  │  (Maps, Charts, Gallery)   │  │
│  └──────────┘  └──────────┘  └───────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              PostgreSQL (Remote Server)                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────────┐  │
│  │Relational│  │ PostGIS  │  │  pgvector                  │  │
│  │(Gyms,    │  │(Geo      │  │  (Semantic Search          │  │
│  │ Prices,  │  │ Queries) │  │   Embeddings)              │  │
│  │ Images)  │  │          │  │                            │  │
│  └──────────┘  └──────────┘  └───────────────────────────┘  │
└─────────────────────▲───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│              AI Data Pipeline (Manual + Cron)                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────────┐  │
│  │ Scraper  │  │DeepSeek  │  │  Validator + Upsert        │  │
│  │(Browser- │──│AI Parser │──│  (Price History,           │  │
│  │ less/    │  │(JSON     │  │   Alerts, Anomaly)          │  │
│  │ Scraping │  │ Schema)  │  │                            │  │
│  │ Bee)     │  │          │  │                            │  │
│  └──────────┘  └──────────┘  └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Astro 5 (Hybrid SSG + SSR) | Máximo rendimiento SEO con hidratación parcial |
| **Estilos** | Tailwind CSS v4 | Utility-first, rápido desarrollo, diseño consistente |
| **Islas** | Vanilla JS + Leaflet | Sin overhead de framework para interactividad puntual |
| **Base de Datos** | PostgreSQL 15 (remoto) | Robusto, extensiones espaciales y vectoriales |
| **Extensiones** | PostGIS 3.3.2, pgvector 0.8.2 | Consultas geoespaciales y búsqueda semántica |
| **ORM** | Drizzle ORM + drizzle-kit | Type-safe, migraciones automáticas, ligero |
| **IA** | DeepSeek Chat API | Extracción estructurada, resúmenes, búsqueda NL |
| **Mapas** | Leaflet + CartoDB tiles | Open source, sin coste de API, tiles limpios |
| **Scraping** | Browserless + ScrapingBee | Headless Chrome para webs con JS pesado |
| **CI/CD** | GitHub Actions + Vercel | Despliegue automático, pipelines semanales |
| **Hosting BD** | Servidor dedicado (45.90.237.112) | Control total, PostgreSQL nativo |

## Estructura del Proyecto

```
gymcat/
├── src/
│   ├── assets/            # Imágenes, iconos estáticos
│   ├── components/
│   │   ├── ui/            # Header, Footer
│   │   ├── charts/        # Gráficos (pendiente)
│   │   ├── map/           # Componentes de mapa
│   │   └── search/        # Search bar, command palette
│   ├── layouts/
│   │   └── BaseLayout.astro   # Layout raíz con Leaflet + SEO
│   ├── lib/
│   │   ├── ai.ts          # Cliente DeepSeek API
│   │   ├── constants.ts   # Configuración compartida
│   │   └── db/
│   │       ├── index.ts   # Conexión BD (postgres.js)
│   │       └── schema/    # Schema Drizzle (11 tablas)
│   ├── pages/
│   │   ├── index.astro    # Homepage con barra de búsqueda IA
│   │   ├── gimnasios/     # Listado + ficha detalle
│   │   ├── mapa.astro     # Mapa interactivo
│   │   ├── admin/         # Panel admin (CRUD, upload, settings)
│   │   └── api/           # Endpoints SSR
│   └── styles/
│       └── global.css     # Design system + Tailwind
├── scripts/
│   ├── scrape/            # Motor de scraping + configs
│   ├── pipeline/          # Parseo IA + inserción BD
│   ├── db/                # Migraciones + seed
│   └── ingest-barcelona.ts # Datos manuales de Barcelona
├── public/
│   ├── GymCatLogo.png     # Logo y favicon
│   ├── map-init.js        # Inicializador de Leaflet
│   └── gym-list.js        # Filtrado client-side
├── docs/                  # Documentación
├── .github/workflows/     # CI/CD + cron jobs
├── drizzle/               # Migraciones generadas
├── astro.config.mjs
├── drizzle.config.ts
├── tsconfig.json
├── CLAUDE.md              # Guía para Claude
├── AGENTS.md              # Instrucciones para agentes
└── package.json
```

## Esquema de Base de Datos

### Tablas Principales

| Tabla | Propósito | Columnas Clave |
|---|---|---|
| `gyms` | Entidad principal | name, slug, lat, lng, prices, ai_summary, embedding |
| `chains` | Cadenas de gimnasios | name, slug, website |
| `cities` | Municipios | name, province, slug |
| `neighborhoods` | Barrios | name, city_id |
| `facilities` | Catálogo de instalaciones | name, slug, category, icon |
| `gym_facilities` | M2M gym ↔ facility | gym_id, facility_id |
| `prices_history` | Historial de precios | gym_id, price_type, amount, valid_from |
| `gym_images` | Galería multi-imagen | gym_id, image_url, sort_order |
| `reviews_summary` | Resúmenes de reseñas IA | gym_id, rating, top_pros, top_cons |
| `scrape_logs` | Auditoría de scraping | gym_id, source, status |
| `alerts` | Alertas de anomalías | gym_id, type, severity |
| `settings` | Configuración admin | key, value |

### Extensiones

- **PostGIS** (`geometry(Point, 4326)`) — Consultas espaciales (radio, distancia)
- **pgvector** (`vector(256)`) — Búsqueda semántica por similitud coseno

## Flujo de Datos

### 1. Pipeline de Ingesta (Manual/Semanal)

```
Browserless/ScrapingBee
    ↓ (HTML crudo)
Clean HTML (quitar scripts, estilos)
    ↓ (texto legible)
DeepSeek AI (JSON Schema estricto)
    ↓ (datos estructurados: precios, instalaciones, horarios)
Validación de anomalías (umbrales de precio)
    ↓ (datos validados)
Upsert PostgreSQL (INSERT/UPDATE + historial precios + alertas)
```

### 2. Búsqueda con Lenguaje Natural

```
Usuario: "con piscina cerca de Sants por menos de 40€"
    ↓ POST /api/search
DeepSeek Chat API (JSON mode)
    ↓ {maxPrice: 40, facilities: ["piscina"], city: "Barcelona"}
Redirección a /gimnasios?fac=piscina&max=40&city=Barcelona
    ↓
Cliente: gym-list.js aplica filtros AND lógicos
    ↓
Resultados filtrados instantáneamente (sin llamada al servidor)
```

### 3. Agente IA Admin (PDF + Google Reviews)

```
Admin: Arrastra PDF + pulsa "Generar con IA"
    ↓ POST /api/admin/generate
1. Extracción texto PDF (parser binario)
2. Google Maps Places API → reseñas últimos 3 meses
    ↓ (texto combinado)
3. DeepSeek AI → JSON estructurado
    ↓
Auto-relleno del formulario de edición
(nombre, dirección, precios, instalaciones, pros/cons)
```

## Decisiones Arquitectónicas

### ¿Por qué filtrado client-side en lugar de SQL?

Para listados de <100 gimnasios, serializar los datos como JSON en el HTML y filtrar con JavaScript es instantáneo (0ms de latencia vs 50-200ms de consulta SQL). Esto elimina la dependencia de la BD para la experiencia de navegación principal.

### ¿Por qué `lat`/`lng` decimales en lugar de PostGIS geometry?

El tipo personalizado `geometryPoint` de Drizzle no decodifica correctamente el formato binario que PostgreSQL devuelve para geometrías PostGIS. La solución práctica es usar columnas `decimal(10,7)` planas para coordenadas, manteniendo la columna `geometry` para futuras consultas espaciales avanzadas.

### ¿Por qué Leaflet en lugar de Google Maps?

Leaflet es open source, no requiere API key, y los tiles de CartoDB son gratuitos y estéticamente limpios (light mode). Para ~20 gimnasios, la funcionalidad es idéntica sin coste recurrente.

### ¿Por qué DeepSeek en lugar de OpenAI?

DeepSeek ofrece JSON mode nativo (equivalente a Structured Outputs), precios ~10x más bajos, y rendimiento comparable para extracción estructurada en español.

## Seguridad

- **Admin auth**: Cookie simple (`admin_auth`) con valor hardcodeado. Para producción, migrar a JWT + bcrypt.
- **API keys**: Almacenadas en `.env` (no commiteado). En producción, usar variables de entorno de Vercel.
- **CORS**: No configurado — solo necesario si la API se consume desde otro dominio.
- **Rate limiting**: Pendiente para endpoints de IA (DeepSeek tiene rate limits gratuitos).

## Monitorización

- **Scrape logs**: Tabla `scrape_logs` registra cada ejecución con estado y errores
- **Alertas**: Tabla `alerts` para caídas de precio >30% y anomalías
- **CI/CD**: GitHub Actions notifica por email en fallos de build/pipeline
