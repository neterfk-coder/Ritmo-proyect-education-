import { Router } from "express";
import { students } from "./students.js";
import { tasks } from "./tasks.js";
import { sessions } from "./sessions.js";
import { profile } from "./profile.js";
import { companion } from "./companion.js";
import { env } from "../env.js";

export const api = Router();

api.get("/health", (_req, res) =>
  res.json({
    ok: true,
    aiMode: env.aiMode,
    // The model that actually reads assignments, named by the provider that
    // will answer. Reporting env.model unconditionally claimed Anthropic was
    // running on a deploy where Groq was.
    model:
      env.aiMode !== "live"
        ? null
        : env.aiProvider === "groq"
          ? env.groqModel
          : env.model,
    aiProvider: env.aiMode === "live" ? env.aiProvider : null,
    companion: env.companionProvider,
    // The privacy page describes the instance you are actually using, not the
    // one we would prefer you were using. Hosted and local are not the same
    // promise, and the page has to say which one it is making.
    hosted: env.hosted,
  })
);

api.use("/students", students);
api.use("/tasks", tasks);
api.use("/sessions", sessions);
api.use("/profile", profile);
api.use("/companion", companion);
