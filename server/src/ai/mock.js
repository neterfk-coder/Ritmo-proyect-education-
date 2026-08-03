/**
 * Deterministic stand-in for the model.
 *
 * This exists so the whole product is demonstrable with no API key, no network,
 * and no cost — which matters when your testers are 13 and your reviewer is
 * opening the repo on a train. It is not a toy: it runs the same code path and
 * returns the same shapes as the live client.
 */

const sentences = (text) =>
  text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

export function mockDecompose(rawText) {
  const parts = sentences(rawText);
  const first = parts[0] ?? rawText.slice(0, 120);
  const verbMatch = rawText.match(
    /\b(discuss|analy[sz]e|compare|describe|explain|argue|evaluate|summari[sz]e|research|design|solve|write|draw)\b/i
  );
  const verb = (verbMatch?.[1] ?? "produce").toLowerCase();

  const translations = {
    discuss: "write several paragraphs that put two or more positions next to each other",
    analyse: "break the thing into parts and say what each part does",
    analyze: "break the thing into parts and say what each part does",
    compare: "list what is the same and what is different, in that order",
    describe: "state the observable features one at a time",
    explain: "give the cause before the effect, in order",
    argue: "pick one position and give reasons that support it",
    evaluate: "judge it against a stated standard and say why",
    summarise: "restate only the load-bearing points, in your own words",
    summarize: "restate only the load-bearing points, in your own words",
    research: "find sources, then write what they say and where you found them",
    design: "produce a labelled plan of a thing that does not exist yet",
    solve: "show the working, then state the answer",
    write: "produce continuous prose with a beginning and an end",
    draw: "produce a labelled image",
    produce: "make one concrete thing and hand it in",
  };

  return {
    title: first.split(/\s+/).slice(0, 7).join(" ").replace(/[:.]$/, ""),
    subject: null,
    hiddenVerb: translations[verb],
    plainAsk: `You are being asked to ${translations[verb]}, based on: ${first}`,
    definitionOfDone:
      "You can stop when every item in the list below exists on the page and you have read it once from the top.",
    deliverables: [
      "One written response that answers the question directly",
      "At least two specific details taken from the source material",
      "A closing line that states your position",
    ],
    trapWarnings: [
      "The assignment does not say how long it should be. Aim for one page unless your teacher said otherwise.",
      "Your own opinion is expected here even though nobody wrote that down.",
    ],
    estimatedMinutes: Math.min(60, Math.max(10, Math.round(rawText.length / 45))),
    steps: [
      { text: "Open a blank page and copy the assignment question onto the top line, word for word.", estimatedSeconds: 60 },
      { text: "Underline every word in the question that names a thing you must produce.", estimatedSeconds: 90 },
      { text: "Write one sentence answering the question badly. It is allowed to be wrong.", estimatedSeconds: 150 },
      { text: "Add two details from the source underneath that sentence.", estimatedSeconds: 240 },
      { text: "Read what you have out loud once and fix only the sentences that stop your mouth.", estimatedSeconds: 180 },
      { text: "Write one closing line that says what you think.", estimatedSeconds: 120 },
    ],
    model: "mock",
  };
}

export function mockReformat(rawText, format) {
  const parts = sentences(rawText);
  const take = parts.slice(0, 8);

  if (format === "dialogue") {
    return take
      .map((s, i) =>
        i % 2 === 0
          ? `A. So what is actually going on with this: ${s}`
          : `B. ${s}`
      )
      .join("\n\n");
  }
  if (format === "map") {
    return [
      "CENTRE — the claim everything else hangs off",
      `  ${take[0] ?? "(nothing yet)"}`,
      "",
      "AROUND IT — the supports",
      ...take.slice(1, 5).map((s) => `  · ${s}`),
      "",
      "EDGES — details you can come back to",
      ...take.slice(5).map((s) => `  · ${s}`),
    ].join("\n");
  }
  if (format === "comic") {
    return take
      .slice(0, 6)
      .map((s, i) => `PANEL ${i + 1}\n  Shows: a single scene holding one idea\n  Caption: ${s}`)
      .join("\n\n");
  }
  if (format === "audio") {
    return take.map((s) => s.replace(/,\s*/g, ",\n")).join("\n\n");
  }
  return take.map((s) => `— ${s}`).join("\n");
}

export function mockInsights(summary) {
  const out = [];
  if (summary.formatRates?.length > 1) {
    const best = summary.formatRates[0];
    out.push({
      kind: "format",
      statement: `You read fastest in ${best.format} format — about ${Math.round(best.wpm)} words a minute.`,
      evidence: `Measured across ${summary.sessions} sessions.`,
      confidence: 0.6,
    });
  }
  if (summary.medianFirstActionMs) {
    out.push({
      kind: "initiation",
      statement: `Once the first step needs no decision from you, you start in about ${Math.round(summary.medianFirstActionMs / 1000)} seconds.`,
      evidence: "Median time from opening a task to your first action.",
      confidence: 0.55,
    });
  }
  if (summary.bestBlockMinutes) {
    out.push({
      kind: "pacing",
      statement: `Your focus holds for about ${summary.bestBlockMinutes} minutes before friction rises.`,
      evidence: "Averaged across your recorded sessions.",
      confidence: 0.5,
    });
  }
  return out;
}
