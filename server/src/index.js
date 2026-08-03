import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { api } from "./routes/index.js";
import { errorHandler } from "./lib/http.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api", api);
app.use((_req, res) => res.status(404).json({ error: "No route there." }));
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`\n  Ritmo API   http://localhost:${env.port}/api`);
  console.log(`  AI mode     ${env.aiMode}${env.aiMode === "live" ? ` (${env.model})` : " — no key needed"}`);
  console.log(`  Database    sqlite, server/prisma/dev.db\n`);
});
