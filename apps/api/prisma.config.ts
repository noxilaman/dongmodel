import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ quiet: true });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.cjs"
  }
});
