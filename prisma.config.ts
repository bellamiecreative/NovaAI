import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "apps/web/prisma/schema.prisma",
  migrations: { path: "apps/web/prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
