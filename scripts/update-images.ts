import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { gyms } from "../src/lib/db/schema";

async function main() {
  const all = await db.select({ id: gyms.id, name: gyms.name }).from(gyms);
  for (const g of all) {
    const imageUrl = `https://picsum.photos/seed/gym${g.id}/640/360`;
    await db.update(gyms).set({ imageUrl, updatedAt: new Date() }).where(eq(gyms.id, g.id));
    console.log(`✅ ${g.name} → ${imageUrl}`);
  }
  console.log(`Done — ${all.length} gyms updated`);
}
main();
