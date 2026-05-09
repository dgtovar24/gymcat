import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { customType, pgEnum, pgTable, timestamp, text, varchar, serial, index, jsonb, integer, uniqueIndex, boolean, decimal } from 'drizzle-orm/pg-core';

const geometryPoint = customType({
  dataType() {
    return "geometry(Point, 4326)";
  },
  fromDriver(value) {
    const str = String(value);
    const match = str.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
    return { lat: 0, lng: 0 };
  },
  toDriver(value) {
    return `SRID=4326;POINT(${value.lng} ${value.lat})`;
  }
});
const vector256 = customType({
  dataType() {
    return "vector(256)";
  },
  fromDriver(value) {
    const str = String(value).replace(/[\[\]]/g, "");
    return str.split(",").map(Number);
  },
  toDriver(value) {
    return `[${value.join(",")}]`;
  }
});
const gymStatusEnum = pgEnum("gym_status", [
  "active",
  "inactive",
  "pending_review",
  "closed"
]);
const priceTypeEnum = pgEnum("price_type", [
  "matricula",
  "monthly",
  "annual_maintenance",
  "penalty",
  "additional"
]);
const scraperSourceEnum = pgEnum("scraper_source", [
  "direct_web",
  "google_maps",
  "browserless",
  "scrapingbee",
  "manual"
]);
const reviewSentimentEnum = pgEnum("review_sentiment", [
  "positive",
  "negative",
  "neutral"
]);
const chains = pgTable(
  "chains",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: text("logo_url"),
    website: text("website"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_chains_slug").on(table.slug)
  ]
);
const cities = pgTable(
  "cities",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    province: varchar("province", { length: 100 }),
    region: varchar("region", { length: 100 }).default("Cataluña"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    postalCodes: jsonb("postal_codes").$type().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_cities_slug").on(table.slug)
  ]
);
const neighborhoods = pgTable(
  "neighborhoods",
  {
    id: serial("id").primaryKey(),
    cityId: integer("city_id").notNull().references(() => cities.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("idx_neighborhood_city_slug").on(table.cityId, table.slug)
  ]
);
const gyms = pgTable(
  "gyms",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    // Location
    address: text("address"),
    cityId: integer("city_id").references(() => cities.id),
    neighborhoodId: integer("neighborhood_id").references(
      () => neighborhoods.id
    ),
    coordinates: geometryPoint("coordinates"),
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
      scale: 2
    }),
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
    aiSummaryPros: jsonb("ai_summary_pros").$type().default([]),
    aiSummaryCons: jsonb("ai_summary_cons").$type().default([]),
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
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_gyms_slug").on(table.slug),
    index("idx_gyms_city").on(table.cityId),
    index("idx_gyms_chain").on(table.chainId),
    index("idx_gyms_status").on(table.status),
    index("idx_gyms_coordinates").using("gist", table.coordinates),
    index("idx_gyms_embedding").using("hnsw", table.embedding.op("vector_l2_ops")).with({ m: 16, ef_construction: 200 })
  ]
);
const facilities = pgTable(
  "facilities",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    category: varchar("category", { length: 100 }),
    // "cardio", "wellness", "classes", "services"
    icon: varchar("icon", { length: 50 }),
    // emoji or icon name
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_facilities_category").on(table.category)
  ]
);
const gymFacilities = pgTable(
  "gym_facilities",
  {
    gymId: integer("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    facilityId: integer("facility_id").notNull().references(() => facilities.id, { onDelete: "cascade" })
  },
  (table) => [
    uniqueIndex("idx_gym_facility_unique").on(table.gymId, table.facilityId)
  ]
);
const gymImages = pgTable(
  "gym_images",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_gym_images_gym").on(table.gymId)
  ]
);
const pricesHistory = pgTable(
  "prices_history",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    priceType: priceTypeEnum("price_type").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("EUR"),
    label: varchar("label", { length: 255 }),
    // e.g. "Standard", "Premium", "Student"
    conditions: text("conditions"),
    // e.g. "Permanencia 12 meses"
    source: scraperSourceEnum("source").default("direct_web"),
    validFrom: timestamp("valid_from").notNull(),
    validTo: timestamp("valid_to"),
    recordedAt: timestamp("recorded_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_prices_gym_id").on(table.gymId),
    index("idx_prices_gym_type_date").on(table.gymId, table.priceType, table.recordedAt)
  ]
);
const reviewsSummary = pgTable(
  "reviews_summary",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 50 }).default("google_maps"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").default(0),
    topPros: jsonb("top_pros").$type().default([]),
    topCons: jsonb("top_cons").$type().default([]),
    commonTopics: jsonb("common_topics").$type().default([]),
    aiModel: varchar("ai_model", { length: 100 }),
    // which AI analyzed it
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_reviews_gym_id").on(table.gymId)
  ]
);
const scrapeLogs = pgTable(
  "scrape_logs",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id").references(() => gyms.id, { onDelete: "set null" }),
    chainId: integer("chain_id").references(() => chains.id),
    source: scraperSourceEnum("source").notNull(),
    status: varchar("status", { length: 50 }).default("pending"),
    // pending, success, failed, needs_review
    rawHtmlSize: integer("raw_html_size"),
    parsedJson: jsonb("parsed_json"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at")
  },
  (table) => [
    index("idx_scrapelogs_gym").on(table.gymId),
    index("idx_scrapelogs_status").on(table.status)
  ]
);
const alerts = pgTable(
  "alerts",
  {
    id: serial("id").primaryKey(),
    gymId: integer("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    // "price_drop", "new_gym", "anomaly"
    severity: varchar("severity", { length: 20 }).default("info"),
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    resolved: boolean("resolved").default(false),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    index("idx_alerts_type_resolved").on(table.type, table.resolved)
  ]
);

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  alerts,
  chains,
  cities,
  facilities,
  gymFacilities,
  gymImages,
  gymStatusEnum,
  gyms,
  neighborhoods,
  priceTypeEnum,
  pricesHistory,
  reviewSentimentEnum,
  reviewsSummary,
  scrapeLogs,
  scraperSourceEnum
}, Symbol.toStringTag, { value: 'Module' }));

const databaseUrl = process.env.DATABASE_URL || typeof import.meta !== "undefined" && "postgresql://gymcat:Ameri5202@45.90.237.112:5433/gymcat";
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
const queryClient = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});
const db = drizzle(queryClient, { schema });

export { gyms as a, gymFacilities as b, chains as c, db as d, cities as e, facilities as f, gymImages as g, pricesHistory as p };
