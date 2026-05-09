/**
 * Main data pipeline orchestrator.
 *
 * Flow:
 * 1. Scrape raw HTML from gym websites
 * 2. Clean HTML for AI consumption
 * 3. AI extracts structured data (prices, facilities, hours)
 * 4. Validate & upsert into Postgres
 * 5. Track price history & generate alerts
 *
 * Usage: npm run pipeline
 */

import { scrape, cleanHTMLForAI } from "../scrape/engine";
import { CHAIN_SCRAPE_CONFIGS } from "../scrape/chains";
import { extractGymData } from "./parse";
import { upsertGym, processPrices, syncFacilities, logScrapeRun } from "./insert";
import { SCRAPE_CONCURRENCY } from "@lib/constants";

interface PipelineStats {
  scraped: number;
  extracted: number;
  inserted: number;
  updated: number;
  errors: number;
}

/**
 * Run the full pipeline for all configured chains.
 */
async function runPipeline(chainSlugs?: string[]): Promise<PipelineStats> {
  const stats: PipelineStats = {
    scraped: 0,
    extracted: 0,
    inserted: 0,
    updated: 0,
    errors: 0,
  };

  const chainsToRun = chainSlugs
    ? chainSlugs.filter((s) => s in CHAIN_SCRAPE_CONFIGS)
    : Object.keys(CHAIN_SCRAPE_CONFIGS);

  console.log("🚀 Starting Gymcat data pipeline...\n");
  console.log(`📋 Chains to process: ${chainsToRun.join(", ")}`);
  console.log(`🔧 Concurrency: ${SCRAPE_CONCURRENCY}\n`);

  for (const chainSlug of chainsToRun) {
    const config = CHAIN_SCRAPE_CONFIGS[chainSlug];
    if (!config) continue;

    console.log(`\n${"═".repeat(60)}`);
    console.log(`🏋️ Processing: ${config.name} (${chainSlug})`);
    console.log(`${"═".repeat(60)}`);

    for (const url of config.clubUrls) {
      console.log(`\n📡 Scraping: ${url}`);

      try {
        // Step 1: Scrape
        const result = await scrape({
          url,
          waitTime: 5000,
          javascript: true,
          preferredEngine: "browserless",
        });
        stats.scraped++;
        console.log(`  ✓ HTML fetched (${(result.html.length / 1024).toFixed(1)} KB, ${result.duration}ms)`);

        // Step 2: Clean HTML for AI
        const cleaned = cleanHTMLForAI(result.html);
        console.log(`  ✓ Cleaned HTML (${(cleaned.length / 1024).toFixed(1)} KB)`);

        // Step 3: AI extraction
        const extracted = await extractGymData(cleaned, url);
        stats.extracted++;
        console.log(`  ✓ AI extracted: "${extracted.gym_name}" (confidence: ${(extracted.raw_confidence * 100).toFixed(0)}%)`);
        console.log(`    Prices found: ${extracted.prices.length}`);
        console.log(`    Facilities found: ${extracted.facilities.length}`);

        // Step 4: Upsert gym
        const gymId = await upsertGym(extracted, url);
        if (gymId) {
          stats.inserted++;
        } else {
          stats.updated++;
        }

        // Step 5: Process prices & track history
        if (extracted.prices.length > 0) {
          await processPrices(gymId, extracted.prices);
        }

        // Step 6: Sync facilities
        if (extracted.facilities.length > 0) {
          await syncFacilities(gymId, extracted.facilities);
        }

        // Step 7: Log successful run
        await logScrapeRun({
          gymId,
          source: "direct_web",
          status: "success",
          rawHtmlSize: result.html.length,
          parsedJson: extracted,
        });

        console.log(`  ✅ Pipeline complete for ${url}`);
      } catch (error) {
        stats.errors++;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Error: ${message}`);

        await logScrapeRun({
          source: "direct_web",
          status: "failed",
          errorMessage: message,
        });
      }
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("📊 Pipeline Summary:");
  console.log(`  Scraped:    ${stats.scraped}`);
  console.log(`  Extracted:  ${stats.extracted}`);
  console.log(`  Inserted:   ${stats.inserted}`);
  console.log(`  Updated:    ${stats.updated}`);
  console.log(`  Errors:     ${stats.errors}`);
  console.log(`${"═".repeat(60)}`);

  return stats;
}

// Run if called directly (not imported)
const isDirectRun = process.argv[1]?.endsWith("pipeline/index.ts") ||
  process.argv[1]?.endsWith("pipeline/index.js");

if (isDirectRun) {
  const targetChains = process.argv.slice(2);
  runPipeline(targetChains.length > 0 ? targetChains : undefined)
    .then(() => {
      console.log("\n✅ Pipeline completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Pipeline failed:", error);
      process.exit(1);
    });
}

export { runPipeline };
