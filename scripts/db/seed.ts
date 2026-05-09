/**
 * Database seed script.
 * Populates initial reference data: cities, chains, facilities.
 *
 * Usage: npm run db:seed
 */

import { eq } from "drizzle-orm";
import { db } from "../../src/lib/db";
import { chains, cities, facilities, neighborhoods } from "../../src/lib/db/schema";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ---- Chains ----
  console.log("→ Seeding chains...");
  const chainsData = [
    { name: "Basic-Fit", slug: "basic-fit", website: "https://www.basic-fit.com" },
    { name: "VivaGym", slug: "vivagym", website: "https://www.vivagym.es" },
    { name: "DIR", slug: "dir", website: "https://www.dir.cat" },
    { name: "McFit", slug: "mcfit", website: "https://www.mcfit.com" },
    { name: "AltaFit", slug: "altafit", website: "https://www.altafit.com" },
    { name: "Eurofitness", slug: "eurofitness", website: "https://www.eurofitness.com" },
    { name: "Snap Fitness", slug: "snap-fitness", website: "https://www.snapfitness.com" },
    { name: "Anytime Fitness", slug: "anytime-fitness", website: "https://www.anytimefitness.es" },
    { name: "Holmes Place", slug: "holmes-place", website: "https://www.holmesplace.com" },
    { name: "Metropolitan", slug: "metropolitan", website: "https://www.clubmetropolitan.com" },
  ];

  for (const chain of chainsData) {
    await db
      .insert(chains)
      .values(chain)
      .onConflictDoNothing()
      .execute();
  }
  console.log(`  ✓ ${chainsData.length} chains seeded`);

  // ---- Cities (Cataluña) ----
  console.log("→ Seeding cities...");
  const citiesData = [
    { name: "Barcelona", slug: "barcelona", province: "Barcelona", postalCodes: ["08001", "08002", "08003", "08004", "08005"] },
    { name: "L'Hospitalet de Llobregat", slug: "hospitalet-de-llobregat", province: "Barcelona" },
    { name: "Badalona", slug: "badalona", province: "Barcelona" },
    { name: "Terrassa", slug: "terrassa", province: "Barcelona" },
    { name: "Sabadell", slug: "sabadell", province: "Barcelona" },
    { name: "Tarragona", slug: "tarragona", province: "Tarragona" },
    { name: "Lleida", slug: "lleida", province: "Lleida" },
    { name: "Girona", slug: "girona", province: "Girona" },
    { name: "Mataró", slug: "mataro", province: "Barcelona" },
    { name: "Reus", slug: "reus", province: "Tarragona" },
    { name: "Sant Cugat del Vallès", slug: "sant-cugat-del-valles", province: "Barcelona" },
    { name: "Cornellà de Llobregat", slug: "cornella-de-llobregat", province: "Barcelona" },
    { name: "Granollers", slug: "granollers", province: "Barcelona" },
    { name: "Manresa", slug: "manresa", province: "Barcelona" },
    { name: "Vic", slug: "vic", province: "Barcelona" },
    { name: "Figueres", slug: "figueres", province: "Girona" },
    { name: "Blanes", slug: "blanes", province: "Girona" },
    { name: "Sitges", slug: "sitges", province: "Barcelona" },
    { name: "Castelldefels", slug: "castelldefels", province: "Barcelona" },
    { name: "El Prat de Llobregat", slug: "el-prat-de-llobregat", province: "Barcelona" },
  ];

  for (const city of citiesData) {
    await db
      .insert(cities)
      .values(city)
      .onConflictDoNothing()
      .execute();
  }
  console.log(`  ✓ ${citiesData.length} cities seeded`);

  // ---- Facilities ----
  console.log("→ Seeding facilities...");
  const facilitiesData = [
    // Cardio & Strength
    { name: "Zona de pesas", slug: "pesas", category: "strength", icon: "🏋️" },
    { name: "Máquinas de cardio", slug: "cardio", category: "cardio", icon: "🏃" },
    { name: "Peso libre", slug: "peso-libre", category: "strength", icon: "🏋️‍♂️" },
    { name: "Zona funcional", slug: "funcional", category: "strength", icon: "🔧" },
    { name: "Power Rack", slug: "power-rack", category: "strength", icon: "🏗️" },
    // Wellness
    { name: "Piscina", slug: "piscina", category: "wellness", icon: "🏊" },
    { name: "Spa", slug: "spa", category: "wellness", icon: "💆" },
    { name: "Sauna", slug: "sauna", category: "wellness", icon: "🧖" },
    { name: "Baño turco", slug: "bano-turco", category: "wellness", icon: "♨️" },
    { name: "Jacuzzi", slug: "jacuzzi", category: "wellness", icon: "🛁" },
    // Classes
    { name: "Clases dirigidas", slug: "clases-dirigidas", category: "classes", icon: "👯" },
    { name: "Spinning", slug: "spinning", category: "classes", icon: "🚴" },
    { name: "Yoga", slug: "yoga", category: "classes", icon: "🧘" },
    { name: "Pilates", slug: "pilates", category: "classes", icon: "🤸" },
    { name: "CrossFit", slug: "crossfit", category: "classes", icon: "💪" },
    { name: "Boxeo", slug: "boxeo", category: "classes", icon: "🥊" },
    { name: "Zumba", slug: "zumba", category: "classes", icon: "💃" },
    { name: "Body Pump", slug: "body-pump", category: "classes", icon: "🏋️‍♀️" },
    // Services
    { name: "Parking", slug: "parking", category: "services", icon: "🅿️" },
    { name: "Guardería", slug: "guarderia", category: "services", icon: "👶" },
    { name: "Cafetería", slug: "cafeteria", category: "services", icon: "☕" },
    { name: "Toallas incluidas", slug: "toallas", category: "services", icon: "🧺" },
    { name: "Taquillas", slug: "taquillas", category: "services", icon: "🔐" },
    { name: "WiFi gratis", slug: "wifi", category: "services", icon: "📶" },
    { name: "App móvil", slug: "app", category: "services", icon: "📱" },
    // Access
    { name: "Abierto 24h", slug: "abierto-24h", category: "access", icon: "🕐" },
    { name: "Acceso ilimitado", slug: "acceso-ilimitado", category: "access", icon: "♾️" },
  ];

  for (const facility of facilitiesData) {
    await db
      .insert(facilities)
      .values(facility)
      .onConflictDoNothing()
      .execute();
  }
  console.log(`  ✓ ${facilitiesData.length} facilities seeded`);

  // ---- Barcelona Neighborhoods ----
  console.log("→ Seeding Barcelona neighborhoods...");
  const bcnCity = await db
    .select({ id: cities.id })
    .from(cities)
    .where(eq(cities.slug, "barcelona"))
    .limit(1);

  if (bcnCity.length > 0) {
    const bcnId = bcnCity[0]!.id;
    const hoods = [
      "Ciutat Vella", "Eixample", "Sants-Montjuïc", "Les Corts",
      "Sarrià-Sant Gervasi", "Gràcia", "Horta-Guinardó", "Nou Barris",
      "Sant Andreu", "Sant Martí", "Barceloneta", "Poblenou",
      "El Raval", "El Born", "Gòtic", "Sagrada Família",
      "Sants", "Poble-sec", "Vila Olímpica", "Sant Gervasi",
    ];

    for (const name of hoods) {
      await db
        .insert(neighborhoods)
        .values({
          cityId: bcnId,
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        })
        .onConflictDoNothing()
        .execute();
    }
    console.log(`  ✓ ${hoods.length} Barcelona neighborhoods seeded`);
  }

  console.log("\n✅ Seed complete.");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
