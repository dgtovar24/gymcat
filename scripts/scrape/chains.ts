/**
 * Chain-specific scraping configurations and selectors.
 *
 * Each chain entry defines:
 * - URLs to scrape
 * - CSS selectors for extracting prices, facilities, etc.
 * - Patterns for matching content in raw HTML
 */

export interface ChainScrapeConfig {
  slug: string;
  name: string;
  clubUrls: string[];
  selectors: {
    priceContainer?: string;
    priceItems?: string;
    priceAmount?: string;
    priceLabel?: string;
    conditions?: string;
    facilities?: string;
    facilityItem?: string;
    gymName?: string;
    address?: string;
    hours?: string;
  };
  patterns: {
    priceFrom: RegExp;
    facilities: RegExp[];
  };
}

const FACILITY_PATTERNS: RegExp[] = [
  /piscina|pool/i,
  /sauna/i,
  /spa/i,
  /(?:24\s*h|abierto\s*24|open\s*24)/i,
  /parking/i,
  /clases\s*dirigidas|group\s*classes/i,
  /spinning/i,
  /yoga/i,
  /crossfit|cross\s*training/i,
  /peso\s*libre|free\s*weights/i,
  /cardio/i,
  /toallas|towels/i,
  /taquillas|lockers/i,
  /wifi/i,
  /cafeter[ií]a|cafeteria|coffee/i,
];

const PRICE_FROM_PATTERN = /(?:desde|from|a partir de)\s*(\d+[.,]\d{2})\s*[€$]?\s*(?:\/mes|\/month)?/gi;

export const CHAIN_SCRAPE_CONFIGS: Record<string, ChainScrapeConfig> = {
  "basic-fit": {
    slug: "basic-fit",
    name: "Basic-Fit",
    clubUrls: [
      "https://www.basic-fit.com/es-es/clubs",
    ],
    selectors: {
      priceContainer: '[class*="pricing"], [class*="price"], [class*="tarif"]',
      priceItems: '[class*="card"], [class*="plan"], [class*="option"]',
      priceAmount: '[class*="price"], [class*="amount"], .currency',
      priceLabel: 'h2, h3, [class*="title"], [class*="name"]',
      conditions: '[class*="conditions"], [class*="small"], [class*="legal"]',
      facilities: '[class*="facilities"], [class*="amenities"], [class*="services"]',
      facilityItem: "li, [class*='item']",
      gymName: 'h1, [class*="club-name"], [class*="title"]',
      address: '[class*="address"], [class*="location"]',
      hours: '[class*="hours"], [class*="opening"], [class*="schedule"]',
    },
    patterns: {
      priceFrom: PRICE_FROM_PATTERN,
      facilities: FACILITY_PATTERNS,
    },
  },

  vivagym: {
    slug: "vivagym",
    name: "VivaGym",
    clubUrls: ["https://www.vivagym.es/gimnasios"],
    selectors: {
      priceContainer: '[class*="price"], [class*="tarifa"], [class*="plan"]',
      priceItems: '.plan, [class*="plan-item"], [class*="price-item"]',
      priceAmount: '.price, .amount, [class*="price-value"]',
      priceLabel: ".plan-name, .plan-title, h3, h4",
      conditions: '.conditions, .small-print, [class*="legal"]',
      facilities: '.services, .facilities, .amenities, [class*="features"]',
      facilityItem: "li, .service-item, [class*='item']",
      gymName: "h1, .gym-name, .club-title",
      address: ".address, .location",
      hours: ".hours, .schedule, .timetable",
    },
    patterns: {
      priceFrom: PRICE_FROM_PATTERN,
      facilities: FACILITY_PATTERNS,
    },
  },

  dir: {
    slug: "dir",
    name: "DIR",
    clubUrls: ["https://www.dir.cat/es/gimnasios"],
    selectors: {
      priceContainer: '[class*="price"], [class*="tarifa"], [class*="cuota"]',
      priceItems: '.price-card, [class*="price-card"], [class*="plan"]',
      priceAmount: ".price, .amount, .value",
      priceLabel: ".plan-name, h3, .title",
      conditions: ".conditions, .legal, .small",
      facilities: ".services, .facilities, .features",
      facilityItem: "li, .item",
      gymName: "h1, .club-name, .gym-name",
      address: ".address, .location",
      hours: ".hours, .schedule",
    },
    patterns: {
      priceFrom: PRICE_FROM_PATTERN,
      facilities: FACILITY_PATTERNS,
    },
  },
};
