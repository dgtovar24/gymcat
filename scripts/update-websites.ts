import { db } from "../src/lib/db";
import { gyms } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const updates = [
  { name: "DiR Tuset", website: "https://www.dir.cat/ca/gimnasos-barcelona/tuset", placeId: "ChIJU3dt95uipBIRV8Fe2iT8TT4" },
  { name: "DiR Gràcia", website: "https://www.dir.cat/ca/gimnasos-barcelona/gracia", placeId: "ChIJD9g5pJeipBIRnBW0v4vQD8o" },
  { name: "DiR Claret", website: "https://www.dir.cat/ca/gimnasos-barcelona/claret", placeId: "ChIJJ0AB4M-ipBIRcFypVBYYj6U" },
  { name: "DiR Castillejos", website: "https://www.dir.cat/ca/gimnasos-barcelona/castillejos", placeId: "ChIJ4S0aFs-ipBIR7ZpC5_dTBsY" },
  { name: "DiR Maragall", website: "https://www.dir.cat/ca/gimnasos-barcelona/maragall", placeId: "ChIJRWZOMdSipBIRV-usKJuBlV8" },
  { name: "DiR Hispà", website: "https://www.dir.cat/ca/gimnasos-barcelona/hispano", placeId: "ChIJ6wObqlC9pBIRFyeA-zhS4MY" },
  { name: "BDiR Alcúdia", website: "https://www.dir.cat/ca/gimnasos-barcelona/bdir-alcudia", placeId: "ChIJT9F8k2O8pBIRZf5_gK_3b5Q" },
  { name: "Synergym Barcelona Maragall", website: "https://www.synergym.es/gimnasios/barcelona-maragall/", placeId: "ChIJG9TLn7q9pBIRSYScbm3869g" },
  { name: "Synergym Barcelona Fabra i Puig", website: "https://www.synergym.es/gimnasios/barcelona-fabra-i-puig/", placeId: "ChIJ6Y4CEe69pBIRtT-VTUCQIQM" },
  { name: "Synergym Barcelona El Clot", website: "https://www.synergym.es/gimnasios/barcelona-el-clot/", placeId: "ChIJswaD27ijpBIRK0xX2hC8wrY" },
  { name: "Synergym Barcelona Arenas", website: "https://www.synergym.es/gimnasios/barcelona-arenas/", placeId: "ChIJDwChfMujpBIRLwxQ13Y-1Uw" },
  { name: "Anytime Fitness Badalona Gorg", website: "https://www.anytimefitness.es/gimnasio/sp-0095/el-gorg-badalona-catalunya-08912/", placeId: "ChIJYSwl3rm7pBIRXOJa9qL0y9E" },
  { name: "Anytime Fitness Rocafort", website: "https://www.anytimefitness.es/gimnasio/sp-0006/rocafort-barcelona-catalunya-08015/", placeId: "ChIJQ8sRz3yipBIRi0uJKS8CdwU" },
  { name: "Anytime Fitness Pedralbes", website: "https://www.anytimefitness.es/gimnasio/sp-0002/pedralbes-barcelona-catalunya-08028/", placeId: "ChIJDRKM6WaYpBIRw7cLScITqgw" },
  { name: "Anytime Fitness Poblenou", website: "https://www.anytimefitness.es/gimnasio/sp-0003/poblenou-barcelona-catalunya-08005/", placeId: "ChIJBwagwD2jpBIROaxfraVAaCU" },
  { name: "VivaGym Meridiana", website: "https://www.vivagym.es/gimnasios/barcelona/meridiana", placeId: "ChIJzbZgEta8pBIRDj6BgBCzyCc" },
  { name: "VivaGym Entença", website: "https://www.vivagym.com/es-es/gimnasios/barcelona/capital/entenca/", placeId: "ChIJm0a9ZICipBIR7ZTc9Z5nhRs" },
  { name: "VivaGym Glòries", website: "https://www.vivagym.com/es-es/gimnasios/barcelona/capital/glories/", placeId: "ChIJibCseCSjpBIR2k4GMKo7zug" },
  { name: "Basic-Fit Barcelona Clot", website: "https://www.basic-fit.com/es-es/clubs/basic-fit-barcelona", placeId: "ChIJi3cbmS6jpBIRdxCttLUnGA8" },
  { name: "Fitness Park Casanova", website: "https://www.fitnesspark.es/club/barcelona-casanova/", placeId: "ChIJ7R4q5M-jpBIRmp-8bSW0s6A" },
  { name: "CEM Asme", website: "https://www.asme.es/", placeId: "ChIJXwzH3KijpBIR6J3_A5n4vJc" },
  { name: "Entrena-T 24h Sant Andreu", website: "https://www.entrena-t24h.com/sant-andreu/", placeId: "ChIJnz_jxsC9pBIRp2OeYjfADQE" },
  { name: "Workshop Fitness Club Poblenou", website: "https://workshop.es/", placeId: "ChIJ3_KhnE-jpBIRqfHcUHCYnOc" },
  { name: "énergie Fitness Poblenou", website: "https://energiefitness.es/gym/poblenou-barcelona", placeId: "ChIJP6n-swijpBIR0K71Zr7IIzI" },
  { name: "Cosmofit", website: "http://www.cosmofit.es/", placeId: "ChIJmcQFU8mjpBIRlChkxov5sC0" },
  { name: "Eurofitness Can Dragó", website: "https://eurofitness.com/candrago/", placeId: "ChIJ95A_zCC9pBIRl-au-3h-Lsg" },
];

async function main() {
  for (const g of updates) {
    await db.update(gyms).set({ website: g.website, updatedAt: new Date() })
      .where(eq(gyms.googlePlaceId, g.placeId));
    console.log(`✅ ${g.name}: ${g.website}`);
  }
  console.log(`\nDone: ${updates.length} gyms updated`);
}
main().catch(console.error);
