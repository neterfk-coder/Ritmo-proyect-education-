import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { route, ApiError } from "../lib/http.js";
import { langOf } from "../lib/lang.js";
import { parse } from "../lib/validate.js";
import { scoreFriction } from "../services/frictionEngine.js";
import { recomputeProfile } from "../services/profileEngine.js";

export const sessions = Router();

sessions.post(
  "/",
  route(async (req, res) => {
    const body = parse(z.object({ studentId: z.string(), taskId: z.string() }), req.body);
    const session = await db.session.create({ data: body });
    res.status(201).json(session);
  })
);

/**
 * Telemetry lands here as five normalised numbers and is never stored. We keep
 * the score and which signal dominated; the inputs are dropped when this
 * function returns.
 */
const tickSchema = z.object({
  signals: z.object({
    dwell: z.number().min(0).max(1).default(0),
    deleteBurst: z.number().min(0).max(1).default(0),
    idle: z.number().min(0).max(1).default(0),
    tabAway: z.number().min(0).max(1).default(0),
    reread: z.number().min(0).max(1).default(0),
  }),
  activeSeconds: z.number().min(0).optional(),
  firstActionMs: z.number().min(0).optional(),
});

sessions.post(
  "/:id/friction",
  route(async (req, res) => {
    const body = parse(tickSchema, req.body);

    const session = await db.session.findUnique({
      where: { id: req.params.id },
      include: { student: { include: { profile: true, interventions: { orderBy: { order: "asc" } } } } },
    });
    if (!session) throw new ApiError(404, "That session has closed.");

    const threshold = session.student.profile?.frictionThreshold ?? 0.62;
    const result = scoreFriction(body.signals, threshold);

    await db.session.update({
      where: { id: session.id },
      data: {
        activeSeconds: body.activeSeconds ?? session.activeSeconds,
        firstActionMs: session.firstActionMs ?? body.firstActionMs ?? null,
      },
    });

    // Don't interrupt twice in three minutes. Being interrupted repeatedly is
    // its own kind of friction.
    const recent = await db.frictionEvent.findFirst({
      where: { sessionId: session.id, offered: true, at: { gt: new Date(Date.now() - 180000) } },
    });
    const offer = result.crossed && !recent;

    // A row means "friction crossed this student's threshold", not "a sample
    // arrived". Writing every sample would make the first row of every session
    // land fifteen seconds in, which is what the profile reads as the moment
    // focus broke.
    const event = result.crossed
      ? await db.frictionEvent.create({
          data: { sessionId: session.id, score: result.score, topSignal: result.topSignal, offered: offer },
        })
      : null;

    // Only keys the workspace actually acts on. Accounts created before
    // "speakInstead" was withdrawn still hold its row, and an option that does
    // nothing when pressed must never reach a stuck student's screen — that
    // is the moment the product least gets to waste.
    const ACTIONABLE = new Set(["shrink", "readAloud", "pause", "reframe", "skip"]);
    const options = offer
      ? session.student.interventions
          .filter((i) => i.enabled && ACTIONABLE.has(i.key))
          .map((i) => ({ key: i.key, label: i.label }))
      : [];

    // Offered is counted here, when the menu is shown. Counting it on choice
    // instead made every option look like it was taken every time.
    if (options.length) {
      await db.intervention.updateMany({
        where: { studentId: session.studentId, key: { in: options.map((o) => o.key) } },
        data: { timesOffered: { increment: 1 } },
      });
    }

    res.json({
      eventId: event?.id ?? null,
      score: result.score,
      threshold,
      offer,
      // Named after what is happening, not after what is wrong with the student.
      reading: result.label,
      // The key as well as the sentence: the browser words it in whichever
      // language is on screen and falls back to the sentence if it meets a
      // signal it has no wording for.
      signal: result.topSignal,
      options,
    });
  })
);

const sampleSchema = z.object({
  format: z.string().min(1),
  wpm: z.number().positive().max(2000),
});

/**
 * A reading rate for one format, recorded when the student leaves that format.
 *
 * This is deliberately not `/end`. Switching shape is a question a student asks
 * mid-task, often several times, and closing the session every time would both
 * corrupt the profile and mark somebody as finished while they are still working.
 */
sessions.post(
  "/:id/sample",
  route(async (req, res) => {
    const body = parse(sampleSchema, req.body);

    const session = await db.session.findUnique({ where: { id: req.params.id } });
    if (!session) throw new ApiError(404, "That session has closed.");

    const sample = await db.readingSample.create({
      data: { sessionId: session.id, format: body.format, wpm: body.wpm },
    });

    // The session keeps the most recent pair so a single-format session still
    // reads correctly without joining the samples table.
    await db.session.update({
      where: { id: session.id },
      data: { formatUsed: body.format, readingRateWpm: body.wpm },
    });

    res.status(201).json(sample);
  })
);

sessions.post(
  "/friction/:eventId/choose",
  route(async (req, res) => {
    const { key } = parse(z.object({ key: z.string().nullable() }), req.body);
    const event = await db.frictionEvent.update({
      where: { id: req.params.eventId },
      data: { chosenKey: key },
      include: { session: true },
    });

    // timesOffered was already counted when the menu appeared, so only the
    // take is recorded here. Counting both together made take-rate always 100%.
    if (key) {
      await db.intervention.update({
        where: { studentId_key: { studentId: event.session.studentId, key } },
        data: { timesTaken: { increment: 1 } },
      });
    }
    res.json(event);
  })
);

const endSchema = z.object({
  outcome: z.enum(["finished", "paused", "abandoned"]),
  formatUsed: z.string().optional(),
  readingRateWpm: z.number().optional(),
  activeSeconds: z.number().optional(),
  stepsCompleted: z.number().optional(),
});

sessions.post(
  "/:id/end",
  route(async (req, res) => {
    const body = parse(endSchema, req.body);
    const session = await db.session.update({
      where: { id: req.params.id },
      data: { ...body, endedAt: new Date() },
    });
    const profile = await recomputeProfile(session.studentId, langOf(req));
    res.json({ session, profile });
  })
);
