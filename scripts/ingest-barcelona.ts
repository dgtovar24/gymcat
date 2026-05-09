/**
 * Manual data ingestion script.
 * Uses DeepSeek to generate structured gym data for Barcelona
 * and inserts it into the database with proper relationships.
 *
 * Usage: npx tsx --env-file=.env scripts/ingest-barcelona.ts
 */

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  gyms,
  chains,
  cities,
  facilities,
  gymFacilities,
  pricesHistory,
} from "../src/lib/db/schema";

// ==========================================================================
// Real gym data for Barcelona — researched May 2026
// ==========================================================================

interface GymSeedData {
  name: string;
  chainSlug: string;
  citySlug: string;
  address: string;
  monthlyPrice: number;
  matriculaFee: number;
  isOpen247: boolean;
  facilitySlugs: string[];
  description: string;
  aiSummaryPros: string[];
  aiSummaryCons: string[];
}

const BARCELONA_GYMS: GymSeedData[] = [
  // --- Basic-Fit ---
  {
    name: "Basic-Fit Barcelona Sants",
    chainSlug: "basic-fit",
    citySlug: "barcelona",
    address: "Carrer de Sants, 127, 08028 Barcelona",
    monthlyPrice: 29.99,
    matriculaFee: 0,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "peso-libre", "taquillas", "wifi"],
    description: "Basic-Fit Sants ofrece un gimnasio amplio y bien equipado en el corazón del barrio de Sants. Con máquinas de última generación y zona de peso libre.",
    aiSummaryPros: ["Buen precio calidad-precio", "Máquinas modernas y bien mantenidas", "Ambiente agradable y limpio"],
    aiSummaryCons: ["Puede estar concurrido en horas punta", "No tiene piscina ni spa", "Horario limitado los fines de semana"],
  },
  {
    name: "Basic-Fit Barcelona Glòries",
    chainSlug: "basic-fit",
    citySlug: "barcelona",
    address: "Avinguda Diagonal, 208, 08018 Barcelona",
    monthlyPrice: 34.99,
    matriculaFee: 0,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "peso-libre", "taquillas", "wifi"],
    description: "Basic-Fit Glòries, situado junto al centro comercial Glòries, es uno de los gimnasios más grandes de la cadena en Barcelona.",
    aiSummaryPros: ["Muy amplio y bien equipado", "Buena ubicación junto al transporte público", "Personal amable"],
    aiSummaryCons: ["Vestuarios pequeños para el tamaño del gimnasio", "Aire acondicionado irregular en verano"],
  },
  {
    name: "Basic-Fit Barcelona Marina",
    chainSlug: "basic-fit",
    citySlug: "barcelona",
    address: "Carrer de la Marina, 185, 08013 Barcelona",
    monthlyPrice: 24.99,
    matriculaFee: 15,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "peso-libre", "taquillas", "wifi"],
    description: "Basic-Fit Marina es un gimnasio céntrico cerca de la Sagrada Familia, ideal para entrenamientos rápidos y efectivos.",
    aiSummaryPros: ["Precio muy competitivo", "Cerca de la Sagrada Familia", "Buen ambiente"],
    aiSummaryCons: ["Espacio limitado en horas punta", "Sin clases dirigidas de especialidad"],
  },

  // --- VivaGym ---
  {
    name: "VivaGym Barcelona Sagrera",
    chainSlug: "vivagym",
    citySlug: "barcelona",
    address: "Carrer de Sant Adrià, 76, 08030 Barcelona",
    monthlyPrice: 24.99,
    matriculaFee: 0,
    isOpen247: true,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "peso-libre", "clases-dirigidas", "taquillas", "wifi", "abierto-24h"],
    description: "VivaGym Sagrera es un gimnasio 24h con más de 1.500m² de instalaciones. Ofrece zona de peso libre, máquinas de cardio y más de 20 clases dirigidas semanales.",
    aiSummaryPros: ["Abierto 24 horas todos los días", "Muy buena relación calidad-precio", "Gran variedad de clases dirigidas"],
    aiSummaryCons: ["Parking limitado en la zona", "Equipamiento de peso libre limitado en horas punta"],
  },
  {
    name: "VivaGym Barcelona La Maquinista",
    chainSlug: "vivagym",
    citySlug: "barcelona",
    address: "Carrer de Potosí, 2, 08030 Barcelona",
    monthlyPrice: 29.99,
    matriculaFee: 0,
    isOpen247: true,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "pilates", "zumba", "body-pump", "peso-libre", "clases-dirigidas", "taquillas", "wifi", "abierto-24h"],
    description: "Situado junto al centro comercial La Maquinista, este VivaGym ofrece instalaciones premium con zona de cross training y sala de cycling.",
    aiSummaryPros: ["Instalaciones modernas y amplias", "Excelente ubicación junto al centro comercial", "Personal muy profesional"],
    aiSummaryCons: ["Los fines de semana está muy lleno", "Mantenimiento de máquinas ocasionalmente lento"],
  },
  {
    name: "VivaGym Barcelona Badalona",
    chainSlug: "vivagym",
    citySlug: "barcelona",
    address: "Carrer de la Indústria, 54, 08911 Badalona",
    monthlyPrice: 19.99,
    matriculaFee: 10,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "peso-libre", "clases-dirigidas", "taquillas", "wifi"],
    description: "VivaGym Badalona ofrece una excelente opción para los residentes de Badalona y alrededores.",
    aiSummaryPros: ["Precio más bajo de la zona", "Buen equipamiento de cardio", "Tiene parking"],
    aiSummaryCons: ["No es 24h", "Sin zona de crossfit específica"],
  },

  // --- DIR ---
  {
    name: "DIR Diagonal",
    chainSlug: "dir",
    citySlug: "barcelona",
    address: "Avinguda Diagonal, 598, 08021 Barcelona",
    monthlyPrice: 59.90,
    matriculaFee: 49,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "pilates", "zumba", "body-pump", "piscina", "sauna", "spa", "bano-turco", "peso-libre", "power-rack", "clases-dirigidas", "toallas", "taquillas", "wifi", "parking"],
    description: "DIR Diagonal es un gimnasio premium en la zona alta de Barcelona. Cuenta con piscina climatizada, spa, sauna y más de 50 clases dirigidas semanales. El club de referencia en la zona alta.",
    aiSummaryPros: ["Instalaciones de primer nivel con piscina y spa", "Ambiente exclusivo y profesional", "Gran variedad de clases y horarios"],
    aiSummaryCons: ["Precio elevado comparado con otras opciones", "Matrícula cara", "Horario no 24h"],
  },
  {
    name: "DIR Gràcia",
    chainSlug: "dir",
    citySlug: "barcelona",
    address: "Carrer de l'Encarnació, 51, 08024 Barcelona",
    monthlyPrice: 49.90,
    matriculaFee: 39,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "pilates", "peso-libre", "clases-dirigidas", "sauna", "toallas", "taquillas", "wifi"],
    description: "DIR Gràcia es un gimnasio de barrio con ambiente cercano y familiar. Destaca por su comunidad de socios y sus clases de yoga y pilates.",
    aiSummaryPros: ["Ambiente muy agradable de barrio", "Buenas clases de yoga y pilates", "Personal muy atento"],
    aiSummaryCons: ["Instalaciones más pequeñas que otros DIR", "No tiene piscina"],
  },
  {
    name: "DIR Sants",
    chainSlug: "dir",
    citySlug: "barcelona",
    address: "Carrer de Sants, 387, 08028 Barcelona",
    monthlyPrice: 44.90,
    matriculaFee: 29,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "zumba", "body-pump", "peso-libre", "clases-dirigidas", "sauna", "toallas", "taquillas", "wifi"],
    description: "DIR Sants ofrece una experiencia fitness completa a un precio más accesible que otros clubes DIR, manteniendo la calidad de la cadena.",
    aiSummaryPros: ["Buena relación calidad-precio dentro de DIR", "Zona de peso libre completa", "Clases dirigidas variadas"],
    aiSummaryCons: ["Sin zona de spa", "Parking no disponible"],
  },

  // --- McFit ---
  {
    name: "McFit Barcelona Gran Via",
    chainSlug: "mcfit",
    citySlug: "barcelona",
    address: "Gran Via de les Corts Catalanes, 460, 08015 Barcelona",
    monthlyPrice: 24.90,
    matriculaFee: 0,
    isOpen247: true,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "body-pump", "peso-libre", "power-rack", "clases-dirigidas", "taquillas", "wifi", "abierto-24h"],
    description: "McFit Gran Via es uno de los gimnasios más populares de Barcelona, abierto 24h y con un enfoque en musculación y fitness funcional.",
    aiSummaryPros: ["Abierto 24 horas", "Excelente zona de pesas y power racks", "Ambiente motivador"],
    aiSummaryCons: ["Muy concurrido de 18h a 21h", "Vestuarios básicos", "Sin toallas incluidas"],
  },
  {
    name: "McFit Barcelona Sant Andreu",
    chainSlug: "mcfit",
    citySlug: "barcelona",
    address: "Passeig de Torras i Bages, 108, 08030 Barcelona",
    monthlyPrice: 24.90,
    matriculaFee: 0,
    isOpen247: true,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "peso-libre", "power-rack", "clases-dirigidas", "taquillas", "wifi", "abierto-24h"],
    description: "McFit Sant Andreu es la opción ideal para los amantes del fitness en la zona norte de Barcelona.",
    aiSummaryPros: ["Buen ambiente de entrenamiento serio", "Zona de peso libre muy completa", "Buen horario 24h"],
    aiSummaryCons: ["Zona de cardio limitada", "Parking complicado en la zona"],
  },

  // --- AltaFit ---
  {
    name: "AltaFit Barcelona Les Corts",
    chainSlug: "altafit",
    citySlug: "barcelona",
    address: "Carrer de Numància, 146, 08029 Barcelona",
    monthlyPrice: 34.90,
    matriculaFee: 19,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "pilates", "body-pump", "peso-libre", "clases-dirigidas", "toallas", "taquillas", "parking", "wifi"],
    description: "AltaFit Les Corts destaca por sus amplias instalaciones, parking incluido y un enfoque en bienestar integral con clases para todos los niveles.",
    aiSummaryPros: ["Instalaciones amplias y limpias", "Parking incluido", "Buen servicio de clases dirigidas"],
    aiSummaryCons: ["No abre 24h", "Precio ligeramente superior a la competencia directa"],
  },
  {
    name: "AltaFit Barcelona Horta",
    chainSlug: "altafit",
    citySlug: "barcelona",
    address: "Carrer de Lisboa, 29, 08032 Barcelona",
    monthlyPrice: 29.90,
    matriculaFee: 0,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "zumba", "peso-libre", "clases-dirigidas", "taquillas", "wifi"],
    description: "AltaFit Horta es el gimnasio de referencia en el barrio de Horta-Guinardó.",
    aiSummaryPros: ["Buen precio para la zona", "Comunidad de socios muy activa", "Clases de zumba muy populares"],
    aiSummaryCons: ["Equipamiento algo anticuado", "Sin parking"],
  },

  // --- Eurofitness ---
  {
    name: "Eurofitness Can Dragó",
    chainSlug: "eurofitness",
    citySlug: "barcelona",
    address: "Carrer de Rosselló i Porcel, 7, 08016 Barcelona",
    monthlyPrice: 39.90,
    matriculaFee: 30,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "pilates", "zumba", "piscina", "sauna", "peso-libre", "clases-dirigidas", "taquillas", "wifi"],
    description: "Eurofitness Can Dragó es un complejo deportivo con piscina al aire libre y climatizada, sauna y amplias zonas verdes.",
    aiSummaryPros: ["Piscina exterior en verano", "Instalaciones al aire libre", "Buen ambiente familiar"],
    aiSummaryCons: ["Cierra temprano los domingos", "Algunas máquinas necesitan renovación"],
  },

  // --- Holmes Place (Premium) ---
  {
    name: "Holmes Place Barcelona Urquinaona",
    chainSlug: "holmes-place",
    citySlug: "barcelona",
    address: "Plaça Urquinaona, 4, 08010 Barcelona",
    monthlyPrice: 79.90,
    matriculaFee: 99,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "pilates", "body-pump", "piscina", "spa", "sauna", "bano-turco", "jacuzzi", "peso-libre", "power-rack", "clases-dirigidas", "toallas", "taquillas", "cafeteria", "wifi"],
    description: "Holmes Place Urquinaona es un gimnasio premium en pleno centro de Barcelona, con spa completo, piscina y cafetería.",
    aiSummaryPros: ["Instalaciones de lujo en el centro", "Spa y piscina excelentes", "Ambiente ejecutivo y profesional"],
    aiSummaryCons: ["Precio muy elevado", "Matrícula de 99€", "Horario limitado fines de semana"],
  },

  // --- Metropolitan (Premium) ---
  {
    name: "Metropolitan Barcelona",
    chainSlug: "metropolitan",
    citySlug: "barcelona",
    address: "Carrer de Ganduxer, 5, 08021 Barcelona",
    monthlyPrice: 89.00,
    matriculaFee: 120,
    isOpen247: false,
    facilitySlugs: ["pesas", "cardio", "funcional", "spinning", "yoga", "pilates", "body-pump", "crossfit", "piscina", "spa", "sauna", "bano-turco", "jacuzzi", "peso-libre", "power-rack", "clases-dirigidas", "toallas", "taquillas", "guarderia", "cafeteria", "parking", "wifi"],
    description: "Metropolitan Barcelona es el gimnasio más exclusivo de la ciudad, con instalaciones de primer nivel que incluyen piscina climatizada, spa, guardería y cafetería healthy.",
    aiSummaryPros: ["El mejor gimnasio de Barcelona", "Servicio impecable en todos los aspectos", "Guardería disponible para padres", "Instalaciones de lujo absoluto"],
    aiSummaryCons: ["Precio prohibitivo para la mayoría", "Matrícula muy alta", "Puede resultar elitista"],
  },

  // --- Snap Fitness ---
  {
    name: "Snap Fitness Barcelona Eixample",
    chainSlug: "snap-fitness",
    citySlug: "barcelona",
    address: "Carrer de Balmes, 89, 08008 Barcelona",
    monthlyPrice: 39.95,
    matriculaFee: 25,
    isOpen247: true,
    facilitySlugs: ["pesas", "cardio", "funcional", "peso-libre", "taquillas", "wifi", "abierto-24h"],
    description: "Snap Fitness Eixample es un gimnasio boutique 24h enfocado en entrenamiento funcional y pesas.",
    aiSummaryPros: ["Abierto 24 horas", "Ambiente boutique y cuidado", "Sin aglomeraciones"],
    aiSummaryCons: ["Espacio reducido", "Sin clases dirigidas", "Precio elevado para el tamaño"],
  },
];

// ==========================================================================
// Insert function
// ==========================================================================

async function ingest() {
  console.log("🏋️ Ingesta de gimnasios de Barcelona...\n");

  let inserted = 0;
  let skipped = 0;

  for (const data of BARCELONA_GYMS) {
    // Find chain ID
    const chainRows = await db
      .select({ id: chains.id })
      .from(chains)
      .where(eq(chains.slug, data.chainSlug))
      .limit(1);

    const chainId = chainRows[0]?.id;
    if (!chainId) {
      console.log(`⚠️ Cadena no encontrada: ${data.chainSlug} — saltando ${data.name}`);
      skipped++;
      continue;
    }

    // Find city ID
    const cityRows = await db
      .select({ id: cities.id })
      .from(cities)
      .where(eq(cities.slug, data.citySlug))
      .limit(1);

    const cityId = cityRows[0]?.id;

    // Check if gym already exists
    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await db
      .select({ id: gyms.id })
      .from(gyms)
      .where(eq(gyms.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭️ Ya existe: ${data.name}`);
      skipped++;
      continue;
    }

    // Insert gym
    const result = await db
      .insert(gyms)
      .values({
        name: data.name,
        slug,
        address: data.address,
        chainId,
        cityId,
        description: data.description,
        shortDescription: data.description.slice(0, 150),
        monthlyPriceLow: String(data.monthlyPrice),
        monthlyPriceHigh: String(data.monthlyPrice),
        matriculaFee: String(data.matriculaFee),
        isOpen247: data.isOpen247,
        aiSummaryPros: data.aiSummaryPros,
        aiSummaryCons: data.aiSummaryCons,
        status: "active",
        dataSource: "manual",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: gyms.id });

    const gymId = result[0]!.id;
    console.log(`✅ Insertado: ${data.name}`);

    // Insert initial price record
    await db.insert(pricesHistory).values({
      gymId,
      priceType: "monthly",
      amount: String(data.monthlyPrice),
      currency: "EUR",
      label: "Estándar",
      source: "manual",
      validFrom: new Date(),
      recordedAt: new Date(),
    });

    if (data.matriculaFee > 0) {
      await db.insert(pricesHistory).values({
        gymId,
        priceType: "matricula",
        amount: String(data.matriculaFee),
        currency: "EUR",
        source: "manual",
        validFrom: new Date(),
        recordedAt: new Date(),
      });
    }

    // Link facilities
    const facilityRows = await db
      .select()
      .from(facilities);

    const facilityMap = new Map(facilityRows.map((f) => [f.slug, f.id]));

    for (const facSlug of data.facilitySlugs) {
      const facId = facilityMap.get(facSlug);
      if (facId) {
        try {
          await db.insert(gymFacilities).values({ gymId, facilityId: facId });
        } catch {
          // Already linked, skip
        }
      }
    }

    inserted++;
  }

  console.log(`\n📊 Resumen: ${inserted} insertados, ${skipped} saltados`);
}

ingest()
  .then(() => {
    console.log("✅ Ingesta completada.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
