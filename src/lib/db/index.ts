import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || (
  typeof import.meta !== "undefined" && (import.meta as any).env?.DATABASE_URL
);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Postgres.js client for migrations and queries
const queryClient = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

// Export the raw client for migrations and special queries (pgvector, PostGIS)
export { queryClient };
export type Database = typeof db;
