import { db } from "../src/lib/db";
import { gyms, gymImages } from "../src/lib/db/schema";

async function main() {
  const all = await db.select({ id: gyms.id, name: gyms.name, imageUrl: gyms.imageUrl }).from(gyms);
  for (const g of all) {
    if (g.imageUrl) {
      await db.insert(gymImages).values({ gymId: g.id, imageUrl: g.imageUrl, sortOrder: 0 });
      console.log(`✅ ${g.name} → gym_images`);
    }
  }
  console.log(`Done — migrated ${all.length} gym images`);
}
main();
