# API Reference — GymCat

Base URL: `https://gymcat.es/api`

---

## Search (IA)

### `POST /api/search`

Convierte lenguaje natural en filtros estructurados usando DeepSeek.

**Request:**
```json
{
  "query": "gimnasio con piscina por menos de 40 euros en Barcelona"
}
```

**Response:**
```json
{
  "filters": {
    "facilities": ["piscina"],
    "maxPrice": 40,
    "city": "Barcelona",
    "is24h": false,
    "sortBy": "price_asc",
    "explanation": "Piscina hasta 40€ en Barcelona"
  },
  "query": "gimnasio con piscina por menos de 40 euros en Barcelona",
  "searchBarText": ""
}
```

`searchBarText` solo se rellena si la consulta son ≤3 palabras (nombre de gimnasio).

**Modelo**: `deepseek-chat` → redirigido a V4 Flash. Temperature: 0. JSON mode.

---

## Analytics

### `POST /api/analytics`

Registra eventos anónimos de navegación.

**Request:**
```json
{
  "event_type": "gym_view",
  "gym_id": 18,
  "page": "/gimnasios/dir-tuset",
  "meta": {}
}
```

**Event types válidos**: `page_view`, `landing_view`, `gym_view`, `search`, `website_click`

**Anonimización**: IP hasheada con SHA-256. Session ID rotativo cada ~24h.

### `GET /api/admin/analytics?days=30`

Devuelve métricas agregadas para el panel admin.

**Response:**
```json
{
  "pageViews": 450,
  "landingViews": 120,
  "searches": 85,
  "websiteClicks": 42,
  "uniqueVisitors": 67,
  "gymViews": [
    { "gymId": 18, "name": "DiR Tuset", "views": 34 },
    ...
  ],
  "period": "30 días"
}
```

---

## Admin — Generación IA

### `POST /api/admin/generate`

Extrae datos estructurados de múltiples fuentes. Acepta `multipart/form-data`.

**Parámetros:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `gym_name` | string | Nombre para buscar en Google Maps |
| `gym_address` | string | Dirección (ayuda a la búsqueda) |
| `place_id` | string | Google Place ID (opcional) |
| `website_url` | string | URL para scraping (múltiples líneas) |
| `pdf` | File | PDF del gimnasio |
| `reviews_only` | string | `"true"` para solo reseñas |

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "DiR Tuset",
    "address": "Carrer d'Aribau, 230",
    "phone": "+34 932 02 22 22",
    "website": "https://...",
    "description": "...",
    "monthly_price_low": 45.00,
    "matricula_fee": 30.00,
    "is_open_247": false,
    "facilities": ["piscina", "spa", "pesas"],
    "ai_summary_pros": ["Buen ambiente", ...],
    "ai_summary_cons": ["Caro", ...]
  },
  "filledFields": ["Nombre", "Dirección", "Precio", "Reseñas"],
  "sources": {
    "hasPdf": false,
    "hasReviews": true,
    "reviewCount": 24
  }
}
```

### `POST /api/admin/parse-pdf`

Extrae texto de PDF usando `zlib.inflateSync` para FlateDecode. Devuelve texto plano.

### `POST /api/admin/analyze`

Compara datos actuales del gimnasio con el contenido scrapeado de sus webs. Detecta cambios de precio, horario, etc.

### `POST /api/admin/apply-changes`

Aplica los cambios detectados por `/analyze` a la base de datos.

---

## Admin — CRUD

Todas las operaciones CRUD se realizan mediante POST al mismo endpoint `/admin` (el `index.astro` procesa `action` + `gym_id`).

| Action | Descripción |
|--------|-------------|
| `create` | Crea nuevo gimnasio |
| `update` | Actualiza todos los campos |
| `delete` | Elimina gimnasio |
| `toggle_visibility` | Activa/desactiva |
| `archive` / `unarchive` | Archiva/recupera |
| `delete_chain` | Elimina todos los gimnasios de una cadena |

---

## Códigos de error

| Código | Significado |
|--------|-------------|
| 400 | Parámetros faltantes |
| 404 | Gimnasio no encontrado |
| 500 | Error interno / API key no configurada |
