/**
 * Gymcat shared constants.
 * Centralized configuration for chains, cities, and scraping targets.
 */

/** Gym chains with scraping metadata. */
export const CHAINS = {
  "basic-fit": {
    name: "Basic-Fit",
    slug: "basic-fit",
    website: "https://www.basic-fit.com",
    clubListUrl: "https://www.basic-fit.com/es-es/clubs",
    clubUrlPattern: "https://www.basic-fit.com/es-es/clubs/{slug}",
    requiresJS: true,
    scraperType: "browserless" as const,
    typicalPrices: {
      monthly: { low: 19.99, high: 34.99 },
      matricula: { low: 0, high: 30 },
    },
  },
  vivagym: {
    name: "VivaGym",
    slug: "vivagym",
    website: "https://www.vivagym.es",
    clubListUrl: "https://www.vivagym.es/gimnasios",
    clubUrlPattern: "https://www.vivagym.es/gimnasios/{slug}",
    requiresJS: true,
    scraperType: "browserless" as const,
    typicalPrices: {
      monthly: { low: 19.99, high: 29.99 },
      matricula: { low: 0, high: 20 },
    },
  },
  dir: {
    name: "DIR",
    slug: "dir",
    website: "https://www.dir.cat",
    clubListUrl: "https://www.dir.cat/es/gimnasios",
    clubUrlPattern: "https://www.dir.cat/es/club/{slug}",
    requiresJS: true,
    scraperType: "browserless" as const,
    typicalPrices: {
      monthly: { low: 35, high: 70 },
      matricula: { low: 30, high: 99 },
    },
  },
  mcfit: {
    name: "McFit",
    slug: "mcfit",
    website: "https://www.mcfit.com",
    clubListUrl: "https://www.mcfit.com/es/gimnasios",
    clubUrlPattern: "https://www.mcfit.com/es/gimnasios/{slug}",
    requiresJS: true,
    scraperType: "browserless" as const,
    typicalPrices: {
      monthly: { low: 24.90, high: 29.90 },
      matricula: { low: 0, high: 29 },
    },
  },
  altafit: {
    name: "AltaFit",
    slug: "altafit",
    website: "https://www.altafit.com",
    clubListUrl: "https://www.altafit.com/gimnasios",
    clubUrlPattern: "https://www.altafit.com/gimnasio/{slug}",
    requiresJS: true,
    scraperType: "browserless" as const,
    typicalPrices: {
      monthly: { low: 29.90, high: 39.90 },
      matricula: { low: 0, high: 39 },
    },
  },
} as const;

export type ChainSlug = keyof typeof CHAINS;

/** Maximum acceptable price deviation from chain typicals (percentage). */
export const PRICE_ANOMALY_THRESHOLD = 0.5; // 50% deviation = flagged

/** Scraping concurrency limits. */
export const SCRAPE_CONCURRENCY = 3;

/** Browserless connection settings. */
export const BROWSERLESS_CONFIG = {
  endpoint: "wss://chrome.browserless.io",
  timeout: 30000,
  viewport: { width: 1440, height: 900 },
};

/** AI parsing configuration. */
export const AI_CONFIG = {
  model: "deepseek-chat",
  maxTokens: 4096,
  temperature: 0.1, // Low temp for structured extraction
  schemaValidation: true,
};
