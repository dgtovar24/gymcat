# CLAUDE.md — GymCat Project Guide

## Project Overview

GymCat is an AI-powered gym comparison platform for Cataluña, Spain. It scrapes gym websites, extracts structured pricing data via DeepSeek AI, and presents it through a high-performance Astro frontend with a monochrome, tech-forward design inspired by Linear and Stripe.

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | Astro 5 (Hybrid SSG + SSR) |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL 15 + PostGIS 3.3.2 + pgvector 0.8.2 (remote: `45.90.237.112:5433`) |
| **ORM** | Drizzle ORM + drizzle-kit |
| **AI** | DeepSeek Chat API (`sk-2f9f3f0e26554aadae0aa2d7ab80d39a`) |
| **Scraping** | Browserless + ScrapingBee |
| **Maps** | Leaflet (loaded in BaseLayout `<head>`) |
| **Deploy** | Vercel + GitHub Actions |
| **Package Manager** | npm |

## Commands

```bash
npm run dev          # Start dev server (port 4322)
npm run build        # Build for production
npx astro check      # Type checking + Astro validation
npm run db:migrate   # Run DB migrations
npm run db:seed      # Seed reference data
npm run pipeline     # Run full data pipeline (scrape + AI parse + insert)
npm run scrape       # Test scraper for a single chain
```

## Key Files

| File | Purpose |
|---|---|
| `src/lib/db/schema/index.ts` | Drizzle ORM schema (11 tables) |
| `src/lib/db/index.ts` | DB connection (postgres.js) |
| `src/lib/ai.ts` | DeepSeek API client |
| `src/lib/constants.ts` | Shared config (chains, prices, thresholds) |
| `src/layouts/BaseLayout.astro` | Root layout with Leaflet CSS/JS |
| `src/pages/index.astro` | Homepage with AI search bar |
| `src/pages/gimnasios/index.astro` | Gym listing (SSR data → client-side filtering) |
| `src/pages/gimnasios/[slug].astro` | Gym detail (marketplace layout) |
| `src/pages/mapa.astro` | Interactive map with all gyms |
| `src/pages/admin/index.astro` | Admin panel (CRUD, PDF drop zone, AI generate) |
| `src/pages/admin/settings.astro` | AI/Google Maps configuration |
| `src/pages/api/search.ts` | DeepSeek natural language search endpoint |
| `src/pages/api/admin/generate.ts` | AI agent: PDF + Google Reviews → structured data |
| `public/gym-list.js` | Client-side gym filtering & rendering |
| `public/map-init.js` | Leaflet map initializer |
| `scripts/pipeline/index.ts` | Data pipeline orchestrator |
| `scripts/ingest-barcelona.ts` | Manual gym data ingestion for Barcelona |

## Database

**Connection**: `postgresql://gymcat:Ameri5202@45.90.237.112:5433/gymcat`

**Tables**: gyms, chains, cities, neighborhoods, facilities, gymFacilities, pricesHistory, gymImages, reviewsSummary, scrapeLogs, alerts, settings

**Key columns**:
- `gyms.lat` / `gyms.lng` — Decimal coordinates (flat, NOT PostGIS geometry)
- `gyms.imageUrl` — Main image (deprecated in favor of gymImages)
- `gymImages` — Multi-image gallery per gym
- `gyms.aiSummaryPros` / `gyms.aiSummaryCons` — JSONB arrays

## Design System (Cal.com inspired)

- **Background**: White (`#fff`)
- **Text**: Charcoal (`#242424`), Mid Gray (`#898989`)
- **Display font**: Cal Sans (headings 24px+, weight 600)
- **Body font**: Inter (300–600)
- **Mono font**: Roboto Mono (prices, data)
- **Cards**: Multi-layered shadow, 8–12px radius
- **Buttons**: Charcoal bg, white text, 6–8px radius, pill variants at 9999px
- **No emojis**: All icons are inline SVGs with `stroke="currentColor"`

## Architecture Patterns

1. **Client-side filtering**: Gym listing serializes data as JSON in `data-gyms` attribute → `gym-list.js` renders and filters instantly without server roundtrips
2. **Leaflet via data attributes**: Map initialized by `map-init.js` reading `data-map-lat/lng/name` attributes on a container div
3. **AI search flow**: Homepage → POST `/api/search` → DeepSeek parses NL query → redirects to `/gimnasios?fac=...&max=...&city=...` → JS applies filters
4. **Admin AI agent**: Drop PDF → click "Generar con IA" → POST `/api/admin/generate` → extracts PDF text + Google Maps reviews → DeepSeek returns structured JSON → auto-fills form
5. **Province filter**: City addresses parsed for province detection, dropdown updates page title dynamically

## Current State

- 17 gyms across 10 chains in Barcelona
- Dev server: `http://localhost:4322`
- Build: 0 errors, 0 warnings, 34 files
- Admin: `admin` / `admin123`

## Gotchas

- `import.meta.env` doesn't work in `tsx` scripts — use `--env-file=.env` flag
- PostGIS `geometryPoint` custom type has broken `fromDriver` — use flat `lat`/`lng` decimal columns instead
- `<script>` tags with attributes need `is:inline` directive in Astro
- Avoid `set:html` inside script tags — use data attributes or `define:vars` instead
