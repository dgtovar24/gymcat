import { db } from "../src/lib/db";
import { gyms, chains } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const GMAPS_KEY = "AIzaSyC10drvzhIUxn0bkqg3YQGNhQ0y8Y-EJY4";

const gymsToImport = [
  { chain: "DiR", name: "DiR Tuset", web: "https://www.dir.cat/ca/gimnasos-barcelona/tuset", placeId: "ChIJU3dt95uipBIRV8Fe2iT8TT4" },
  { chain: "DiR", name: "DiR Gràcia", web: "https://www.dir.cat/ca/gimnasos-barcelona/gracia", placeId: "ChIJD9g5pJeipBIRnBW0v4vQD8o" },
  { chain: "DiR", name: "DiR Claret", web: "https://www.dir.cat/ca/gimnasos-barcelona/claret", placeId: "ChIJJ0AB4M-ipBIRcFypVBYYj6U" },
  { chain: "DiR", name: "DiR Castillejos", web: "https://www.dir.cat/ca/gimnasos-barcelona/castillejos", placeId: "ChIJ4S0aFs-ipBIR7ZpC5_dTBsY" },
  { chain: "DiR", name: "DiR Maragall", web: "https://www.dir.cat/ca/gimnasos-barcelona/maragall", placeId: "ChIJRWZOMdSipBIRV-usKJuBlV8" },
  { chain: "DiR", name: "DiR Hispà", web: "https://www.dir.cat/ca/gimnasos-barcelona/hispano", placeId: "ChIJ6wObqlC9pBIRFyeA-zhS4MYS" },
  { chain: "Synergym", name: "Synergym Barcelona Maragall", web: "https://www.synergym.es/gimnasios/barcelona-maragall/", placeId: "ChIJG9TLn7q9pBIRSYScbm3869g" },
  { chain: "Synergym", name: "Synergym Barcelona Fabra i Puig", web: "https://www.synergym.es/gimnasios/barcelona-fabra-i-puig/", placeId: "ChIJ6Y4CEe69pBIRtT-VTUCQIQM" },
  { chain: "Synergym", name: "Synergym Barcelona El Clot", web: "https://www.synergym.es/gimnasios/barcelona-el-clot/", placeId: "ChIJswaD27ijpBIRK0xX2hC8wrY" },
  { chain: "Synergym", name: "Synergym Barcelona Arenas", web: "https://www.synergym.es/gimnasios/barcelona-arenas/", placeId: "ChIJDwChfMujpBIRLwxQ13Y-1Uw" },
  { chain: "Anytime Fitness", name: "Anytime Fitness Badalona Gorg", web: "https://www.anytimefitness.es/gimnasio/sp-0095/el-gorg-badalona-catalu%C3%B1a-08912/", placeId: "ChIJYSwl3rm7pBIRXOJa9qL0y9E" },
  { chain: "Anytime Fitness", name: "Anytime Fitness Rocafort", web: "https://www.anytimefitness.es/gimnasio/sp-0006/rocafort-barcelona-catalu%C3%B1a-08015/", placeId: "ChIJQ8sRz3yipBIRi0uJKS8CdwU" },
  { chain: "Anytime Fitness", name: "Anytime Fitness Pedralbes", web: "https://www.anytimefitness.es/gimnasio/sp-0002/pedralbes-barcelona-catalu%C3%B1a-08028/", placeId: "ChIJDRKM6WaYpBIRw7cLScITqgw" },
  { chain: "Anytime Fitness", name: "Anytime Fitness Poblenou", web: "https://www.anytimefitness.es/gimnasio/sp-0003/poblenou-barcelona-catalu%C3%B1a-08005/", placeId: "ChIJBwagwD2jpBIROaxfraVAaCU" },
  { chain: "VivaGym", name: "VivaGym Meridiana", web: "https://www.vivagym.es/gimnasios/barcelona/meridiana", placeId: "ChIJzbZgEta8pBIRDj6BgBCzyCc" },
  { chain: "VivaGym", name: "VivaGym Entença", web: "https://www.vivagym.es/gimnasios/barcelona/entenca", placeId: "ChIJm0a9ZICipBIR7ZTc9Z5nhRs" },
];

async function getPlaceDetails(placeId: string) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,website,formatted_phone_number,opening_hours&key=${GMAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.result) {
    const r = data.result;
    return {
      name: r.name,
      address: r.formatted_address || "",
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      phone: r.formatted_phone_number || "",
      is24h: r.opening_hours?.open_now !== undefined ? r.opening_hours?.periods?.some((p: any) => p.open?.hour === 0 && p.close?.hour === 0) : false,
    };
  }
  return null;
}

async function getOrCreateChain(name: string): Promise<number> {
  const allChains = await db.select().from(chains);
  const existing = allChains.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing.id;

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const [result] = await db.insert(chains).values({
    name,
    slug,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: chains.id });
  return result!.id;
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  console.log(`Importando ${gymsToImport.length} gimnasios...\n`);

  for (const g of gymsToImport) {
    console.log(`${g.name}...`);

    const existing = await db.select({ id: gyms.id }).from(gyms).where(eq(gyms.googlePlaceId, g.placeId)).limit(1);
    if (existing.length > 0) {
      console.log(`  Ya existe (id=${existing[0]!.id}), actualizando...`);
      const details = await getPlaceDetails(g.placeId);
      if (details) {
        await db.update(gyms).set({
          name: details.name,
          address: details.address,
          website: g.web,
          lat: String(details.lat),
          lng: String(details.lng),
          phone: details.phone,
          isOpen247: details.is24h,
          updatedAt: new Date(),
        }).where(eq(gyms.id, existing[0]!.id));
        console.log(`  Updated: ${details.name} (${details.lat}, ${details.lng})`);
      }
      await new Promise(r => setTimeout(r, 200));
      continue;
    }

    const details = await getPlaceDetails(g.placeId);
    if (!details) {
      console.log(`  NOT FOUND on Google Maps`);
      continue;
    }

    const chainId = await getOrCreateChain(g.chain);
    const slug = slugify(g.name);

    await db.insert(gyms).values({
      name: details.name,
      slug,
      address: details.address,
      website: g.web,
      googlePlaceId: g.placeId,
      lat: String(details.lat),
      lng: String(details.lng),
      phone: details.phone,
      isOpen247: details.is24h,
      chainId,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`  Created: ${details.name} (${details.lat}, ${details.lng}) | ${details.address}`);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log("\nImport complete");
}

main().catch(console.error);
