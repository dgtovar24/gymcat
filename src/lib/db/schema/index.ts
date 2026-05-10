import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  serial,
  index,
  uniqueIndex,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";

// ==========================================================================
// Custom Types — PostGIS geometry & pgvector
// ==========================================================================

/**
 * PostGIS geometry column (Point, stored as WGS84 lat/lon).
 * Drizzle doesn't natively support geometry, so we use a custom type
 * that maps to `geometry(Point, 4326)`.
 */
const geometryPoint = customType<{
  data: { lat: number; lng: number };
  driverData: string; // EWKT string from Postgres
}>({
  dataType() {
    return "geometry(Point, 4326)";
  },
  fromDriver(value: unknown): { lat: number; lng: number } {
    // Postgres returns EWKT: "SRID=4326;POINT(lng lat)"
    const str = String(value);
    const match = str.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (match) {
      return { lng: parseFloat(match[1]!), lat: parseFloat(match[2]!) };
    }
    return { lat: 0, lng: 0 };
  },
  toDriver(value: { lat: number; lng: number }): string {
    return `SRID=4326;POINT(${value.lng} ${value.lat})`;
  },
});

/**
 * pgvector column — stores OpenAI/DeepSeek embedding vectors.
 * Default dimension: 1536 (text-embedding-ada-002 / DeepSeek embeddings).
 */
const vector256 = customType<{
  data: number[];
  driverData: string;
}>({
  dataType() {
    return "vector(256)";
  },
  fromDriver(value: unknown): number[] {
    const str = String(value).replace(/[\[\]]/g, "");
    return str.split(",").map(Number);
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
});

// ==========================================================================
// Enums
// ==========================================================================

export const gymStatusEnum = pgEnum("gym_status", [
  "active",
  "inactive",
  "pending_review",
  "closed",
  "archived",
]);

export const priceTypeEnum = pgEnum("price_type", [
  "matricula",
  "monthly",
  "annual_maintenance",
  "penalty",
  "additional",
]);

export const scraperSourceEnum = pgEnum("scraper_source", [
  "direct_web",
  "google_maps",
  "browserless",
  "scrapingbee",
  "manual",
]);

export const reviewSentimentEnum = pgEnum("review_sentiment", [
  "positive",
  "negative",
  "neutral",
]);

// ==========================================================================
// Tables
// ==========================================================================

/** Gym chains (e.g., Basic-Fit, VivaGym, DIR, McFit). */
export const chains = pgTable(
  "chains",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: text("logo_url"),
    website: text("website"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_chains_slug").on(table.slug),
  ],
);

/** Cities / municipalities covered by Gymcat. */
export const cities = pgTable(
  "cities",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    province: varchar("province", { length: 100 }),
    region: varchar("region", { length: 100 }).default("Cataluña"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    postalCodes: jsonb("postal_codes").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_cities_slug").on(table.slug),
  ],
);

/** Neighborhoods / districts within cities. */
export const neighborhoods = pgTable(
  "neighborhoods",
  {
    id: serial("id").primaryKey(),
    cityId: integer("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_neighborhood_city_slug").on(table.cityId, table.slug),
  ],
);

/** Main gyms table — the core entity. */
export const gyms = pgTable(
  "gyms",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),

    // Location
    address: text("address"),
    cityId: integer("city_id").references(() => cities.id),
    neighborhoodId: integer("neighborhood_id").references(
      () => neighborhoods.id,
    ),
    coordinates: geometryPoint("coordinates"),
    lat: decimal("lat", { precision: 10, scale: 7 }),
    lng: decimal("lng", { precision: 10, scale: 7 }),
    googlePlaceId: varchar("google_place_id", { length: 255 }).unique(),
    imageUrl: text("image_url"),

    // Chain affiliation
    chainId: integer("chain_id").references(() => chains.id),

    // Core pricing (cached summary for fast reads)
    monthlyPriceLow: decimal("monthly_price_low", { precision: 10, scale: 2 }),
    monthlyPriceHigh: decimal("monthly_price_high", { precision: 10, scale: 2 }),
    matriculaFee: decimal("matricula_fee", { precision: 10, scale: 2 }),
    annualMaintenanceFee: decimal("annual_maintenance_fee", {
      precision: 10,
      scale: 2,
    }),

    // Verification
    isVerified: boolean("is_verified").default(false),
    verifiedReview: text("verified_review"),

    // Price verification
    priceIsVerified: boolean("price_is_verified").default(false),
    dailyPrice: decimal("daily_price", { precision: 10, scale: 2 }),
    pricePeriod: varchar("price_period", { length: 20 }).default("monthly"), // monthly, yearly, daily

    // Operations
    isOpen247: boolean("is_open_247").default(false),
    openingHours: jsonb("opening_hours"),
    phone: varchar("phone", { length: 50 }),
    website: text("website"),
    bookingUrl: text("booking_url"),

    // SEO & content
    description: text("description"),
    shortDescription: text("short_description"),
    metaTitle: varchar("meta_title", { length: 200 }),
    metaDescription: text("meta_description"),

    // AI-generated summary
    aiSummaryPros: jsonb("ai_summary_pros").$type<string[]>().default([]),
    aiSummaryCons: jsonb("ai_summary_cons").$type<string[]>().default([]),
    aiSummaryUpdatedAt: timestamp("ai_summary_updated_at"),

    // Embedding for semantic search
    embedding: vector256("embedding"),

    // Status & metadata
    status: gymStatusEnum("status").default("pending_review"),
    dataSource: scraperSourceEnum("data_source").default("manual"),
    sourceUrl: text("source_url"),
    lastScrapedAt: timestamp("last_scraped_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_gyms_slug").on(table.slug),
    index("idx_gyms_city").on(table.cityId),
    index("idx_gyms_chain").on(table.chainId),
    index("idx_gyms_status").on(table.status),
    index("idx_gyms_coordinates").using("gist", table.coordinates),
    index("idx_gyms_embedding")
      .using("hnsw", table.embedding.op("vector_l2_ops"))
      .with({ m: 16, ef_construction: 200 }),
  ],
);

/** Facilities / amenities available at gyms. */
export const facilities = pgTable(
  "facilities",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    category: varchar("category", { length: 100 }), // "cardio", "wellness", "classes", "services"
    icon: varchar("icon", { length: 50 }), // emoji or icon name
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_facilities_category").on(table.category),
  ],
);

/** M2M: gym <-> facility. */
export const gymFacilities = pgTable(
  "gym_facilities",
  {
    gymId: integer("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    facilityId: integer("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("idx_gym_facility_unique").on(table.gymId, table.facilityId),
  ],
);

/** Multiple URLs per gym — for web analysis. */
export const gymUrls = pgTable(
  "gym_urls",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    label: varchar("label", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_gym_urls_gym").on(table.gymId),
  ],
);

/** Multiple images per gym — gallery support. */
export const gymImages = pgTable(
  "gym_images",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_gym_images_gym").on(table.gymId),
  ],
);

/** Price history — tracks every price change for transparency. */
export const pricesHistory = pgTable(
  "prices_history",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    priceType: priceTypeEnum("price_type").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("EUR"),
    label: varchar("label", { length: 255 }), // e.g. "Standard", "Premium", "Student"
    conditions: text("conditions"), // e.g. "Permanencia 12 meses"
    source: scraperSourceEnum("source").default("direct_web"),
    validFrom: timestamp("valid_from").notNull(),
    validTo: timestamp("valid_to"),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_prices_gym_id").on(table.gymId),
    index("idx_prices_gym_type_date").on(table.gymId, table.priceType, table.recordedAt),
  ],
);

/** Review summaries — aggregated from Google Maps / scraping. */
export const reviewsSummary = pgTable(
  "reviews_summary",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 50 }).default("google_maps"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").default(0),
    topPros: jsonb("top_pros").$type<string[]>().default([]),
    topCons: jsonb("top_cons").$type<string[]>().default([]),
    commonTopics: jsonb("common_topics")
      .$type<{ topic: string; count: number }[]>()
      .default([]),
    aiModel: varchar("ai_model", { length: 100 }), // which AI analyzed it
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_reviews_gym_id").on(table.gymId),
  ],
);

/** Scraping run log — track each automated data collection. */
export const scrapeLogs = pgTable(
  "scrape_logs",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id").references(() => gyms.id, { onDelete: "set null" }),
    chainId: integer("chain_id").references(() => chains.id),
    source: scraperSourceEnum("source").notNull(),
    status: varchar("status", { length: 50 }).default("pending"), // pending, success, failed, needs_review
    rawHtmlSize: integer("raw_html_size"),
    parsedJson: jsonb("parsed_json"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
  },
  (table) => [
    index("idx_scrapelogs_gym").on(table.gymId),
    index("idx_scrapelogs_status").on(table.status),
  ],
);

/** Alert queue — price drops, new gyms, anomalies detected. */
export const alerts = pgTable(
  "alerts",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id")
      .notNull()
      .references(() => gyms.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // "price_drop", "new_gym", "anomaly"
    severity: varchar("severity", { length: 20 }).default("info"),
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    resolved: boolean("resolved").default(false),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_alerts_type_resolved").on(table.type, table.resolved),
  ],
);

// ==========================================================================
// Type exports
// ==========================================================================

export type Gym = typeof gyms.$inferSelect;
export type NewGym = typeof gyms.$inferInsert;
export type Chain = typeof chains.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Neighborhood = typeof neighborhoods.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type PriceHistory = typeof pricesHistory.$inferSelect;
export type ReviewSummary = typeof reviewsSummary.$inferSelect;
export type ScrapeLog = typeof scrapeLogs.$inferSelect;
export type GymImage = typeof gymImages.$inferSelect;
/** App settings key-value store */
export const settings = pgTable(
  "settings",
  {
    key: varchar("key", { length: 255 }).primaryKey(),
    value: text("value"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

export type Setting = typeof settings.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
