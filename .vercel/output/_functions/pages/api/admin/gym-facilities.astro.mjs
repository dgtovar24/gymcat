import { d as db, f as facilities, b as gymFacilities } from '../../../chunks/index_D-1h83sr.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

async function GET({ url }) {
  const gymId = parseInt(url.searchParams.get("gym_id") || "0");
  if (!gymId) {
    return new Response(JSON.stringify({ error: "gym_id required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const rows = await db.select({ slug: facilities.slug, name: facilities.name, icon: facilities.icon }).from(gymFacilities).innerJoin(facilities, eq(gymFacilities.facilityId, facilities.id)).where(eq(gymFacilities.gymId, gymId));
  const slugs = rows.map((r) => r.slug);
  return new Response(JSON.stringify({ gym_id: gymId, slugs, facilities: rows }), {
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
