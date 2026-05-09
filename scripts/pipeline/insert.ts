/**
 * Database insertion/upsert pipeline.
 *
 * Handles:
 * 1. Upsert gym records (insert or update if exists)
 * 2. Track price history (detect changes, insert new records)
 * 3. Manage gym-facility associations
 * 4. Log scraping runs for audit trail
 */

import { db } from "@lib/db";
import {
  gyms,
  pricesHistory,
  gymFacilities,
  facilities,
  scrapeLogs,
  alerts,
  type NewGym,
} from "@lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { GymExtractionResult } from "./parse";

/** Maximum acceptable price change percentage before alerting. */
const PRICE_ALERT_THRESHOLD = 0.3; // 30% change = alert

/**
 * Upsert a gym from AI-extracted data.
 * Returns the gym ID (existing or new).
 */
export async function upsertGym(
  data: GymExtractionResult,
  sourceUrl?: string,
): Promise<number> {
  // Check if gym already exists (by name + city, or google_place_id)
  const existing = await db
    .select({ id: gyms.id })
    .from(gyms)
    .where(eq(gyms.name, data.gym_name))
    .limit(1);

  const gymData: NewGym = {
    name: data.gym_name,
    slug: slugify(data.gym_name),
    address: data.address,
    website: data.website || sourceUrl,
    sourceUrl,
    status: data.raw_confidence >= 0.7 ? "active" : "pending_review",
    dataSource: "direct_web",
    lastScrapedAt: new Date(),
    updatedAt: new Date(),
  };

  let gymId: number;

  if (existing.length > 0) {
    // Update existing gym
    gymId = existing[0]!.id;
    await db
      .update(gyms)
      .set(gymData)
      .where(eq(gyms.id, gymId));
    console.log(`  ↻ Updated: ${data.gym_name} (id: ${gymId})`);
  } else {
    // Insert new gym
    const result = await db
      .insert(gyms)
      .values({ ...gymData, createdAt: new Date() })
      .returning({ id: gyms.id });
    gymId = result[0]!.id;

    // Alert for new gym
    await db.insert(alerts).values({
      gymId,
      type: "new_gym",
      severity: "info",
      message: `Nuevo gimnasio detectado: ${data.gym_name}`,
    });

    console.log(`  ✨ New: ${data.gym_name} (id: ${gymId})`);
  }

  return gymId;
}

/**
 * Process pricing data: detect changes, insert history, update cached prices.
 */
export async function processPrices(
  gymId: number,
  prices: GymExtractionResult["prices"],
): Promise<void> {
  for (const price of prices) {
    // Find the most recent price record of this type for this gym
    const latestPrice = await db
      .select()
      .from(pricesHistory)
      .where(
        and(
          eq(pricesHistory.gymId, gymId),
          eq(pricesHistory.priceType, price.type),
        ),
      )
      .orderBy(desc(pricesHistory.recordedAt))
      .limit(1);

    const shouldInsert =
      latestPrice.length === 0 ||
      Number(latestPrice[0]!.amount) !== price.amount;

    if (shouldInsert) {
      // Insert new price history record
      await db.insert(pricesHistory).values({
        gymId,
        priceType: price.type,
        amount: String(price.amount),
        currency: price.currency || "EUR",
        label: price.label,
        conditions: price.conditions,
        source: "direct_web",
        validFrom: new Date(),
        recordedAt: new Date(),
      });

      // Check for significant price changes
      if (latestPrice.length > 0) {
        const oldAmount = Number(latestPrice[0]!.amount);
        const newAmount = price.amount;
        const change = Math.abs(newAmount - oldAmount) / oldAmount;

        if (change > PRICE_ALERT_THRESHOLD) {
          const direction = newAmount < oldAmount ? "bajada" : "subida";
          await db.insert(alerts).values({
            gymId,
            type: "price_drop",
            severity: direction === "bajada" ? "warning" : "info",
            message: `${direction.toUpperCase()} de precio ${price.type}: ${oldAmount}€ → ${newAmount}€ (${(change * 100).toFixed(0)}%)`,
            metadata: { oldPrice: oldAmount, newPrice: newAmount, changePct: change },
          });

          console.log(
            `  ⚡ ALERT: ${direction} de precio (${oldAmount}€ → ${newAmount}€)`,
          );
        }
      }

      console.log(
        `  💰 Price recorded: ${price.type} — ${price.amount}€`,
      );
    }
  }

  // Update cached prices on the gym record
  type PriceItem = GymExtractionResult["prices"][number];
  const monthlyPrices = prices.filter((p: PriceItem) => p.type === "monthly");
  const matriculaFee = prices.find((p: PriceItem) => p.type === "matricula");

  if (monthlyPrices.length > 0 || matriculaFee) {
    await db
      .update(gyms)
      .set({
        monthlyPriceLow: monthlyPrices.length > 0
          ? String(Math.min(...monthlyPrices.map((p: PriceItem) => p.amount)))
          : undefined,
        monthlyPriceHigh: monthlyPrices.length > 0
          ? String(Math.max(...monthlyPrices.map((p: PriceItem) => p.amount)))
          : undefined,
        matriculaFee: matriculaFee ? String(matriculaFee.amount) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(gyms.id, gymId));
  }
}

/**
 * Sync gym-facility associations.
 */
export async function syncFacilities(
  gymId: number,
  extractedFacilities: GymExtractionResult["facilities"],
): Promise<void> {
  // Get all known facilities from DB
  const allFacilities = await db.select().from(facilities);
  const facilityMap = new Map(
    allFacilities.map((f) => [f.name.toLowerCase().normalize("NFD"), f]),
  );

  for (const fac of extractedFacilities) {
    const normalizedName = fac.name.toLowerCase().normalize("NFD");
    let facilityId: number | undefined;

    // Try exact match first
    if (facilityMap.has(normalizedName)) {
      facilityId = facilityMap.get(normalizedName)!.id;
    } else {
      // Try fuzzy match
      for (const [key, dbFac] of facilityMap) {
        if (key.includes(normalizedName) || normalizedName.includes(key)) {
          facilityId = dbFac.id;
          break;
        }
      }
    }

    if (facilityId) {
      // Insert M2M association (ignore duplicates)
      try {
        await db.insert(gymFacilities).values({ gymId, facilityId });
      } catch {
        // Already exists, skip
      }
    }
  }
}

/**
 * Log a scraping run for audit trail.
 */
export async function logScrapeRun(params: {
  gymId?: number;
  chainId?: number;
  source: string;
  status: string;
  rawHtmlSize?: number;
  parsedJson?: object;
  errorMessage?: string;
}): Promise<void> {
  await db.insert(scrapeLogs).values({
    ...params,
    source: params.source as any,
    finishedAt: new Date(),
  });
}

/**
 * Generate a URL-safe slug from a gym name.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}
