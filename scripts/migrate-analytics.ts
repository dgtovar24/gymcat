import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      gym_id INTEGER REFERENCES gyms(id) ON DELETE SET NULL,
      page VARCHAR(300),
      session_id VARCHAR(64),
      ip_hash VARCHAR(64),
      user_agent TEXT,
      referrer TEXT,
      meta JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS ae_type_idx ON analytics_events(event_type)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS ae_gym_idx ON analytics_events(gym_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS ae_created_idx ON analytics_events(created_at)`);
  console.log("Migration applied successfully");
}

main().catch(console.error);
