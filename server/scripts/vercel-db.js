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

const run = (args) =>
  execFileSync("npx", ["prisma", ...args], { stdio: "inherit", shell: true, cwd: path.resolve(here, "..") });

// The client is always needed — the function cannot import a client that was
// never generated, whether or not a database is reachable right now.
run(["generate", "--schema=prisma/pg.prisma"]);

if (!hosted) {
  console.log("\n  No Postgres DATABASE_URL set — skipping schema push and seed.");
  console.log("  The site will build and serve, and the API will report the missing database.");
  console.log("  Attach Postgres in the Vercel dashboard, then redeploy.\n");
  process.exit(0);
}

run(["db", "push", "--schema=prisma/pg.prisma", "--accept-data-loss", "--skip-generate"]);
console.log("  Schema pushed to Postgres");

try {
  execFileSync("node", ["prisma/seed.js"], { stdio: "inherit", cwd: path.resolve(here, "..") });
} catch {
  console.log("  Seed skipped — the demo student could not be written. The app still works.");
}
