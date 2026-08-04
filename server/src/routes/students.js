import { Router } from "express";
import { z } from "zod";
import { db, json } from "../db.js";
import { route, ApiError } from "../lib/http.js";
import { parse } from "../lib/validate.js";

export const students = Router();

/*
  Every key here must do something when pressed. That sounds too obvious to
  write down, but "speakInstead" sat in this list for the whole project:
  offered at setup, seeded, served in the friction sheet — and handled nowhere,
  because mid-task there is no text surface for dictation to type into. The
  student's writing happens outside the app. A stuck student who chose it in
  advance pressed it at their worst moment and nothing happened.

  For this product that is not a missing feature, it is a broken promise, and
  the fix is to stop making it. If a notes surface ever exists, the key can
  come back with the code that honours it.
*/
export const DEFAULT_INTERVENTIONS = [
  { key: "shrink", label: "Make this step smaller", order: 0 },
  { key: "readAloud", label: "Read it to me", order: 1 },
  { key: "pause", label: "Two minutes away from this", order: 2 },
  { key: "reframe", label: "Show it a different way", order: 3 },
  { key: "skip", label: "Park this and come back", order: 4 },
];

const createSchema = z.object({
  alias: z.string().min(1).max(40),
  ageBand: z.enum(["elementary", "middle", "high"]).default("middle"),
  identifiesAs: z.string().max(200).optional().nullable(),
  defaultFormat: z.string().default("skeleton"),
  interventionKeys: z.array(z.string()).default(DEFAULT_INTERVENTIONS.map((i) => i.key)),
  directives: z.array(z.string()).default([]),
});

students.post(
  "/",
  route(async (req, res) => {
    const body = parse(createSchema, req.body);

    const student = await db.student.create({
      data: {
        alias: body.alias,
        ageBand: body.ageBand,
        identifiesAs: body.identifiesAs ?? null,
        defaultFormat: body.defaultFormat,
        onboarded: true,
        profile: { create: { directives: json.write(body.directives) } },
        interventions: {
          create: DEFAULT_INTERVENTIONS.map((i) => ({
            ...i,
            enabled: body.interventionKeys.includes(i.key),
          })),
        },
      },
      include: { profile: true, interventions: true },
    });

    res.status(201).json(shape(student));
  })
);

students.get(
  "/:id",
  route(async (req, res) => {
    const student = await db.student.findUnique({
      where: { id: req.params.id },
      include: { profile: true, interventions: { orderBy: { order: "asc" } } },
    });
    if (!student) throw new ApiError(404, "No account with that id on this device.");
    res.json(shape(student));
  })
);

const patchSchema = z.object({
  alias: z.string().min(1).max(40).optional(),
  defaultFormat: z.string().optional(),
  readingTheme: z.enum(["calm", "dark", "contrast"]).optional(),
  readingTint: z.enum(["none", "amber", "rose", "mint", "slate"]).optional(),
  letterSpacing: z.number().min(0).max(0.2).optional(),
  lineHeight: z.number().min(1.2).max(2.4).optional(),
  showStepCount: z.boolean().optional(),
  soundOn: z.boolean().optional(),
  companionOn: z.boolean().optional(),
  backdropOn: z.boolean().optional(),
  identifiesAs: z.string().max(200).nullable().optional(),
});

students.patch(
  "/:id",
  route(async (req, res) => {
    const data = parse(patchSchema, req.body);
    const student = await db.student.update({
      where: { id: req.params.id },
      data,
      include: { profile: true, interventions: { orderBy: { order: "asc" } } },
    });
    res.json(shape(student));
  })
);

/** The student edits the sentences that become the model's system prompt. */
students.put(
  "/:id/directives",
  route(async (req, res) => {
    const { directives } = parse(
      z.object({ directives: z.array(z.string().max(200)).max(12) }),
      req.body
    );
    const profile = await db.learningProfile.upsert({
      where: { studentId: req.params.id },
      create: { studentId: req.params.id, directives: json.write(directives) },
      update: { directives: json.write(directives) },
    });
    res.json({ ...profile, directives: json.read(profile.directives) });
  })
);

students.patch(
  "/:id/interventions/:key",
  route(async (req, res) => {
    const { enabled, label } = parse(
      z.object({ enabled: z.boolean().optional(), label: z.string().max(60).optional() }),
      req.body
    );
    const updated = await db.intervention.update({
      where: { studentId_key: { studentId: req.params.id, key: req.params.key } },
      data: { enabled, label },
    });
    res.json(updated);
  })
);

/** Erase everything. One call, no confirmation dialog on the server side. */
students.delete(
  "/:id",
  route(async (req, res) => {
    await db.student.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

function shape(student) {
  return {
    ...student,
    profile: student.profile
      ? { ...student.profile, directives: json.read(student.profile.directives) }
      : null,
  };
}
