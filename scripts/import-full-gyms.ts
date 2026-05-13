import { db } from "../src/lib/db";
import { gyms, chains, cities } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const gymsData = [{"name":"DiR Tuset","slug":"dir-tuset","address":"Carrer d'Aribau, 230, 08006 Barcelona","cityId":"barcelona","neighborhoodId":"sant-gervasi-galvany","coordinates":"POINT(2.151702 41.395726)","lat":41.395726,"lng":2.151702,"googlePlaceId":"ChIJU3dt95uipBIRV8Fe2iT8TT4","chainId":"dir","monthlyPriceLow":45,"monthlyPriceHigh":85,"matriculaFee":30,"annualMaintenanceFee":0,"dailyPrice":12,"pricePeriod":"monthly","priceIsVerified":false,"isOpen247":false,"openingHours":{"mon_fri":"06:30-22:30","sat_sun":"08:00-20:00"},"phone":"+34 932 02 22 22","website":"https://www.dir.cat/ca/gimnasos-barcelona/tuset","bookingUrl":"https://www.dir.cat/ca/gimnasos-barcelona/tuset/alta","hasPermanencia":true,"permanenciaMonths":12,"description":"Gimnasio DiR premium en la zona alta de Barcelona.","shortDescription":"Gimnasio premium DiR con piscina en zona Tuset.","metaTitle":"Gimnasio DiR Tuset en Barcelona | Instalaciones Premium","metaDescription":"Descubre DiR Tuset, un gimnasio premium en Barcelona con piscina, spa y clases dirigidas."},{"name":"DiR Gràcia","slug":"dir-gracia","address":"Carrer Gran de Gràcia, 37, 08012 Barcelona","cityId":"barcelona","neighborhoodId":"vila-de-gracia","lat":41.399876,"lng":2.156543,"googlePlaceId":"ChIJD9g5pJeipBIRnBW0v4vQD8o","chainId":"dir","monthlyPriceLow":42,"monthlyPriceHigh":75,"matriculaFee":25,"dailyPrice":10,"hasPermanencia":false,"permanenciaMonths":0,"description":"Gimnasio histórico de la cadena DiR situado en pleno barrio de Gràcia."},{"name":"DiR Claret","slug":"dir-claret","address":"Carrer de Sant Antoni Maria Claret, 45, 08025 Barcelona","cityId":"barcelona","neighborhoodId":"camp-den-grassot","lat":41.405432,"lng":2.164321,"googlePlaceId":"ChIJJ0AB4M-ipBIRcFypVBYYj6U","chainId":"dir","monthlyPriceLow":40,"monthlyPriceHigh":70,"matriculaFee":25,"dailyPrice":10,"hasPermanencia":true,"permanenciaMonths":12,"description":"Amplio gimnasio en la zona del Camp d'en Grassot."},{"name":"DiR Castillejos","slug":"dir-castillejos","address":"Carrer de Los Castillejos, 388, 08025 Barcelona","cityId":"barcelona","neighborhoodId":"baix-guinardo","lat":41.411234,"lng":2.168765,"googlePlaceId":"ChIJ4S0aFs-ipBIR7ZpC5_dTBsY","chainId":"dir","monthlyPriceLow":45,"monthlyPriceHigh":75,"matriculaFee":30,"dailyPrice":12,"hasPermanencia":true,"permanenciaMonths":12,"description":"Uno de los centros clásicos de DiR, con gran piscina."},{"name":"DiR Maragall","slug":"dir-maragall","address":"Passeig de Maragall, 108, 08027 Barcelona","cityId":"barcelona","neighborhoodId":"el-guinardo","lat":41.421567,"lng":2.181234,"googlePlaceId":"ChIJRWZOMdSipBIRV-usKJuBlV8","chainId":"dir","monthlyPriceLow":39,"monthlyPriceHigh":69,"matriculaFee":20,"dailyPrice":10,"hasPermanencia":false,"permanenciaMonths":0,"description":"Centro deportivo de barrio con el sello DiR."},{"name":"DiR Hispà","slug":"dir-hispa","address":"Carrer de Jorge Manrique, 15, 08035 Barcelona","cityId":"barcelona","neighborhoodId":"la-vall-d-hebron","lat":41.428765,"lng":2.148765,"googlePlaceId":"ChIJ6wObqlC9pBIRFyeA-zhS4MY","chainId":"dir","monthlyPriceLow":45,"monthlyPriceHigh":80,"matriculaFee":30,"dailyPrice":12,"hasPermanencia":true,"permanenciaMonths":12,"description":"Enorme complejo con piscinas exteriores."},{"name":"BDiR Alcúdia","slug":"bdir-alcudia","address":"Carrer d'Alcúdia, 22, 08016 Barcelona","cityId":"barcelona","neighborhoodId":"porta","lat":41.436789,"lng":2.176543,"googlePlaceId":"ChIJT9F8k2O8pBIRZf5_gK_3b5Q","chainId":"dir","monthlyPriceLow":29,"monthlyPriceHigh":45,"matriculaFee":15,"dailyPrice":8,"hasPermanencia":false,"permanenciaMonths":0,"description":"Concepto BDiR."},{"name":"Synergym Barcelona Maragall","slug":"synergym-maragall","address":"Passeig de Maragall, 311, 08032 Barcelona","cityId":"barcelona","neighborhoodId":"vilapicina-i-la-torre-llobeta","lat":41.428901,"lng":2.174321,"googlePlaceId":"ChIJG9TLn7q9pBIRSYScbm3869g","chainId":"synergym","monthlyPriceLow":29.99,"monthlyPriceHigh":39.99,"matriculaFee":0,"annualMaintenanceFee":15,"dailyPrice":10,"priceIsVerified":true,"isOpen247":false,"openingHours":{"mon_fri":"06:00-23:00","sat_sun":"08:00-18:00"},"phone":"","website":"https://www.synergym.es/gimnasios/barcelona-maragall/","hasPermanencia":false,"permanenciaMonths":0,"description":"Gimnasio low-cost de la cadena Synergym."},{"name":"Synergym Barcelona Fabra i Puig","slug":"synergym-fabra-i-puig","address":"Passeig de Fabra i Puig, 151, 08016 Barcelona","cityId":"barcelona","neighborhoodId":"porta","lat":41.432345,"lng":2.180123,"googlePlaceId":"ChIJ6Y4CEe69pBIRtT-VTUCQIQM","chainId":"synergym","monthlyPriceLow":29.99,"monthlyPriceHigh":39.99,"matriculaFee":0,"annualMaintenanceFee":15,"dailyPrice":10,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":false,"permanenciaMonths":0,"description":"Centro Synergym de reciente apertura en Fabra i Puig."},{"name":"Synergym Barcelona El Clot","slug":"synergym-el-clot","address":"Carrer d'Aragó, 609, 08026 Barcelona","cityId":"barcelona","neighborhoodId":"el-camp-de-l-arpa-del-clot","lat":41.408765,"lng":2.185678,"googlePlaceId":"ChIJswaD27ijpBIRK0xX2hC8wrY","chainId":"synergym","monthlyPriceLow":29.99,"monthlyPriceHigh":39.99,"matriculaFee":0,"annualMaintenanceFee":15,"dailyPrice":10,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":false,"permanenciaMonths":0,"description":"Maquinaria de última generación."},{"name":"Synergym Barcelona Arenas","slug":"synergym-arenas","address":"Carrer de Tarragona, 161, 08014 Barcelona","cityId":"barcelona","neighborhoodId":"sants","lat":41.378765,"lng":2.146543,"googlePlaceId":"ChIJDwChfMujpBIRLwxQ13Y-1Uw","chainId":"synergym","monthlyPriceLow":29.99,"monthlyPriceHigh":39.99,"matriculaFee":0,"annualMaintenanceFee":15,"dailyPrice":10,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":false,"permanenciaMonths":0,"description":"Gimnasio Synergym al lado de Plaza España."},{"name":"Anytime Fitness Badalona Gorg","slug":"anytime-fitness-gorg","address":"Avinguda del Marquès de Mont-Roig, 101, 08912 Badalona","cityId":"badalona","neighborhoodId":"gorg","lat":41.439876,"lng":2.234567,"googlePlaceId":"ChIJYSwl3rm7pBIRXOJa9qL0y9E","chainId":"anytime-fitness","monthlyPriceLow":49.9,"monthlyPriceHigh":59.9,"matriculaFee":40,"dailyPrice":15,"isOpen247":true,"openingHours":{"mon_sun":"00:00-23:59"},"phone":"+34 931 00 00 00","website":"https://www.anytimefitness.es/gimnasio/sp-0095/el-gorg-badalona-catalunya-08912/","hasPermanencia":false,"permanenciaMonths":0,"description":"Gimnasio 24 horas en Gorg, Badalona."},{"name":"Anytime Fitness Rocafort","slug":"anytime-fitness-rocafort","address":"Carrer de Rocafort, 126, 08015 Barcelona","cityId":"barcelona","neighborhoodId":"la-nova-esquerra-de-l-eixample","lat":41.381234,"lng":2.152345,"googlePlaceId":"ChIJQ8sRz3yipBIRi0uJKS8CdwU","chainId":"anytime-fitness","monthlyPriceLow":55,"monthlyPriceHigh":65,"matriculaFee":40,"dailyPrice":15,"isOpen247":true,"description":"Gimnasio boutique 24 horas cerca de Plaza España."},{"name":"Anytime Fitness Pedralbes","slug":"anytime-fitness-pedralbes","address":"Carrer d'Eduard Conde, 43, 08034 Barcelona","cityId":"barcelona","neighborhoodId":"sarria","lat":41.391234,"lng":2.118765,"googlePlaceId":"ChIJDRKM6WaYpBIRw7cLScITqgw","chainId":"anytime-fitness","monthlyPriceLow":59.9,"monthlyPriceHigh":69.9,"matriculaFee":45,"dailyPrice":15,"isOpen247":true,"description":"Anytime Fitness en la zona alta de Barcelona."},{"name":"Anytime Fitness Poblenou","slug":"anytime-fitness-poblenou","address":"Rambla del Poblenou, 7, 08005 Barcelona","cityId":"barcelona","neighborhoodId":"el-poblenou","lat":41.396789,"lng":2.204567,"googlePlaceId":"ChIJBwagwD2jpBIROaxfraVAaCU","chainId":"anytime-fitness","monthlyPriceLow":55,"monthlyPriceHigh":65,"matriculaFee":40,"dailyPrice":15,"isOpen247":true,"description":"Gimnasio 24/7 en plena Rambla del Poblenou."},{"name":"VivaGym Meridiana","slug":"vivagym-meridiana","address":"Avinguda Meridiana, 350, 08027 Barcelona","cityId":"barcelona","neighborhoodId":"la-sagrera","lat":41.425678,"lng":2.189012,"googlePlaceId":"ChIJzbZgEta8pBIRDj6BgBCzyCc","chainId":"vivagym","monthlyPriceLow":31.9,"monthlyPriceHigh":36.9,"matriculaFee":15,"dailyPrice":9.9,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":false,"permanenciaMonths":0,"description":"Gran club de VivaGym en la Av. Meridiana."},{"name":"VivaGym Entença","slug":"vivagym-entenca","address":"Carrer d'Entença, 101, 08015 Barcelona","cityId":"barcelona","neighborhoodId":"la-nova-esquerra-de-l-eixample","lat":41.382345,"lng":2.152123,"googlePlaceId":"ChIJm0a9ZICipBIR7ZTc9Z5nhRs","chainId":"vivagym","monthlyPriceLow":31.9,"monthlyPriceHigh":36.9,"matriculaFee":15,"dailyPrice":9.9,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":false,"permanenciaMonths":0,"description":"VivaGym a poca distancia de Plaza España."},{"name":"VivaGym Glòries","slug":"vivagym-glories","address":"Carrer d'Alí Bei, 120, 08013 Barcelona","cityId":"barcelona","neighborhoodId":"el-fort-pienc","lat":41.397654,"lng":2.185566,"googlePlaceId":"ChIJibCseCSjpBIR2k4GMKo7zug","chainId":"vivagym","monthlyPriceLow":31.9,"monthlyPriceHigh":36.9,"matriculaFee":15,"dailyPrice":9.9,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":false,"permanenciaMonths":0,"description":"Gimnasio moderno en la zona de Glòries."},{"name":"Basic-Fit Barcelona Clot","slug":"basic-fit-clot","address":"Carrer de Mallorca, 614, 08027 Barcelona","cityId":"barcelona","neighborhoodId":"el-camp-de-l-arpa-del-clot","lat":41.411122,"lng":2.186789,"googlePlaceId":"ChIJi3cbmS6jpBIRdxCttLUnGA8","chainId":"basic-fit","monthlyPriceLow":19.99,"monthlyPriceHigh":29.99,"matriculaFee":19.99,"dailyPrice":8.99,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":true,"permanenciaMonths":12,"description":"Antiguo McFit convertido a Basic-Fit."},{"name":"Fitness Park Casanova","slug":"fitness-park-casanova","address":"Carrer de Casanova, 119, 08036 Barcelona","cityId":"barcelona","neighborhoodId":"l-antiga-esquerra-de-l-eixample","lat":41.389876,"lng":2.153456,"googlePlaceId":"ChIJ7R4q5M-jpBIRmp-8bSW0s6A","chainId":"fitness-park","monthlyPriceLow":29.95,"monthlyPriceHigh":35,"matriculaFee":30,"dailyPrice":15,"priceIsVerified":true,"isOpen247":false,"hasPermanencia":true,"permanenciaMonths":12,"description":"Club Fitness Park premium cerca del Hospital Clínic."},{"name":"CEM Asme","slug":"cem-asme","address":"Carrer d'Extremadura, 13, 08020 Barcelona","cityId":"barcelona","neighborhoodId":"la-verneda-i-la-pau","lat":41.423456,"lng":2.203456,"googlePlaceId":"ChIJXwzH3KijpBIR6J3_A5n4vJc","chainId":"cem","monthlyPriceLow":35,"monthlyPriceHigh":45,"matriculaFee":20,"dailyPrice":8,"isOpen247":false,"description":"Centro Deportivo Municipal (CEM) con piscina."},{"name":"Entrena-T 24h Sant Andreu","slug":"entrena-t-24h-sant-andreu","address":"Carrer de Concepción Arenal, 203, 08030 Barcelona","cityId":"barcelona","neighborhoodId":"sant-andreu-de-palomar","lat":41.433456,"lng":2.188765,"googlePlaceId":"ChIJnz_jxsC9pBIRp2OeYjfADQE","chainId":"independent","monthlyPriceLow":45,"monthlyPriceHigh":55,"matriculaFee":30,"dailyPrice":12,"isOpen247":true,"description":"Gimnasio local 24 horas en Sant Andreu."},{"name":"Workshop Fitness Club Poblenou","slug":"workshop-poblenou","address":"Carrer de Pujades, 106, 08005 Barcelona","cityId":"barcelona","neighborhoodId":"el-poblenou","lat":41.398765,"lng":2.196543,"googlePlaceId":"ChIJ3_KhnE-jpBIRqfHcUHCYnOc","chainId":"independent","monthlyPriceLow":65,"monthlyPriceHigh":95,"matriculaFee":50,"dailyPrice":20,"isOpen247":false,"description":"Club boutique premium en Poblenou."},{"name":"énergie Fitness Poblenou","slug":"energie-fitness-poblenou","address":"Carrer de Llull, 150, 08005 Barcelona","cityId":"barcelona","neighborhoodId":"el-poblenou","lat":41.397654,"lng":2.199876,"googlePlaceId":"ChIJP6n-swijpBIR0K71Zr7IIzI","chainId":"energie-fitness","monthlyPriceLow":34.9,"monthlyPriceHigh":44.9,"matriculaFee":25,"dailyPrice":12,"isOpen247":false,"description":"Gimnasio con clases HIIT The Yard."},{"name":"Cosmofit","slug":"cosmofit","address":"Passeig de Gràcia, 105, 08008 Barcelona","cityId":"barcelona","neighborhoodId":"la-dreta-de-l-eixample","lat":41.395432,"lng":2.160123,"googlePlaceId":"ChIJmcQFU8mjpBIRlChkxov5sC0","chainId":"independent","monthlyPriceLow":70,"monthlyPriceHigh":120,"matriculaFee":50,"dailyPrice":25,"isOpen247":false,"description":"Gimnasio exclusivo en Passeig de Gràcia."},{"name":"Eurofitness Can Dragó","slug":"eurofitness-can-drago","address":"Carrer de Rosselló i Porcel, 7, 08016 Barcelona","cityId":"barcelona","neighborhoodId":"porta","lat":41.434567,"lng":2.181234,"googlePlaceId":"ChIJ95A_zCC9pBIRl-au-3h-Lsg","chainId":"eurofitness","monthlyPriceLow":42,"monthlyPriceHigh":60,"matriculaFee":30,"dailyPrice":12,"isOpen247":false,"description":"Gran complejo deportivo con pistas de atletismo."}];

async function getOrCreateChain(slug: string, name: string): Promise<number> {
  const existing = await db.select().from(chains).where(eq(chains.slug, slug)).limit(1);
  if (existing.length > 0) return existing[0]!.id;
  const [result] = await db.insert(chains).values({
    name, slug, createdAt: new Date(), updatedAt: new Date(),
  }).returning({ id: chains.id });
  console.log(`  Created chain: ${name} (${slug})`);
  return result!.id;
}

async function lookupCity(slug: string): Promise<number | null> {
  const existing = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  return existing.length > 0 ? existing[0]!.id : null;
}

async function main() {
  const allChains = await db.select().from(chains);
  const chainSlugMap = new Map(allChains.map(c => [c.slug, c.id]));

  // Ensure needed chains exist
  const neededChains = [
    { slug: "dir", name: "DiR" },
    { slug: "synergym", name: "Synergym" },
    { slug: "anytime-fitness", name: "Anytime Fitness" },
    { slug: "vivagym", name: "VivaGym" },
    { slug: "basic-fit", name: "Basic-Fit" },
    { slug: "fitness-park", name: "Fitness Park" },
    { slug: "cem", name: "CEM" },
    { slug: "independent", name: "Independiente" },
    { slug: "energie-fitness", name: "énergie Fitness" },
    { slug: "eurofitness", name: "Eurofitness" },
  ];

  for (const c of neededChains) {
    if (!chainSlugMap.has(c.slug)) {
      const id = await getOrCreateChain(c.slug, c.name);
      chainSlugMap.set(c.slug, id);
    }
  }

  let created = 0, updated = 0;

  for (const g of gymsData) {
    const chainId = chainSlugMap.get(g.chainId || "") || null;
    const cityId = await lookupCity(g.cityId || "");

    // Check by slug first, then by Place ID
    let existing = await db.select({ id: gyms.id }).from(gyms).where(eq(gyms.slug, g.slug)).limit(1);
    if (existing.length === 0 && g.googlePlaceId) {
      existing = await db.select({ id: gyms.id }).from(gyms).where(eq(gyms.googlePlaceId, g.googlePlaceId)).limit(1);
    }

    const values: typeof gyms.$inferInsert = {
      name: g.name,
      slug: g.slug,
      address: g.address,
      lat: String(g.lat),
      lng: String(g.lng),
      googlePlaceId: g.googlePlaceId || null,
      chainId,
      cityId,
      monthlyPriceLow: String(g.monthlyPriceLow),
      monthlyPriceHigh: g.monthlyPriceHigh ? String(g.monthlyPriceHigh) : null,
      matriculaFee: g.matriculaFee != null ? String(g.matriculaFee) : null,
      annualMaintenanceFee: g.annualMaintenanceFee ? String(g.annualMaintenanceFee) : null,
      dailyPrice: g.dailyPrice ? String(g.dailyPrice) : null,
      pricePeriod: g.pricePeriod || "monthly",
      priceIsVerified: g.priceIsVerified || false,
      isOpen247: g.isOpen247 || false,
      openingHours: g.openingHours || null,
      phone: g.phone || null,
      website: g.website || null,
      bookingUrl: g.bookingUrl || null,
      hasPermanencia: g.hasPermanencia || false,
      permanenciaMonths: g.permanenciaMonths || null,
      description: g.description || null,
      shortDescription: g.shortDescription || null,
      metaTitle: g.metaTitle || null,
      metaDescription: g.metaDescription || null,
      status: "active",
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db.update(gyms).set(values).where(eq(gyms.id, existing[0]!.id));
      console.log(`  UPDATED: ${g.name}`);
      updated++;
    } else {
      values.createdAt = new Date();
      await db.insert(gyms).values(values);
      console.log(`  CREATED: ${g.name}`);
      created++;
    }
  }

  console.log(`\nDone: ${created} created, ${updated} updated`);
}

main().catch(console.error);
