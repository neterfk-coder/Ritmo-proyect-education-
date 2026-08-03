import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

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
