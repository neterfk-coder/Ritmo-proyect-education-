import { Router } from "express";
import { z } from "zod";
import { db, json } from "../db.js";
import { route, ApiError } from "../lib/http.js";
import { langOf } from "../lib/lang.js";
import { parse } from "../lib/validate.js";
import { decompose } from "../ai/decompose.js";
import { reformat, FORMATS } from "../ai/reformat.js";
import { solve } from "../ai/solve.js";

export const tasks = Router();

const createSchema = z.object({
  studentId: z.string(),
  rawText: z.string().min(10, "Paste a bit more of the assignment.").max(20000),
  source: z.enum(["paste", "photo", "file"]).default("paste"),
});

/**
 * Create a task and decompile it in the same round trip. The student is
 * already waiting; a second request would just be a second wait.
 */
tasks.post(
  "/",
  route(async (req, res) => {
    const body = parse(createSchema, req.body);

    const student = await db.student.findUnique({
      where: { id: body.studentId },
      include: { profile: true },
    });
    if (!student) throw new ApiError(404, "No account with that id on this device.");

    const profile = student.profile
      ? { ...student.profile, directives: json.read(student.profile.directives) }
      : { directives: [] };

    const result = await decompose({ rawText: body.rawText, student, profile, lang: langOf(req) });

    const task = await db.task.create({
      data: {
        studentId: student.id,
        title: result.title,
        subject: result.subject,
        rawText: body.rawText,
        source: body.source,
        decomposition: {
          create: {
            hiddenVerb: result.hiddenVerb,
            plainAsk: result.plainAsk,
            definitionOfDone: result.definitionOfDone,
            deliverables: json.write(result.deliverables),
            trapWarnings: json.write(result.trapWarnings),
            estimatedMinutes: result.estimatedMinutes,
            model: result.model ?? "mock",
            steps: {
              create: result.steps.map((s, i) => ({
                order: i,
                text: s.text,
                estimatedSeconds: s.estimatedSeconds,
                status: i === 0 ? "active" : "waiting",
              })),
            },
          },
        },
      },
      include: { decomposition: { include: { steps: { orderBy: { order: "asc" } } } } },
    });

    res.status(201).json(shape(task));
  })
);

tasks.get(
  "/:id",
  route(async (req, res) => {
    const task = await db.task.findUnique({
      where: { id: req.params.id },
      include: {
        decomposition: { include: { steps: { orderBy: { order: "asc" } } } },
        renderings: true,
      },
    });
    if (!task) throw new ApiError(404, "That task is not here.");
    res.json(shape(task));
  })
);

tasks.get(
  "/",
  route(async (req, res) => {
    const list = await db.task.findMany({
      where: { studentId: String(req.query.studentId ?? "") },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { decomposition: { select: { estimatedMinutes: true } } },
    });
    res.json(list);
  })
);

/**
 * Same content, new shape. Cached per (task, format, language).
 *
 * The language belongs in the key. Without it, a student who switched to
 * Spanish and reopened a shape they had already looked at got the English one
 * back — the cache is keyed on what was asked for, and the language is part of
 * what was asked for.
 */
tasks.post(
  "/:id/render",
  route(async (req, res) => {
    const { format } = parse(z.object({ format: z.enum(FORMATS) }), req.body);
    const lang = langOf(req);

    const task = await db.task.findUnique({
      where: { id: req.params.id },
      include: { student: { include: { profile: true } } },
    });
    if (!task) throw new ApiError(404, "That task is not here.");

    const cached = await db.rendering.findUnique({
      where: { taskId_format_lang: { taskId: task.id, format, lang } },
    });
    if (cached) return res.json({ ...cached, cached: true });

    const profile = task.student.profile
      ? { ...task.student.profile, directives: json.read(task.student.profile.directives) }
      : { directives: [] };

    const body = await reformat({
      rawText: task.rawText, format, student: task.student, profile, lang,
    });

    const rendering = await db.rendering.create({
      data: { taskId: task.id, format, lang, body, wordCount: body.split(/\s+/).length },
    });
    res.status(201).json({ ...rendering, cached: false });
  })
);

/**
 * The worked solution, on request only.
 *
 * A POST rather than a GET because the first call creates something that did
 * not exist. Nothing is written until a student presses the button, which is
 * what makes "you opened this deliberately" true rather than decorative — an
 * answer generated with the steps and merely folded away in the page would be
 * one right-click from being read without ever deciding to.
 *
 * Kept once written, keyed by language: a student who switches to English
 * should get the solution in English rather than the Spanish one they opened
 * an hour ago, and re-solving a quadratic to translate it is a model call for
 * nothing.
 */
tasks.post(
  "/:id/solution",
  route(async (req, res) => {
    const lang = langOf(req);
    const task = await db.task.findUnique({
      where: { id: req.params.id },
      include: { decomposition: true, student: { include: { profile: true } } },
    });
    if (!task) throw new ApiError(404, "That task is not here.");
    if (!task.decomposition) throw new ApiError(409, "That task has not been worked out yet.");

    const held = task.decomposition;
    if (held.solution && held.solutionLang === lang) {
      return res.json({ kind: held.solutionKind, body: held.solution, cached: true });
    }

    const profile = task.student.profile
      ? { ...task.student.profile, directives: json.read(task.student.profile.directives) }
      : { directives: [] };

    let result;
    try {
      result = await solve({ rawText: task.rawText, student: task.student, profile, lang });
    } catch (err) {
      // The steps are still on screen and still correct. Failing to produce a
      // solution is a disappointment, not a broken page, and it must not read
      // like one.
      throw new ApiError(502, "The solution could not be worked out just now.", err.message);
    }

    // "unavailable" is a real answer about this deployment rather than a
    // solution, so it is not stored — configure a key and the next press
    // should try properly instead of replaying the apology.
    if (result.kind !== "unavailable") {
      await db.decomposition.update({
        where: { id: held.id },
        data: { solution: result.body, solutionKind: result.kind, solutionLang: lang },
      });
    }

    res.json({ kind: result.kind, body: result.body, cached: false });
  })
);

/** Break the current step into something smaller. The most-used intervention. */
tasks.post(
  "/steps/:stepId/shrink",
  route(async (req, res) => {
    const step = await db.microStep.findUnique({ where: { id: req.params.stepId } });
    if (!step) throw new ApiError(404, "That step is not here.");

    const updated = await db.microStep.update({
      where: { id: step.id },
      data: {
        text: firstClause(step.text),
        estimatedSeconds: Math.max(30, Math.round(step.estimatedSeconds / 2)),
      },
    });
    res.json(updated);
  })
);

tasks.patch(
  "/steps/:stepId",
  route(async (req, res) => {
    const { status } = parse(
      z.object({ status: z.enum(["waiting", "active", "done", "skipped"]) }),
      req.body
    );

    const step = await db.microStep.update({
      where: { id: req.params.stepId },
      data: {
        status,
        startedAt: status === "active" ? new Date() : undefined,
        completedAt: status === "done" ? new Date() : undefined,
      },
    });

    // Light one step at a time: promote the next waiting step.
    if (status === "done" || status === "skipped") {
      const next = await db.microStep.findFirst({
        where: { decompositionId: step.decompositionId, status: "waiting" },
        orderBy: { order: "asc" },
      });
      if (next) await db.microStep.update({ where: { id: next.id }, data: { status: "active" } });
    }

    const steps = await db.microStep.findMany({
      where: { decompositionId: step.decompositionId },
      orderBy: { order: "asc" },
    });
    res.json(steps);
  })
);

/**
 * Cuts a step back to its first instruction. Sentences first, then clauses,
 * because a step is more often two sentences than one long one. Pressing
 * "too big" has to visibly change the step — a shrink that returns the same
 * words reads as the button being broken.
 */
function firstClause(text) {
  const sentence = text.split(/(?<=[.!?])\s+/)[0].trim();
  const base = sentence.length < text.trim().length ? sentence : text.trim();
  const clause = base
    .replace(/[.!?]+$/, "")
    .split(/,| and | then | so that | before | after | that | which | until | while /i)[0]
    .trim();
  const shortest = clause.length >= 12 ? clause : base.replace(/[.!?]+$/, "");
  return /[.!?]$/.test(shortest) ? shortest : `${shortest}.`;
}

function shape(task) {
  if (!task.decomposition) return task;
  return {
    ...task,
    decomposition: {
      ...task.decomposition,
      deliverables: json.read(task.decomposition.deliverables),
      trapWarnings: json.read(task.decomposition.trapWarnings),
    },
  };
}
