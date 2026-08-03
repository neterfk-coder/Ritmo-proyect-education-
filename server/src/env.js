import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../.env") });

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  // A file on the student's own machine is a different privacy promise from a
  // row in somebody else's Postgres. The interface is told which one it is.
  hosted: !(process.env.DATABASE_URL ?? "file:").startsWith("file:"),
  aiMode: process.env.ANTHROPIC_API_KEY ? (process.env.AI_MODE ?? "live") : "mock",
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",

  // The companion picks its own provider so the guide can run on a different
  // model — or on none — without touching how assignments are decompiled.
  // offline | anthropic | groq. Defaults to whichever key is present.
  companionProvider:
    process.env.COMPANION_PROVIDER ??
    (process.env.GROQ_API_KEY ? "groq" : process.env.ANTHROPIC_API_KEY ? "anthropic" : "offline"),
  groqKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  groqBaseUrl: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
};
