import { activeModel, complete } from "./client.js";
import { solutionPrompt, systemFor } from "./prompts.js";
import { DEFAULT_LANG } from "../lib/lang.js";
import { env } from "../env.js";

/**
 * The worked solution behind "check my result".
 *
 * Unlike every other AI path in this product, this one has no offline
 * fallback, and that is deliberate. The template engine can shape a task into
 * steps without understanding it, because the steps are structural. It cannot
 * solve an equation. Producing something reassuring and wrong here would be
 * worse than producing nothing: a student checking their answer against a
 * fabricated one is worse off than a student who checked nothing.
 *
 * So with no model configured this says plainly that it cannot, and says why.
 */

const UNAVAILABLE = {
  en:
    "This copy has no model configured, so there is nothing here that could work the answer out.\n\n" +
    "The steps above are structural — they are built from the shape of the assignment, not from understanding it — so they still hold. But a solution would have to be invented, and an invented answer you checked yours against would be worse than no answer at all.",
  es:
    "Esta copia no tiene ningún modelo configurado, así que aquí no hay nada que pueda resolverlo.\n\n" +
    "Los pasos de arriba son estructurales — salen de la forma del enunciado, no de entenderlo — así que siguen valiendo. Pero una solución habría que inventarla, y una respuesta inventada contra la que comparases la tuya sería peor que no tener ninguna.",
};

/**
 * @returns {{ kind: "worked"|"method"|"unavailable", body: string, model: string|null }}
 */
export async function solve({ rawText, student, profile, lang = DEFAULT_LANG }) {
  if (env.aiMode === "mock") {
    return { kind: "unavailable", body: UNAVAILABLE[lang] ?? UNAVAILABLE.en, model: null };
  }

  const text = await complete({
    system: systemFor(student, profile, lang),
    user: solutionPrompt(rawText),
    maxTokens: 1800,
  });

  return { ...parseSolution(text), model: activeModel() };
}

/**
 * Reads the `KIND: x` / `---` / body shape back.
 *
 * This was JSON first, and it failed in testing in the way that matters: the
 * model wrote a multi-line solution inside a JSON string, raw newlines made it
 * invalid, the parse fell through, and an essay task came back labelled
 * "worked" with the unparsed JSON as its body. The student would have been
 * shown a blob of syntax and no warning that the assignment wanted their own
 * work. A line-based format cannot fail that way.
 *
 * Every branch is forgiving in the same direction: when the header is missing
 * or unreadable, keep the text and fall back to "method". Mislabelling a
 * solvable problem as needing original work is a mild annoyance; mislabelling
 * an essay as "here is the answer" is the failure this feature was designed
 * around.
 */
export function parseSolution(text) {
  const cleaned = String(text ?? "")
    .replace(/^\s*```[a-z]*\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  if (!cleaned) throw new Error("empty solution");

  const header = cleaned.match(/^\s*KIND\s*:\s*(worked|method)\b/i);
  const marker = cleaned.indexOf("---");

  const body = (marker === -1 ? cleaned.replace(/^\s*KIND\s*:.*$/im, "") : cleaned.slice(marker + 3))
    .trim();

  if (!body) throw new Error("empty solution");
  return { kind: header?.[1].toLowerCase() === "worked" ? "worked" : "method", body };
}
