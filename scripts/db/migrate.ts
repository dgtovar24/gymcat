/**
 * Database migration script.
 * Uses Drizzle Kit to generate and apply migrations.
 *
 * Usage: npm run db:migrate
 */

import { execSync } from "node:child_process";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Create a .env file from .env.example.");
  process.exit(1);
}

async function main() {
  console.log("🔧 Running database migrations...\n");

  try {
    // Generate migration files from schema
    console.log("→ Generating migration SQL...");
    execSync("npx drizzle-kit generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL },
    });

    // Apply migrations
    console.log("\n→ Applying migrations...");
    execSync("npx drizzle-kit migrate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL },
    });

    console.log("\n✅ Migrations complete.");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
