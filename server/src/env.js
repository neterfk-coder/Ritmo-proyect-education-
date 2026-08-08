import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDatabaseUrl } from "./lib/dbUrl.js";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * A `.env` file is a local-development convenience. On a host, the environment
 * *is* the configuration, and a file that happens to be lying around must not
 * be allowed to speak over it.
 *
 * This is not hypothetical tidiness. A bundled `server/.env` set
 * DATABASE_URL="file:./dev.db", which shadowed the Postgres connection Vercel
 * had already injected, and the API reported "no database" while a perfectly
 * good one sat attached — with an error about SQLite paths that pointed
 * nowhere near the actual cause. `.vercelignore` now stops that file shipping
 * at all; this stops it mattering even if something ever ships it again.
 */
if (!process.env.VERCEL) {
  dotenv.config({ path: path.resolve(here, "../.env") });
}

const { pooled: databaseUrl } = resolveDatabaseUrl();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: databaseUrl ?? "file:./dev.db",
  // A file on the student's own machine is a different privacy promise from a
  // row in somebody else's Postgres. The interface is told which one it is.
  // Local dev sets DATABASE_URL="file:./dev.db" itself, so "resolved to
  // something" is not the test — "resolved to something that is not a file"
  // is.
  hosted: Boolean(databaseUrl) && !databaseUrl.startsWith("file:"),
  /*
    Which engine reads the student's actual assignment.

    This used to ask only about ANTHROPIC_API_KEY, so a deploy with a Groq key
    and nothing else sat in mock mode: the owl answered with a live model while
    every assignment pasted into the app got the template engine's six generic
    steps, identical whatever was pasted. The key was present, configured and
    working, and none of it reached the one place the product is judged on.

    Either key now counts, and `aiProvider` says which one is answering.
  */
  aiMode:
    process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY
      ? (process.env.AI_MODE ?? "live")
      : "mock",

  // anthropic | groq. Anthropic wins when both are set, because it is the one
  // the decomposition prompts were written and tested against.
  aiProvider:
    process.env.AI_PROVIDER ?? (process.env.ANTHROPIC_API_KEY ? "anthropic" : "groq"),

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

  /*
    The guide runs on a smaller model than the decompiler.

    Groq's free tier caps tokens per day per organisation, not per key, so a
    second key on the same account buys nothing. What does buy something is
    not spending the reasoning budget on work that needs no reasoning: the
    companion answers short questions about this product, grounded in curated
    text it is handed, so the large model was being paid to paraphrase an
    answer it had already been given.

    Decomposition and worked solutions keep the large model — those genuinely
    reason about somebody's homework. Overridable if the split turns out wrong.
  */
  groqCompanionModel:
    process.env.GROQ_COMPANION_MODEL ?? process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
  groqBaseUrl: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
};
