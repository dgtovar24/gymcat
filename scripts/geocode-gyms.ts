import { db } from "../src/lib/db";
import { gyms } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const API_KEY = "AIzaSyC10drvzhIUxn0bkqg3YQGNhQ0y8Y-EJY4";

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results?.length > 0) {
    return data.results[0].geometry.location;
  }
  return null;
}

async function main() {
  const all = await db.select({
    id: gyms.id,
    name: gyms.name,
    address: gyms.address,
    lat: gyms.lat,
    lng: gyms.lng,
  }).from(gyms);

  console.log(`${all.length} gyms found. Geocoding...`);

  for (const g of all) {
    const searchAddr = `${g.name}, ${g.address || "Barcelona"}`;
    console.log(`\n${g.id}. ${g.name} (${searchAddr})`);
    console.log(`   Current: ${Number(g.lat)}, ${Number(g.lng)}`);

    const coords = await geocode(searchAddr);
    if (coords) {
      console.log(`   Google:  ${coords.lat}, ${coords.lng}`);
      await db.update(gyms)
        .set({
          lat: String(coords.lat),
          lng: String(coords.lng),
          updatedAt: new Date(),
        })
        .where(eq(gyms.id, g.id));
      console.log(`   Updated!`);
    } else {
      console.log(`   NOT FOUND on Google Maps`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log("\nDone!");
}

main().catch(console.error);
