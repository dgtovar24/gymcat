import { db } from "../src/lib/db";
import { gymImages } from "../src/lib/db/schema";

async function main() {
  await db.delete(gymImages);
  console.log(`Deleted all gymImages rows. Now using gyms.imageUrl only.`);
}
main().catch(console.error);
