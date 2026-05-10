import { db } from "../src/lib/db";
import { gyms, chains } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const GMAPS_KEY = "AIzaSyC10drvzhIUxn0bkqg3YQGNhQ0y8Y-EJY4";

async function findPlace(name: string, address: string): Promise<{ place_id: string; name: string; address: string; lat: number; lng: number } | null> {
  const query = `${name} ${address || "Barcelona"} gimnasio`;
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&key=${GMAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.candidates?.length > 0) {
    const c = data.candidates[0];
    return {
      place_id: c.place_id,
      name: c.name,
      address: c.formatted_address || "",
      lat: c.geometry.location.lat,
      lng: c.geometry.location.lng,
    };
  }
  return null;
}

async function checkWebsite(url: string): Promise<string> {
  if (!url) return "sin web";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0" } });
    return res.ok ? `OK (${res.status})` : `Error ${res.status}`;
  } catch {
    return "no accesible";
  }
}

async function main() {
  const allChains = await db.select().from(chains);
  const chainMap = new Map(allChains.map(c => [c.id, c.name]));

  const all = await db.select().from(gyms);

  console.log(`Verificando ${all.length} gimnasios...\n`);

  for (const g of all) {
    console.log(`=== ${g.id}. ${g.name} ===`);
    console.log(`   DB: ${Number(g.lat)}, ${Number(g.lng)} | Chain: ${chainMap.get(g.chainId || 0) || "sin cadena"}`);
    console.log(`   Dirección: ${g.address}`);
    console.log(`   Web: ${g.website || "sin web"} → ${await checkWebsite(g.website || "")}`);

    const place = await findPlace(g.name, g.address || "");
    if (place) {
      const dist = Math.sqrt(
        Math.pow(Number(g.lat) - place.lat, 2) + Math.pow(Number(g.lng) - place.lng, 2)
      ) * 111000;
      console.log(`   Maps: ${place.name} | ${place.lat}, ${place.lng} | ${dist.toFixed(0)}m de diferencia`);
      console.log(`   Dirección Maps: ${place.address}`);

      // Auto-update if name significantly different or coords off by >500m
      if (place.name !== g.name || dist > 500) {
        console.log(`   ⚠️ DESACTUALIZADO — actualizando...`);
        await db.update(gyms).set({
          name: place.name,
          lat: String(place.lat),
          lng: String(place.lng),
          googlePlaceId: place.place_id,
          updatedAt: new Date(),
        }).where(eq(gyms.id, g.id));
        console.log(`   ✅ Actualizado: ${place.name} (${place.lat}, ${place.lng})`);
      } else {
        console.log(`   ✅ Correcto`);
        await db.update(gyms).set({
          googlePlaceId: place.place_id,
          updatedAt: new Date(),
        }).where(eq(gyms.id, g.id));
      }
    } else {
      console.log(`   ❌ NO ENCONTRADO en Google Maps`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n✅ Verificación completa");
}

main().catch(console.error);
