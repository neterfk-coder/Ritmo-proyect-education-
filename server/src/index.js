import { app } from "./app.js";
import { env } from "./env.js";

/** Local development: a real, long-running server. */
app.listen(env.port, () => {
  console.log(`\n  Ritmo API   http://localhost:${env.port}/api`);
  console.log(`  AI mode     ${env.aiMode}${env.aiMode === "live" ? ` (${env.model})` : " — no key needed"}`);
  console.log(`  Companion   ${env.companionProvider}`);
  console.log(`  Database    ${env.databaseUrl.startsWith("file:") ? "sqlite, server/prisma/dev.db" : "postgres"}\n`);
});
