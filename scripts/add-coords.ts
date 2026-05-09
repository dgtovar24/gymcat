import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { gyms } from "../src/lib/db/schema";

const coords: Record<string, [number, number]> = {
  "Basic-Fit Barcelona Sants": [41.3751, 2.1345],
  "Basic-Fit Barcelona Glòries": [41.4036, 2.1890],
  "Basic-Fit Barcelona Marina": [41.4040, 2.1743],
  "VivaGym Barcelona Sagrera": [41.4320, 2.1890],
  "VivaGym Barcelona La Maquinista": [41.4400, 2.2000],
  "VivaGym Barcelona Badalona": [41.4480, 2.2470],
  "DIR Diagonal": [41.3930, 2.1390],
  "DIR Gràcia": [41.4010, 2.1520],
  "DIR Sants": [41.3750, 2.1310],
  "McFit Barcelona Gran Via": [41.3830, 2.1570],
  "McFit Barcelona Sant Andreu": [41.4350, 2.1850],
  "AltaFit Barcelona Les Corts": [41.3880, 2.1320],
  "AltaFit Barcelona Horta": [41.4250, 2.1650],
  "Eurofitness Can Dragó": [41.4160, 2.2000],
  "Holmes Place Barcelona Urquinaona": [41.3900, 2.1730],
  "Metropolitan Barcelona": [41.3870, 2.1400],
  "Snap Fitness Barcelona Eixample": [41.3950, 2.1600],
};

async function main() {
  const all = await db.select({ id: gyms.id, name: gyms.name }).from(gyms);
  for (const g of all) {
    const coord = coords[g.name];
    if (coord) {
      await db.update(gyms).set({
        coordinates: { lat: coord[0], lng: coord[1] },
        lat: String(coord[0]),
        lng: String(coord[1]),
        updatedAt: new Date(),
      }).where(eq(gyms.id, g.id));
      console.log(`✅ ${g.name} → [${coord[0]}, ${coord[1]}]`);
    }
  }
  console.log("Done");
}
main();
