import { Router } from "express";
import { z } from "zod";
import { db, json } from "../db.js";
import { route } from "../lib/http.js";
import { parse } from "../lib/validate.js";
import { langOf } from "../lib/lang.js";
import { answerQuestion } from "../ai/companion.js";
import { env } from "../env.js";

export const companion = Router();

const askSchema = z.object({
  question: z.string().min(1).max(600),
  studentId: z.string().optional(),
});

/**
 * The guide answers here rather than in the browser so it can use a model when
 * one is configured. Nothing is stored: a student asking how to erase their
 * data should not have that question logged.
 */
companion.post(
  "/ask",
  route(async (req, res) => {
    const body = parse(askSchema, req.body);

    let directives = [];
    if (body.studentId) {
      const profile = await db.learningProfile.findUnique({
        where: { studentId: body.studentId },
        select: { directives: true },
      });
      directives = json.read(profile?.directives);
    }

    const answer = await answerQuestion({
      question: body.question,
      directives,
      lang: langOf(req),
    });
    res.json(answer);
  })
);

companion.get("/", (_req, res) =>
  res.json({ provider: env.companionProvider, model: env.companionProvider === "groq" ? env.groqModel : null })
);
