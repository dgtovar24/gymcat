import { db } from "@lib/db";
import { analyticsEvents, gyms } from "@lib/db/schema";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";

export async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total page views
    const pageViews = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.eventType, "page_view"));

    // Landing views
    const landingViews = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "landing_view"), gte(analyticsEvents.createdAt, since)));

    // Search events
    const searches = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "search"), gte(analyticsEvents.createdAt, since)));

    // Website clicks
    const websiteClicks = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "website_click"), gte(analyticsEvents.createdAt, since)));

    // Gym views — top 20
    const gymViews = await db.select({
      gymId: analyticsEvents.gymId,
      name: gyms.name,
      count: count(),
    })
      .from(analyticsEvents)
      .innerJoin(gyms, eq(analyticsEvents.gymId, gyms.id))
      .where(and(eq(analyticsEvents.eventType, "gym_view"), gte(analyticsEvents.createdAt, since)))
      .groupBy(analyticsEvents.gymId, gyms.name)
      .orderBy(desc(count()))
      .limit(20);

    // Unique visitors (by session)
    const uniqueVisitors = await db.select({ count: sql<number>`count(distinct ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since));

    return new Response(JSON.stringify({
      pageViews: pageViews[0]?.count || 0,
      landingViews: landingViews[0]?.count || 0,
      searches: searches[0]?.count || 0,
      websiteClicks: websiteClicks[0]?.count || 0,
      uniqueVisitors: uniqueVisitors[0]?.count || 0,
      gymViews: gymViews.map(g => ({
        gymId: g.gymId,
        name: g.name,
        views: Number(g.count),
      })),
      period: `${days} días`,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
