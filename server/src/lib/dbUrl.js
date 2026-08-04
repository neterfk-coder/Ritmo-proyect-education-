/**
 * Finds the Postgres connection strings, whatever prefix an integration gave
 * them.
 *
 * Connecting Neon through Vercel's dashboard is meant to write a plain
 * `DATABASE_URL`. The "custom prefix" field on that screen is not empty by
 * default in every version of that flow, and whatever ends up in it — typed,
 * left as a placeholder, or defaulted to the storage name — becomes a literal
 * prefix on every variable name the integration writes, e.g.
 * `STORAGE_DATABASE_URL_DATABASE_URL`. There is no later dashboard step that
 * strips it, so the code has to go find the pair rather than assume the short
 * name landed the way the form suggested it would.
 *
 * Shared by the runtime (`db.js`, via `env.js`) and the build script
 * (`vercel-db.js`), so both agree on where the database is without either one
 * needing the prefix spelled out.
 */
export function resolveDatabaseUrl(source = process.env) {
  if (source.DATABASE_URL) {
    return {
      pooled: source.DATABASE_URL,
      unpooled:
        source.DATABASE_URL_UNPOOLED ??
        source.POSTGRES_URL_NON_POOLING ??
        source.DIRECT_URL ??
        null,
      prefix: "",
    };
  }

  // Neon's Vercel integration writes one variable per suffix — DATABASE_URL,
  // DATABASE_URL_UNPOOLED, POSTGRES_URL, POSTGRES_URL_NON_POOLING, and so on —
  // all sharing the same prefix. Finding the prefix from one of them gives the
  // rest for free.
  const pooledKey = Object.keys(source).find(
    (key) => key.endsWith("_DATABASE_URL") && !key.endsWith("_UNPOOLED")
  );
  if (pooledKey) {
    const prefix = pooledKey.slice(0, -"DATABASE_URL".length);
    return {
      pooled: source[pooledKey],
      unpooled:
        source[`${prefix}DATABASE_URL_UNPOOLED`] ??
        source[`${prefix}POSTGRES_URL_NON_POOLING`] ??
        null,
      prefix,
    };
  }

  // Fallback for integrations that only ever wrote the Vercel-Postgres-style
  // aliases without a bare DATABASE_URL variant at all.
  const postgresKey = Object.keys(source).find(
    (key) => key.endsWith("_POSTGRES_URL") || key === "POSTGRES_URL"
  );
  if (postgresKey) {
    const prefix = postgresKey.slice(0, -"POSTGRES_URL".length);
    return {
      pooled: source[postgresKey],
      unpooled: source[`${prefix}POSTGRES_URL_NON_POOLING`] ?? null,
      prefix,
    };
  }

  return { pooled: null, unpooled: null, prefix: null };
}
