import { db } from "@lib/db";
import { gymUrls } from "@lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET({ url }: { url: URL }) {
  const gymId = parseInt(url.searchParams.get("gym_id") || "0");
  if (!gymId) return json({ error: "gym_id required" }, 400);

  const rows = await db.select({ url: gymUrls.url, label: gymUrls.label, id: gymUrls.id })
    .from(gymUrls).where(eq(gymUrls.gymId, gymId));

  return json({ gym_id: gymId, urls: rows });
}

export async function PUT({ request }: { request: Request }) {
  const body = await request.json();
  const gymId = body.gym_id;
  const urls: { url: string; label?: string }[] = body.urls || [];

  if (!gymId) return json({ error: "gym_id required" }, 400);

  // Delete existing URLs
  await db.delete(gymUrls).where(eq(gymUrls.gymId, gymId));

  // Insert new URLs
  for (const u of urls) {
    if (u.url && u.url.trim()) {
      await db.insert(gymUrls).values({ gymId, url: u.url.trim(), label: u.label || null });
    }
  }

  return json({ success: true, gym_id: gymId, count: urls.length });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
