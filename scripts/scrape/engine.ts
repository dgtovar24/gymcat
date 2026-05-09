/**
 * HTML scraping engine for gym websites.
 *
 * Supports two modes:
 * 1. Browserless (headless Chrome) — for JS-heavy sites
 * 2. ScrapingBee — for simpler or geo-restricted sites
 */

import { BROWSERLESS_CONFIG } from "@lib/constants";

interface ScrapeOptions {
  url: string;
  waitForSelector?: string;
  waitTime?: number;
  javascript?: boolean;
}

interface ScrapeResult {
  html: string;
  statusCode: number;
  url: string;
  duration: number;
}

/**
 * Scrape a URL using Browserless (headless Chrome).
 * Requires BROWSERLESS_TOKEN in environment.
 */
export async function scrapeWithBrowserless(
  options: ScrapeOptions,
): Promise<ScrapeResult> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (!token) {
    throw new Error("BROWSERLESS_TOKEN is not set");
  }

  const { url, waitForSelector, waitTime = 3000 } = options;
  const startTime = Date.now();

  // Browserless /content API — fetch rendered HTML
  const browserlessUrl = `https://chrome.browserless.io/content?token=${token}`;

  const payload: Record<string, unknown> = {
    url,
    waitForTimeout: waitTime,
    gotoOptions: {
      waitUntil: "networkidle2",
      timeout: BROWSERLESS_CONFIG.timeout,
    },
    viewport: BROWSERLESS_CONFIG.viewport,
    setJavaScriptEnabled: true,
    rejectResourceTypes: ["image", "font", "media"],
  };

  if (waitForSelector) {
    payload.waitForSelector = waitForSelector;
  }

  const response = await fetch(browserlessUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const html = await response.text();
  const duration = Date.now() - startTime;

  return {
    html,
    statusCode: response.status,
    url,
    duration,
  };
}

/**
 * Scrape a URL using ScrapingBee.
 * Requires SCRAPINGBEE_API_KEY in environment.
 */
export async function scrapeWithScrapingBee(
  options: ScrapeOptions,
): Promise<ScrapeResult> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY is not set");
  }

  const { url, javascript = true, waitTime = 3000 } = options;
  const startTime = Date.now();

  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    render_js: javascript ? "true" : "false",
    wait: waitTime.toString(),
    premium_proxy: "true",
    country_code: "es",
    block_resources: "false",
  });

  const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`);
  const html = await response.text();
  const duration = Date.now() - startTime;

  return {
    html,
    statusCode: response.status,
    url,
    duration,
  };
}

/**
 * Auto-select the best scraping method based on config.
 */
export async function scrape(
  options: ScrapeOptions & { preferredEngine?: "browserless" | "scrapingbee" },
): Promise<ScrapeResult> {
  const engine = options.preferredEngine || "browserless";

  try {
    if (engine === "browserless") {
      return await scrapeWithBrowserless(options);
    }
    return await scrapeWithScrapingBee(options);
  } catch (error) {
    // Fallback to ScrapingBee if Browserless fails
    if (engine === "browserless" && process.env.SCRAPINGBEE_API_KEY) {
      console.warn("⚠️ Browserless failed, falling back to ScrapingBee...");
      return await scrapeWithScrapingBee(options);
    }
    throw error;
  }
}

/**
 * Clean raw HTML for AI consumption:
 * - Remove scripts, styles, comments
 * - Extract visible text content
 * - Keep structure hints (headings, lists)
 */
export function cleanHTMLForAI(html: string): string {
  return (
    html
      // Remove scripts and styles
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove SVG
      .replace(/<svg[\s\S]*?<\/svg>/gi, "")
      // Collapse whitespace
      .replace(/\s+/g, " ")
      // Remove excessive newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
