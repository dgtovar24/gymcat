# Gymcat

Comparador inteligente de gimnasios en Cataluña. Precios reales, datos actualizados, sin letra pequeña.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

## 🏗️ Architecture

See [docs/architecture.md](docs/architecture.md) for the full system design.

## 📊 Data Pipeline

Gymcat automatically scrapes gym websites and extracts structured pricing data using DeepSeek AI.

```bash
# Run a single chain
npm run pipeline basic-fit

# Run all chains
npm run pipeline
```

## 🔧 Tech Stack

- **Frontend**: Astro 5 + Tailwind CSS v4
- **Database**: PostgreSQL + PostGIS + pgvector
- **AI**: DeepSeek Chat API
- **Scraping**: Browserless + ScrapingBee
- **Deploy**: Vercel + GitHub Actions

## 📁 Project Structure

```
src/
├── components/   # UI components (Astro + React islands)
├── layouts/      # Page layouts
├── lib/          # Shared utilities (DB, AI, constants)
├── pages/        # Routes (SSG + SSR)
└── styles/       # Design system

scripts/
├── scrape/       # Web scraping engine
├── pipeline/     # AI parsing + DB ingestion
└── db/           # Migrations + seed data
```

## 🌍 Coverage

Phase 1 targets: Barcelona capital (100-200 gyms from 5 major chains)
Phase 3 expands to: All Cataluña (Girona, Lleida, Tarragona, cities > 50k population)

## 📝 License

Proprietary. All rights reserved.
