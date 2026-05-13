# Integraciones IA — GymCat

## Modelos

| Endpoint | Modelo | Temperatura | Modo |
|----------|--------|-------------|------|
| `/api/search` | `deepseek-chat` → V4 Flash | 0 | JSON |
| `/api/admin/generate` | `deepseek-chat` → V4 Flash | 0 | JSON |
| `/api/admin/parse-pdf` | `deepseek-chat` → V4 Flash | 0 | JSON |
| `/api/admin/analyze` | Configurable (DB) | 0 | JSON |

`deepseek-v4-pro` no soporta `response_format: { type: "json_object" }` correctamente — devuelve objetos vacíos. Se fuerza `deepseek-chat` que redirige automáticamente a V4 Flash.

---

## Pipeline de generación (`/api/admin/generate`)

```
┌─────────┐    ┌──────────┐    ┌──────────────┐
│  PDF    │───▶│ Extract  │───▶│              │
│ (opc)   │    │ FlateD.  │    │              │
└─────────┘    └──────────┘    │              │
                               │   DeepSeek   │
┌─────────┐    ┌──────────┐    │   (JSON)     │───▶ Formulario
│ Website │───▶│ScrapingB.│───▶│              │    auto-relleno
│  URL    │    │ (render) │    │              │
└─────────┘    └──────────┘    │              │
                               │              │
┌─────────┐    ┌──────────┐    │              │
│ Google  │───▶│ Places   │───▶│              │
│ Maps    │    │ Reviews  │    │              │
└─────────┘    └──────────┘    └──────────────┘
```

### 1. Extracción PDF
- `zlib.inflateSync` para streams FlateDecode
- Extrae texto entre `BT`/`ET` (Begin Text/End Text)
- Operadores `Tj` y `TJ` para texto visible
- Descarta garbage binario (>30% caracteres no imprimibles)

### 2. Web scraping
- **ScrapingBee**: `render_js=true`, `wait=1500ms`, proxy español
- Timeout: 8s (antes 20s — reducido para Vercel 10s límite)
- Fallback: `fetch()` directo sin JS
- Extrae texto limpio: elimina `<script>`, `<style>`, etiquetas HTML

### 3. Google Maps Reviews
- `findplacefromtext` → busca por nombre + "gimnasio barcelona"
- `place/details` → `fields=reviews,rating`
- Filtra reseñas de últimos 90 días
- Límite: 20 reseñas

### 4. Prompt DeepSeek
- **Modo completo**: extrae 12 campos (nombre, dirección, teléfono, web, descripción, precio, matrícula, mantenimiento, 24h, instalaciones, pros, contras)
- **Modo solo reseñas** (`reviews_only=true`): extrae solo `ai_summary_pros` y `ai_summary_cons`
- Sistema de fallback: si no hay datos → error 400 "Sin datos para analizar"

---

## Búsqueda semántica (planificada)

La tabla `gyms` tiene columna `embedding` (pgvector 256). Permitirá búsqueda por similitud semántica:

```sql
SELECT * FROM gyms 
ORDER BY embedding <-> query_embedding 
LIMIT 20;
```

Pendiente: generar embeddings con DeepSeek Embeddings API.

---

## Resumen de reseñas

El endpoint `generate` extrae `ai_summary_pros` y `ai_summary_cons` desde Google Maps reviews. Se guardan en columnas JSONB. La ficha del gimnasio las muestra en verde (pros) y rojo (contras).

---

## Optimizaciones Vercel

- ScrapingBee `wait`: 1500ms (antes 3000ms)
- Timeout fetch: 8s (antes 20s)
- Límite Vercel Hobby: 10s/serverless function
- PDF: máximo 4000 chars enviados a DeepSeek
- Web: máximo 4000 chars por URL
- DeepSeek: `max_tokens: 1500`
