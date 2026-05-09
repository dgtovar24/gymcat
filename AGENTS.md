# AGENTS.md — GymCat Agent Instructions

## Role

You are an AI agent working on GymCat, a gym comparison platform. Follow these conventions strictly.

## Code Style

- **TypeScript strict mode** — All code in `src/` must pass `astro check` with zero errors
- **No `any` types** unless absolutely necessary (fallback error handlers)
- **Imports**: Use `@lib/`, `@components/`, `@layouts/` path aliases
- **Drizzle**: All DB queries via `db` from `@lib/db`, use `eq()`/`asc()`/`desc()` from `drizzle-orm`
- **Astro APIs**: Use `Astro.cookies`, `Astro.redirect`, `Astro.request` for SSR; `import.meta.env` for env vars
- **API routes**: Export `GET()`/`POST()` functions with `{ request }` parameter

## UI Conventions

- **NO EMOJIS** — Use inline SVGs with `stroke="currentColor"` for all icons
- **Cal.com design system**: White bg, Charcoal (`#242424`) text, Inter body, Cal Sans display
- **Responsive**: Mobile-first, `max-width: 1200px` container, CSS Grid for layouts
- **Buttons**: `.btn` class — Charcoal bg, white text, 6–8px radius
- **Cards**: White bg, multi-layered shadow (`rgba(19,19,22,0.7) 0px 1px 5px -4px, ...`), 8–12px radius
- **Pill badges**: `9999px` border-radius for facility chips and status indicators

## Database Rules

- **Always use flat `lat`/`lng` decimal columns**, not PostGIS geometry — the custom type decoder is broken
- **Price columns are `decimal(10,2)`** — compare with `Number()` conversion
- **JSONB arrays** (`aiSummaryPros`, `aiSummaryCons`) — access as `string[]`
- **M2M tables** (`gymFacilities`) — use `uniqueIndex` for constraint

## AI Pipeline

- **Search**: DeepSeek parses natural language → returns `{maxPrice, facilities[], city, is24h}` → URL params → client-side filtering
- **Admin generate**: PDF text extraction + Google Maps Places API reviews → DeepSeek → structured JSON → form auto-fill
- **Model**: `deepseek-chat` by default, configurable via `/admin/settings`
- **Temperature**: 0 (deterministic extraction)

## Common Pitfalls

1. **`is:inline` on scripts with attributes** — Astro requires this directive or it warns
2. **`import.meta.env` in tsx scripts** — Use `--env-file=.env` flag with `tsx`
3. **Leaflet init race condition** — Always poll for `L` availability in inline scripts
4. **PostGIS geometry decoding** — The `fromDriver` in `geometryPoint` custom type returns `{lat:0,lng:0}` because Postgres sends binary, not EWKT text. Use flat `lat`/`lng` columns instead.
5. **Client-side filtering `set:html`** — Don't use Astro template expressions in script tags. Use `define:vars` for SSR-to-client data transfer.

## File Naming

- **Astro pages**: `[param].astro` for dynamic routes, `index.astro` for directory roots
- **API routes**: `src/pages/api/[name].ts` — Astro detects and serves as endpoints
- **Components**: PascalCase in `src/components/`
- **Scripts**: kebab-case in `scripts/`
- **Docs**: kebab-case in `docs/`
