# GymCat 🐱

> Comparador de gimnasios en Cataluña. Precios reales, instalaciones verificadas, reseñas analizadas por IA.

**[gymcat.es](https://gymcat.es)**

---

## ¿Qué es GymCat?

Un comparador de gimnasios que muestra **toda la verdad**: precios con matrícula, permanencia, coste total, instalaciones verificadas, y resumen de reseñas de Google Maps generado por IA. Para que no tengas que ir al gimnasio para saber si es bueno.

## Características

- 🔍 **Búsqueda con lenguaje natural**: "piscina barato Barcelona" → filtros automáticos
- 📊 **Comparador A/B**: tabla cara a cara con las 27 instalaciones
- 🗺️ **Mapa Google Maps**: todos los gimnasios geolocalizados
- 🤖 **Panel admin con IA**: genera fichas completas desde PDF, web o Google Maps
- 📈 **Analytics**: tracking de visitas, búsquedas y clicks
- 🏷️ **Precio verificado**: badge cuando el precio lo pagó el fundador personalmente
- 📱 **Mobile-first**: responsive, menú desplegable con animación
- 🎨 **Cal.com design system**: limpio, monocromático, sin emojis

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Astro 5 + Tailwind CSS v4 |
| Backend | API Routes SSR (TypeScript) |
| BD | PostgreSQL 15 + PostGIS + pgvector |
| ORM | Drizzle ORM |
| IA | DeepSeek Chat (V4 Flash) + JSON mode |
| Mapas | Google Maps JS + Places + Photos |
| Hosting | Vercel |
| Analytics | Vercel Web Analytics + Custom DB |

## Quick Start

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env
# Editar .env con tus API keys

# Base de datos
npx drizzle-kit migrate

# Desarrollo
npm run dev
# → http://localhost:4321

# Admin
# → http://localhost:4321/admin
# Login: admin / admin123
```

## Documentación

- [Arquitectura y base de datos](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Integraciones IA](docs/AI.md)
- [Flujos de usuario](docs/USER-FLOWS.md)

## Despliegue

```bash
npx vercel --prod
```

Configuración en `vercel.json`:
- Framework: Astro
- Build: `astro build`
- Node.js 22

## Licencia

Privado — Diego Tovar
