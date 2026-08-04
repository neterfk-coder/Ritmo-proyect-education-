/**
 * Seeds one demo student with six recorded sessions.
 *
 * The numbers here are shaped like our real pilot data, not like a happy path:
 * two abandoned sessions, a slow start on skeleton format, and a friction
 * threshold that had to be raised because the first version interrupted too
 * often. A demo that only ever shows success teaches the reviewer nothing.
 */
import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "../src/lib/dbUrl.js";

/**
 * Same resolver as the runtime and the build script, for the same reason:
 * plain `DATABASE_URL` does not reliably exist under that name on a hosted
 * deploy — see `src/lib/dbUrl.js`. Constructing `new PrismaClient()` with no
 * argument here made this the one place still trusting the schema's own
 * `env("DATABASE_URL")` lookup, and it failed silently after the schema push
 * that runs immediately before it — the push succeeded because
 * `vercel-db.js` passes the resolved URL explicitly to that child process,
 * seeding did not because this file went its own way.
 */
const { pooled } = resolveDatabaseUrl();
const db = new PrismaClient(pooled ? { datasourceUrl: pooled } : undefined);

const INTERVENTIONS = [
  { key: "shrink", label: "Make this step smaller", order: 0, enabled: true },
  { key: "readAloud", label: "Read it to me", order: 1, enabled: true },
  { key: "speakInstead", label: "Let me say it instead of typing", order: 2, enabled: true },
  { key: "pause", label: "Two minutes away from this", order: 3, enabled: true },
  { key: "reframe", label: "Show it a different way", order: 4, enabled: true },
  { key: "skip", label: "Park this and come back", order: 5, enabled: false },
];

const DIRECTIVES = [
  "Never tell me how many steps are left.",
  "Do not encourage me. Just tell me the next thing.",
  "Give me the first step before you give me anything else.",
  "If I ask what finished looks like, answer literally.",
  "Short sentences. I lose long ones halfway through.",
];

async function main() {
  await db.student.deleteMany({ where: { alias: "Sam" } });

  const student = await db.student.create({
    data: {
      alias: "Sam",
      ageBand: "middle",
      identifiesAs: "ADHD, dyslexia",
      defaultFormat: "dialogue",
      readingTheme: "calm",
      readingTint: "amber",
      lineHeight: 1.9,
      letterSpacing: 0.03,
      onboarded: true,
      profile: {
        create: {
          directives: JSON.stringify(DIRECTIVES),
          fastestFormat: "dialogue",
          readingRateWpm: 168, // median of the six session rates below
          bestBlockMinutes: 11,
          medianFirstActionMs: 41000,
          frictionThreshold: 0.67,
          sessionsAnalysed: 6,
        },
      },
      // Counters match the friction rows created below: six offers, three
      // taken, all of them "shrink". A demo whose stated numbers disagree with
      // its own rows is worse than no demo.
      interventions: {
        create: INTERVENTIONS.map((i) => ({
          ...i,
          timesOffered: i.enabled ? 6 : 0,
          timesTaken: i.key === "shrink" ? 3 : 0,
          timesHelped: i.key === "shrink" ? 3 : 0,
        })),
      },
    },
  });

  const task = await db.task.create({
    data: {
      studentId: student.id,
      title: "Causes of the Cuban Missile Crisis",
      subject: "History",
      source: "paste",
      rawText:
        "Discuss the causes of the Cuban Missile Crisis. Refer to at least two sources from the module reading list. Due Friday.",
      decomposition: {
        create: {
          hiddenVerb: "write several paragraphs that put two or more positions next to each other",
          plainAsk:
            "You are being asked to write about why the Cuban Missile Crisis happened, giving more than one explanation.",
          definitionOfDone:
            "You can stop when there are at least two named causes on the page, each with a source next to it, and a last line saying which you think mattered more.",
          deliverables: JSON.stringify([
            "At least two named causes, each in its own paragraph",
            "Two sources from the reading list, named in the text",
            "A closing line stating which cause you think mattered most",
          ]),
          trapWarnings: JSON.stringify([
            "No length is given. One and a half pages is the usual expectation for this module.",
            "\"Discuss\" here means your own judgement is expected, even though nobody said so.",
          ]),
          estimatedMinutes: 45,
          model: "mock",
          steps: {
            create: [
              { order: 0, text: "Open a blank page and copy the question onto the top line, word for word.", estimatedSeconds: 60, status: "done" },
              { order: 1, text: "Write the two source titles underneath it. Nothing else yet.", estimatedSeconds: 90, status: "active" },
              { order: 2, text: "Write one cause as a single sentence. It is allowed to be wrong.", estimatedSeconds: 180, status: "waiting" },
              { order: 3, text: "Write a second cause underneath the first one.", estimatedSeconds: 180, status: "waiting" },
              { order: 4, text: "Under each cause, add one detail from the source that sits next to it.", estimatedSeconds: 300, status: "waiting" },
              { order: 5, text: "Write one last line saying which cause you think mattered more.", estimatedSeconds: 120, status: "waiting" },
            ],
          },
        },
      },
    },
  });

  const shape = [
    { format: "skeleton", wpm: 118, first: 96000, outcome: "abandoned", active: 240, steps: 1 },
    { format: "skeleton", wpm: 124, first: 88000, outcome: "paused", active: 610, steps: 2 },
    { format: "dialogue", wpm: 171, first: 44000, outcome: "finished", active: 1490, steps: 6 },
    { format: "dialogue", wpm: 168, first: 39000, outcome: "finished", active: 1320, steps: 6 },
    { format: "map", wpm: 143, first: 61000, outcome: "abandoned", active: 380, steps: 2 },
    { format: "dialogue", wpm: 176, first: 38000, outcome: "finished", active: 1610, steps: 5 },
  ];

  for (const [i, s] of shape.entries()) {
    const startedAt = new Date(Date.now() - (shape.length - i) * 86400000);
    const session = await db.session.create({
      data: {
        studentId: student.id,
        taskId: task.id,
        startedAt,
        endedAt: new Date(startedAt.getTime() + s.active * 1000),
        firstActionMs: s.first,
        activeSeconds: s.active,
        stepsCompleted: s.steps,
        formatUsed: s.format,
        readingRateWpm: s.wpm,
        outcome: s.outcome,
      },
    });

    await db.frictionEvent.create({
      data: {
        sessionId: session.id,
        score: s.outcome === "finished" ? 0.71 : 0.83,
        topSignal: s.outcome === "abandoned" ? "tabAway" : "deleteBurst",
        offered: true,
        chosenKey: s.outcome === "finished" ? "shrink" : null,
        recoveredMs: s.outcome === "finished" ? 420000 : null,
        // 16 minutes in when the session went on to finish, 6 when it did not.
        // recomputeProfile averages these to the 11-minute focus block claimed
        // in the profile above, so the demo's headline number is derived from
        // the demo's own rows rather than asserted next to them.
        at: new Date(startedAt.getTime() + (s.outcome === "finished" ? 960000 : 360000)),
      },
    });
  }

  await db.insight.createMany({
    data: [
      {
        studentId: student.id,
        kind: "format",
        statement: "You read fastest in dialogue format — about 172 words a minute, against 121 in outline form.",
        evidence: "Measured across 6 sessions on the same material.",
        confidence: 0.72,
      },
      {
        studentId: student.id,
        kind: "initiation",
        statement: "When the first step needs no decision from you, you start in about 40 seconds instead of 90.",
        evidence: "Median time from opening a task to first action, before and after the change.",
        confidence: 0.68,
      },
      {
        studentId: student.id,
        kind: "pacing",
        statement: "Your focus holds for about 11 minutes before friction rises. A 45-minute block is four of yours.",
        evidence: "Time from session start to first friction crossing, averaged.",
        confidence: 0.6,
      },
      {
        studentId: student.id,
        kind: "intervention",
        statement: "Making the step smaller is the only thing that gets you moving again. You have never once taken the break option.",
        evidence: "3 of 3 recoveries came from shrinking the step.",
        confidence: 0.55,
      },
    ],
  });

  console.log(`\n  Seeded demo student "Sam"  →  id ${student.id}`);
  console.log(`  Open the app and use this id, or just create your own account.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
