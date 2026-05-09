/**
 * Main scraper entry point.
 * Can be run standalone to test scraping without the full pipeline.
 *
 * Usage: npm run scrape [chain-slug]
 */

import { scrape, cleanHTMLForAI } from "./engine";
import { CHAIN_SCRAPE_CONFIGS } from "./chains";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  const targetSlug = process.argv[2];
  const chains = targetSlug
    ? { [targetSlug]: CHAIN_SCRAPE_CONFIGS[targetSlug] }
    : CHAIN_SCRAPE_CONFIGS;

  if (targetSlug && !CHAIN_SCRAPE_CONFIGS[targetSlug]) {
    console.error(`❌ Unknown chain: ${targetSlug}`);
    console.error(`   Available: ${Object.keys(CHAIN_SCRAPE_CONFIGS).join(", ")}`);
    process.exit(1);
  }

  const outputDir = path.join(import.meta.dirname || __dirname, "output");
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [slug, config] of Object.entries(chains)) {
    if (!config) continue;
    console.log(`\n🔍 Scraping ${config.name}...`);

    for (const url of config.clubUrls) {
      console.log(`  → ${url}`);
      try {
        const result = await scrape({
          url,
          waitTime: 5000,
          javascript: true,
          preferredEngine: "browserless",
        });

        const filename = `${slug}-${Date.now()}.html`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, result.html);

        const cleaned = cleanHTMLForAI(result.html);
        const cleanedPath = path.join(outputDir, `${slug}-${Date.now()}-cleaned.txt`);
        fs.writeFileSync(cleanedPath, cleaned);

        console.log(`    ✓ Saved: ${filename} (${(result.html.length / 1024).toFixed(1)} KB)`);
        console.log(`    ✓ Cleaned: ${cleanedPath} (${(cleaned.length / 1024).toFixed(1)} KB)`);
      } catch (error) {
        console.error(`    ❌ Failed: ${error}`);
      }
    }
  }

  console.log(`\n📁 Output directory: ${outputDir}`);
}

main().catch(console.error);
