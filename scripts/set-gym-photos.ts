import { db } from "../src/lib/db";
import { gyms } from "../src/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";

const GMAPS_KEY = "AIzaSyC10drvzhIUxn0bkqg3YQGNhQ0y8Y-EJY4";

async function getPhotoUrl(placeId: string): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GMAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const photos = data.result?.photos;
  if (photos?.length > 0) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=640&photoreference=${photos[0].photo_reference}&key=${GMAPS_KEY}`;
  }
  return null;
}

async function main() {
  const all = await db.select({
    id: gyms.id,
    name: gyms.name,
    googlePlaceId: gyms.googlePlaceId,
    imageUrl: gyms.imageUrl,
  }).from(gyms).where(isNotNull(gyms.googlePlaceId));

  console.log(`${all.length} gyms with Place ID\n`);

  let updated = 0;
  for (const g of all) {
    if (!g.googlePlaceId) continue;
    console.log(`${g.name}...`);

    const photoUrl = await getPhotoUrl(g.googlePlaceId);
    if (photoUrl) {
      await db.update(gyms).set({
        imageUrl: photoUrl,
        updatedAt: new Date(),
      }).where(eq(gyms.id, g.id));
      console.log(`  ✅ Photo set`);
      updated++;
    } else {
      console.log(`  ⚠️ No photo found`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone: ${updated} gyms updated`);
}

main().catch(console.error);
