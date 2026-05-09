import { db } from "@lib/db";
import { gymFacilities, facilities } from "@lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET({ url }: { url: URL }) {
  const gymId = parseInt(url.searchParams.get("gym_id") || "0");

  if (!gymId) {
    return new Response(JSON.stringify({ error: "gym_id required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = await db
    .select({ slug: facilities.slug, name: facilities.name, icon: facilities.icon })
    .from(gymFacilities)
    .innerJoin(facilities, eq(gymFacilities.facilityId, facilities.id))
    .where(eq(gymFacilities.gymId, gymId));

  const slugs = rows.map(r => r.slug);

  return new Response(JSON.stringify({ gym_id: gymId, slugs, facilities: rows }), {
    headers: { "Content-Type": "application/json" },
  });
}
