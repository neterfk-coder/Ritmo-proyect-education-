import { db, json } from "../db.js";
import { tuneThreshold } from "./frictionEngine.js";
import { mockInsights } from "../ai/mock.js";
import { complete, parseJson } from "../ai/client.js";
import { insightPrompt, systemFor } from "../ai/prompts.js";
import { env } from "../env.js";

/**
 * The profile is the product.
 *
 * Everything else in Ritmo exists to fill this in: a short, readable set of
 * statements about how one specific person works, owned by that person, and
 * usable as evidence when they ask a school for something.
 *
 * These statements are also literally the model's system prompt, which means
 * the student is not configuring a tool — they are writing its instructions.
 */
export async function recomputeProfile(studentId) {
  const student = await db.student.findUniqueOrThrow({
    where: { id: studentId },
    include: { profile: true },
  });

  const sessions = await db.session.findMany({
    where: { studentId, outcome: { not: "open" } },
    include: { frictionEvents: true, readingSamples: true },
    orderBy: { startedAt: "desc" },
    take: 40,
  });

  if (sessions.length === 0) return student.profile;

  const summary = summarise(sessions);
  const events = sessions.flatMap((s) => s.frictionEvents);

  const profile = await db.learningProfile.upsert({
    where: { studentId },
    create: {
      studentId,
      fastestFormat: summary.formatRates[0]?.format ?? null,
      readingRateWpm: summary.medianReadingRateWpm,
      bestBlockMinutes: summary.bestBlockMinutes,
      medianFirstActionMs: summary.medianFirstActionMs,
      sessionsAnalysed: sessions.length,
      frictionThreshold: tuneThreshold(student.profile?.frictionThreshold ?? 0.62, events),
    },
    update: {
      fastestFormat: summary.formatRates[0]?.format ?? null,
      readingRateWpm: summary.medianReadingRateWpm,
      bestBlockMinutes: summary.bestBlockMinutes,
      medianFirstActionMs: summary.medianFirstActionMs,
      sessionsAnalysed: sessions.length,
      frictionThreshold: tuneThreshold(student.profile?.frictionThreshold ?? 0.62, events),
    },
  });

  await writeInsights(studentId, student, profile, summary);
  return profile;
}

function summarise(sessions) {
  // One session can hold several format/rate pairs, because students flip
  // between shapes mid-task. Reading only the session's final pair would rank
  // formats on whichever one happened to be open last.
  const byFormat = new Map();
  for (const s of sessions) {
    const pairs = s.readingSamples?.length
      ? s.readingSamples.map((r) => ({ format: r.format, wpm: r.wpm }))
      : s.formatUsed && s.readingRateWpm
        ? [{ format: s.formatUsed, wpm: s.readingRateWpm }]
        : [];

    for (const pair of pairs) {
      const bucket = byFormat.get(pair.format) ?? [];
      bucket.push(pair.wpm);
      byFormat.set(pair.format, bucket);
    }
  }

  const formatRates = [...byFormat.entries()]
    .map(([format, rates]) => ({ format, wpm: mean(rates), n: rates.length }))
    .sort((a, b) => b.wpm - a.wpm);

  const firstActions = sessions.map((s) => s.firstActionMs).filter(Boolean).sort((a, b) => a - b);

  // Best block = how long a session runs before the first friction crossing.
  // Every FrictionEvent row is a crossing, so the earliest one is the moment
  // focus broke. A session with no crossing contributes its whole active time.
  const blocks = sessions
    .map((s) => {
      const first = [...s.frictionEvents].sort((a, b) => new Date(a.at) - new Date(b.at))[0];
      if (!first) return s.activeSeconds / 60;
      return (new Date(first.at) - new Date(s.startedAt)) / 60000;
    })
    .filter((m) => m > 0.5 && m < 120);

  const allRates = [...byFormat.values()].flat().sort((a, b) => a - b);

  return {
    sessions: sessions.length,
    formatRates,
    medianReadingRateWpm: allRates.length ? allRates[Math.floor(allRates.length / 2)] : null,
    medianFirstActionMs: firstActions.length ? firstActions[Math.floor(firstActions.length / 2)] : null,
    bestBlockMinutes: blocks.length ? Math.round(mean(blocks)) : null,
    completionRate: sessions.filter((s) => s.outcome === "finished").length / sessions.length,
    abandonRate: sessions.filter((s) => s.outcome === "abandoned").length / sessions.length,
  };
}

async function writeInsights(studentId, student, profile, summary) {
  let generated = mockInsights(summary);

  if (env.aiMode === "live") {
    try {
      const text = await complete({
        system: systemFor(student, { directives: json.read(profile.directives) }),
        user: insightPrompt(summary),
        maxTokens: 700,
      });
      const parsed = parseJson(text, null);
      if (Array.isArray(parsed) && parsed.length) generated = parsed;
    } catch (err) {
      console.warn("insight generation fell back to mock:", err.message);
    }
  }

  const dismissed = await db.insight.findMany({
    where: { studentId, dismissed: true },
    select: { statement: true },
  });
  const blocked = new Set(dismissed.map((d) => d.statement));

  for (const insight of generated) {
    if (blocked.has(insight.statement)) continue;
    const exists = await db.insight.findFirst({
      where: { studentId, kind: insight.kind, dismissed: false },
    });
    if (exists) {
      await db.insight.update({
        where: { id: exists.id },
        data: { statement: insight.statement, evidence: insight.evidence, confidence: insight.confidence },
      });
    } else {
      await db.insight.create({ data: { studentId, ...insight } });
    }
  }
}

/**
 * The one-page handover. Deliberately boring, deliberately short, deliberately
 * written in the student's voice rather than about them in the third person.
 */
export function buildExport(student, profile, insights, audience = "teacher") {
  const lines = [];
  lines.push(`How I work — ${student.alias}`);
  lines.push(`Prepared ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`);
  lines.push("");
  lines.push(
    audience === "teacher"
      ? "I made this with a study tool that tracks how I work. It is my own data and I chose to share it."
      : "This is what I have worked out about how I study."
  );
  lines.push("");
  lines.push("What helps");
  for (const insight of insights.filter((i) => !i.dismissed)) {
    lines.push(`  · ${insight.statement}`);
    lines.push(`    ${insight.evidence}`);
  }
  if (profile?.bestBlockMinutes) {
    lines.push(`  · I work best in blocks of about ${profile.bestBlockMinutes} minutes.`);
  }
  if (profile?.fastestFormat) {
    lines.push(`  · I read fastest when material is in ${profile.fastestFormat} form.`);
  }
  lines.push("");
  lines.push("What I need at the start of a task");
  const directives = json.read(profile?.directives);
  for (const d of directives.length ? directives : ["Tell me what finished looks like before I start."]) {
    lines.push(`  · ${d}`);
  }
  lines.push("");
  lines.push(`Based on ${profile?.sessionsAnalysed ?? 0} recorded study sessions.`);
  return lines.join("\n");
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
