import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

/**
 * The URL is passed explicitly rather than left for Prisma to read
 * `env("DATABASE_URL")` off the schema itself, because that variable does not
 * reliably exist under that exact name on the hosted copy — see
 * `lib/dbUrl.js` for why. `datasourceUrl` overrides the schema's own lookup,
 * so the client connects correctly whatever the integration named things.
 */
export const db = new PrismaClient({ datasourceUrl: env.databaseUrl });

/** SQLite has no JSON column, so structured values round-trip as strings. */
export const json = {
  read(value, fallback = []) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  write(value) {
    return JSON.stringify(value ?? null);
  },
};
