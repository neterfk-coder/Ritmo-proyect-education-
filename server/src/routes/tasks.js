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

    const text = firstClause(step.text);
    const shorter = text.length < step.text.trim().length;

    // The estimate only halves if the work actually got smaller. It used to
    // halve unconditionally, so a step the old English-only splitter could not
    // cut came back word for word with "about 1 min" over it instead of two —
    // the card reported progress that had not happened.
    const updated = await db.microStep.update({
      where: { id: step.id },
      data: {
        text,
        estimatedSeconds: shorter
          ? Math.max(30, Math.round(step.estimatedSeconds / 2))
          : step.estimatedSeconds,
      },
    });
    res.json({ ...updated, shorter });
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
/*
  Cuts a step back to its first instruction.

  The connective list used to be English only, so on a Spanish step it found
  nothing to cut and handed the text back unchanged — six of seven realistic
  Spanish steps came back identical. The estimate halved anyway, so the card
  said "about 1 min" over the same sentence and the press looked like it had
  worked. This is the intervention most students take when they stall, pressed
  at the worst moment they will have all evening, and in Spanish it did nothing
  most of the time.

  Three passes, each only used if the one before left it too long:

    1. first sentence
    2. first clause, splitting on connectives in both languages
    3. a hard cut at a word boundary

  The third exists so this can always shorten something. A step that resists
  every rule is exactly the step somebody is stuck on, and "no" is the least
  useful answer available at that moment.
*/
const CONNECTIVES = new RegExp(
  [
    // English
    " and ", " then ", " so that ", " before ", " after ", " that ", " which ",
    " until ", " while ", " with ", " using ",
    // Spanish. `y`/`e` and `o`/`u` alternate before i- and o- sounds, so both
    // spellings of each are here.
    " y ", " e ", " o ", " u ", " luego ", " despues ", " después ",
    " antes de ", " para ", " porque ", " que ", " hasta ", " mientras ",
    " cuando ", " ademas ", " además ", " con ", " usando ", " sobre ",
  ].join("|"),
  "i"
);

/** Enough to still be an instruction rather than a fragment. */
const FLOOR = 12;

/*
  Words a sentence cannot end on.

  The hard cut lands wherever the character count says, which produced
  "Subraya todas las palabras clave del." — grammatical debris that reads as a
  bug rather than as a shorter instruction. Trailing function words are removed
  until the last word can carry an ending.
*/
const DANGLING = new Set([
  // Spanish
  "de", "del", "al", "a", "en", "con", "por", "para", "y", "e", "o", "u",
  "que", "el", "la", "los", "las", "un", "una", "unos", "unas", "su", "sus",
  "mi", "mis", "tu", "tus", "lo", "sobre", "desde", "hasta", "como",
  // English
  "the", "a", "an", "of", "in", "on", "to", "for", "with", "and", "or",
  "that", "at", "from", "by", "into", "about", "as",
]);

function trimDangling(text) {
  const words = text.split(/\s+/);
  while (words.length > 2 && DANGLING.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  return words.join(" ");
}

function firstClause(text) {
  const full = text.trim().replace(/[.!?]+$/, "");

  const sentence = full.split(/(?<=[.!?])\s+/)[0].trim().replace(/[.!?]+$/, "");
  let out = sentence.length >= FLOOR ? sentence : full;

  if (out.length > FLOOR * 2) {
    const clause = out.split(/,/)[0].trim();
    if (clause.length >= FLOOR) out = clause;
  }

  if (out.length > FLOOR * 2) {
    const piece = out.split(CONNECTIVES)[0].trim();
    if (piece.length >= FLOOR) out = piece;
  }

  // Still long, or nothing above found a seam: cut at a word boundary rather
  // than leave the student holding the same sentence twice.
  if (out.length === full.length && full.length > 40) {
    const cut = full.slice(0, Math.max(FLOOR, Math.round(full.length * 0.55)));
    const word = cut.lastIndexOf(" ");
    if (word >= FLOOR) out = cut.slice(0, word).trim();
  }

  out = trimDangling(out);
  return /[.!?]$/.test(out) ? out : `${out}.`;
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
