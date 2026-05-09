import { db } from "@lib/db";
import { gyms, chains, cities } from "@lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const latestGym = await db.select({ updatedAt: gyms.updatedAt }).from(gyms).orderBy(desc(gyms.updatedAt)).limit(1);
  const lastmod = latestGym[0]?.updatedAt
    ? new Date(latestGym[0].updatedAt).toISOString()
    : new Date().toISOString();

  const allGyms = await db.select({ slug: gyms.slug, updatedAt: gyms.updatedAt }).from(gyms).where(eq(gyms.status, "active"));
  const allChains = await db.select({ slug: chains.slug, updatedAt: chains.updatedAt }).from(chains);
  const allCities = await db.select({ slug: cities.slug, updatedAt: cities.updatedAt }).from(cities);
  const siteUrl = "https://gymcat.es";

  const urls: string[] = [];
  urls.push(`  <url><loc>${siteUrl}/</loc><lastmod>${lastmod}</lastmod><priority>1.0</priority><changefreq>daily</changefreq></url>`);
  urls.push(`  <url><loc>${siteUrl}/gimnasios</loc><lastmod>${lastmod}</lastmod><priority>0.9</priority><changefreq>daily</changefreq></url>`);
  urls.push(`  <url><loc>${siteUrl}/mapa</loc><lastmod>${lastmod}</lastmod><priority>0.7</priority><changefreq>weekly</changefreq></url>`);
  urls.push(`  <url><loc>${siteUrl}/quienes-somos</loc><lastmod>${lastmod}</lastmod><priority>0.5</priority><changefreq>monthly</changefreq></url>`);
  urls.push(`  <url><loc>${siteUrl}/contacto</loc><lastmod>${lastmod}</lastmod><priority>0.5</priority><changefreq>monthly</changefreq></url>`);

  for (const gym of allGyms) {
    const updated = gym.updatedAt ? new Date(gym.updatedAt).toISOString() : lastmod;
    urls.push(`  <url><loc>${siteUrl}/gimnasios/${gym.slug}</loc><lastmod>${updated}</lastmod><priority>0.8</priority><changefreq>weekly</changefreq></url>`);
  }
  for (const city of allCities) {
    urls.push(`  <url><loc>${siteUrl}/gimnasios/${city.slug}</loc><lastmod>${lastmod}</lastmod><priority>0.7</priority><changefreq>weekly</changefreq></url>`);
  }
  for (const chain of allChains) {
    urls.push(`  <url><loc>${siteUrl}/cadenas/${chain.slug}</loc><lastmod>${lastmod}</lastmod><priority>0.6</priority><changefreq>weekly</changefreq></url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
