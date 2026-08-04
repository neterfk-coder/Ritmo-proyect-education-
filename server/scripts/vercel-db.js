/**
 * Prepares the database for a hosted deploy.
 *
 * Local Ritmo runs on a SQLite file, and that is not an accident — it is the
 * privacy guarantee, and it is what makes the whole product reviewable in two
 * commands with nothing installed. A host cannot keep a file, so a deploy
 * needs Postgres.
 *
 * Rather than keep two schemas that drift, the Postgres one is derived from
 * the SQLite one at build time: same models, one line different. There is
 * still exactly one place where the data model is written down.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, "../prisma/schema.prisma");
const target = path.resolve(here, "../prisma/pg.prisma");

const url = process.env.DATABASE_URL ?? "";
const hosted = /^postgres(ql)?:\/\//.test(url);

/**
 * The connection to run DDL over.
 *
 * Every serverless Postgres worth using — Neon, Supabase, Prisma Postgres —
 * hands out two strings: a pooled one for queries, and a direct one for
 * everything else. `db push` is DDL, and a transaction-mode pooler cannot
 * carry it: the push either fails outright or hangs until the build times
 * out, with an error that says nothing about pooling.
 *
 * So: use whichever unpooled variable the provider set. Neon's Vercel
 * integration writes DATABASE_URL_UNPOOLED, Supabase writes
 * POSTGRES_URL_NON_POOLING, and a hand-configured project usually has
 * DIRECT_URL. If none exist, derive one by dropping the `-pooler` marker from
 * the host, which is Neon's own convention — and if that is not there either,
 * the URL was never pooled and is safe to use as it stands.
 */
function directUrl() {
  const named =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DIRECT_URL;
  if (named) return { url: named, why: "an unpooled variable set by the provider" };
  if (url.includes("-pooler.")) {
    return { url: url.replace("-pooler.", "."), why: "the pooled host with -pooler removed" };
  }
  return { url, why: "DATABASE_URL, which is not pooled" };
}

const schema = fs
  .readFileSync(source, "utf8")
  .replace('provider = "sqlite"', 'provider = "postgresql"')
  .replace(
    "// Ritmo data model.",
    "// Ritmo data model — GENERATED for hosted deploys, do not edit.\n" +
      "// Source of truth is prisma/schema.prisma. Regenerate with scripts/vercel-db.js.\n" +
      "//\n// Ritmo data model."
  );

fs.writeFileSync(target, schema);
console.log("  Wrote prisma/pg.prisma from schema.prisma (provider -> postgresql)");

const run = (args, env) =>
  execFileSync("npx", ["prisma", ...args], {
    stdio: "inherit",
    shell: true,
    cwd: path.resolve(here, ".."),
    env: { ...process.env, ...env },
  });

// The client is always needed — the function cannot import a client that was
// never generated, whether or not a database is reachable right now.
run(["generate", "--schema=prisma/pg.prisma"]);

if (!hosted) {
  console.log("\n  No Postgres DATABASE_URL set — skipping schema push and seed.");
  console.log("  The site will build and serve, and the API will report the missing database.");
  console.log("  Attach Postgres in the Vercel dashboard, then redeploy.\n");
  process.exit(0);
}

const direct = directUrl();
console.log(`  Pushing over ${direct.why}`);
run(
  ["db", "push", "--schema=prisma/pg.prisma", "--accept-data-loss", "--skip-generate"],
  { DATABASE_URL: direct.url }
);
console.log("  Schema pushed to Postgres");

try {
  execFileSync("node", ["prisma/seed.js"], { stdio: "inherit", cwd: path.resolve(here, "..") });
} catch {
  console.log("  Seed skipped — the demo student could not be written. The app still works.");
}
