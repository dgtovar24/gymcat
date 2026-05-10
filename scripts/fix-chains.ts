import { db } from "../src/lib/db";
import { gyms, chains } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const all = await db.select({
    id: gyms.id, name: gyms.name, chainId: gyms.chainId,
  }).from(gyms);

  const allChains = await db.select().from(chains);
  const chainMap = new Map(allChains.map(c => [c.slug, c.id]));

  const nameToChainSlug: Record<string, string> = {
    "vivagym": "vivagym",
    "basic-fit": "basic-fit",
    "dir": "dir",
    "diR": "dir",
    "anytime": "anytime fitness",
    "metropolitan": "metropolitan",
    "fitness park": "fitness park",
    "health performance": "mes salut",
    "mes salut": "mes salut",
    "we/on": "we/on",
    "eurofitness": "eurofitness",
    "piscina can": "eurofitness",
  };

  for (const g of all) {
    const n = g.name.toLowerCase();
    let newChainId = g.chainId;

    for (const [keyword, slug] of Object.entries(nameToChainSlug)) {
      if (n.includes(keyword)) {
        newChainId = chainMap.get(slug) || g.chainId;
        break;
      }
    }

    if (newChainId !== g.chainId) {
      await db.update(gyms).set({ chainId: newChainId, updatedAt: new Date() })
        .where(eq(gyms.id, g.id));
      console.log(`${g.id}. ${g.name}: chain ${g.chainId} → ${newChainId}`);
    }
  }
  console.log("Done");
}

main().catch(console.error);
