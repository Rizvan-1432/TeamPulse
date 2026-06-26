import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI (migrate, db push) needs a direct connection.
// Neon: use DIRECT_URL (without -pooler). Local/Supabase: falls back to DATABASE_URL.
const migrationUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
