import { Router } from "express";
import { z } from "zod";
import { db, json } from "../db.js";
import { route, ApiError } from "../lib/http.js";
import { langOf } from "../lib/lang.js";
import { parse } from "../lib/validate.js";
import { buildExport, recomputeProfile } from "../services/profileEngine.js";

export const profile = Router();

profile.get(
  "/:studentId",
  route(async (req, res) => {
    const student = await db.student.findUnique({
      where: { id: req.params.studentId },
      include: { profile: true },
    });
    if (!student) throw new ApiError(404, "No account with that id on this device.");

    const insights = await db.insight.findMany({
      where: { studentId: student.id, dismissed: false },
      orderBy: { confidence: "desc" },
    });

    const sessions = await db.session.count({ where: { studentId: student.id } });
    const finished = await db.session.count({
      where: { studentId: student.id, outcome: "finished" },
    });

    res.json({
      profile: student.profile
        ? { ...student.profile, directives: json.read(student.profile.directives) }
        : null,
      insights,
      stats: { sessions, finished },
    });
  })
);

profile.post(
  "/:studentId/recompute",
  route(async (req, res) => {
    const updated = await recomputeProfile(req.params.studentId, langOf(req));
    // Null means there is nothing recorded yet, which is not an error and is
    // not an empty profile either. Say which.
    if (!updated) return res.json(null);
    res.json({ ...updated, directives: json.read(updated.directives) });
  })
);

/** Dismissing an insight is permanent. We do not regenerate what was rejected. */
profile.post(
  "/insights/:id/dismiss",
  route(async (req, res) => {
    const insight = await db.insight.update({
      where: { id: req.params.id },
      data: { dismissed: true },
    });
    res.json(insight);
  })
);

/**
 * The only route in this API that produces something a third party can read.
 * It requires an explicit call from the student and it writes an audit row.
 */
profile.post(
  "/:studentId/export",
  route(async (req, res) => {
    const { audience } = parse(
      z.object({ audience: z.enum(["teacher", "family", "self"]).default("teacher") }),
      req.body
    );

    const student = await db.student.findUnique({
      where: { id: req.params.studentId },
      include: { profile: true },
    });
    if (!student) throw new ApiError(404, "No account with that id on this device.");

    const insights = await db.insight.findMany({
      where: { studentId: student.id, dismissed: false },
      orderBy: { confidence: "desc" },
    });

    const body = buildExport(student, student.profile, insights, audience, langOf(req));
    const record = await db.profileExport.create({
      data: { studentId: student.id, audience, body },
    });
    res.status(201).json(record);
  })
);

profile.get(
  "/:studentId/exports",
  route(async (req, res) => {
    const list = await db.profileExport.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  })
);
