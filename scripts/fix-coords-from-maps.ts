import { db } from "../src/lib/db";
import { gyms } from "../src/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";

const GMAPS_KEY = "AIzaSyC10drvzhIUxn0bkqg3YQGNhQ0y8Y-EJY4";

async function main() {
  const all = await db.select({
    id: gyms.id, name: gyms.name, googlePlaceId: gyms.googlePlaceId,
    lat: gyms.lat, lng: gyms.lng, address: gyms.address,
  }).from(gyms).where(isNotNull(gyms.googlePlaceId));

  console.log(`${all.length} gyms with Place ID\n`);

  let updated = 0;
  for (const g of all) {
    if (!g.googlePlaceId) continue;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${g.googlePlaceId}&fields=geometry,formatted_address,name&key=${GMAPS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const result = data.result;

    if (result?.geometry?.location) {
      const { lat, lng } = result.geometry.location;
      const oldLat = Number(g.lat);
      const oldLng = Number(g.lng);
      const dist = Math.sqrt((oldLat - lat) ** 2 + (oldLng - lng) ** 2) * 111000;

      if (dist > 10) {
        console.log(`\n${g.id}. ${g.name}`);
        console.log(`   Old: ${oldLat}, ${oldLng}`);
        console.log(`   New: ${lat}, ${lng} (${dist.toFixed(0)}m diff)`);
        console.log(`   Address: ${result.formatted_address || g.address}`);

        await db.update(gyms).set({
          lat: String(lat),
          lng: String(lng),
          address: result.formatted_address || g.address,
          updatedAt: new Date(),
        }).where(eq(gyms.id, g.id));
        updated++;
      }
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone: ${updated} gyms corrected`);
}

main().catch(console.error);
