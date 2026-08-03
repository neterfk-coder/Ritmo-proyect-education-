import { complete, parseJson } from "./client.js";
import { decomposePrompt, systemFor } from "./prompts.js";
import { mockDecompose } from "./mock.js";
import { env } from "../env.js";

/**
 * Turns an assignment into an explicit contract: what is being asked, when it
 * is finished, and one action that requires no decision.
 *
 * Falls back to the mock engine on any failure. A student staring at a blank
 * page at 9pm should never see an error screen because a provider was down.
 */
export async function decompose({ rawText, student, profile }) {
  if (env.aiMode === "mock") return mockDecompose(rawText);

  try {
    const text = await complete({
      system: systemFor(student, profile),
      user: decomposePrompt(rawText),
    });
    const parsed = parseJson(text);
    if (!parsed?.steps?.length) return mockDecompose(rawText);
    return { ...normalise(parsed), model: env.model };
  } catch (err) {
    console.warn("decompose fell back to mock:", err.message);
    return mockDecompose(rawText);
  }
}

function normalise(parsed) {
  return {
    title: String(parsed.title ?? "Untitled task").slice(0, 90),
    subject: parsed.subject ?? null,
    hiddenVerb: String(parsed.hiddenVerb ?? ""),
    plainAsk: String(parsed.plainAsk ?? ""),
    definitionOfDone: String(parsed.definitionOfDone ?? ""),
    deliverables: toArray(parsed.deliverables),
    trapWarnings: toArray(parsed.trapWarnings),
    estimatedMinutes: Number(parsed.estimatedMinutes) || 20,
    steps: toArray(parsed.steps)
      .slice(0, 6)
      .map((s, i) => ({
        text: String(s.text ?? s).trim(),
        estimatedSeconds: Number(s.estimatedSeconds) || 120,
        order: i,
      })),
  };
}

const toArray = (v) => (Array.isArray(v) ? v : []);
