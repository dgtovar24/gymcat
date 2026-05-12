import { db } from "@lib/db";
import { analyticsEvents } from "@lib/db/schema";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";
import crypto from "crypto";

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { event_type, gym_id, page, meta } = body;

    if (!event_type) {
      return new Response(JSON.stringify({ error: "event_type required" }), { status: 400 });
    }

    // Create anonymous session hash from IP + UA
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ua = request.headers.get("user-agent") || "";
    const sessionId = crypto.createHash("sha256").update(ip + ua + Date.now().toString().slice(0, 10)).digest("hex").slice(0, 16);
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    await db.insert(analyticsEvents).values({
      eventType: event_type,
      gymId: gym_id || null,
      page: page || null,
      sessionId,
      ipHash,
      userAgent: ua,
      referrer: request.headers.get("referer") || "",
      meta: meta || null,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
