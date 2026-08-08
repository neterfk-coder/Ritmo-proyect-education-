import { complete } from "./client.js";
import { studyPrompt, systemFor } from "./prompts.js";
import { DEFAULT_LANG } from "../lib/lang.js";
import { env } from "../env.js";

/**
 * Key points, a summary, and one way to remember it.
 *
 * The steps get somebody through tonight; this is what is left in a month. It
 * has no offline fallback for the same reason the solver has none — the
 * template engine can shape a task without understanding it, which is fine for
 * structure and useless for "what actually matters here". A fabricated set of
 * key points is worse than none, because the student would revise from it.
 */

const UNAVAILABLE = {
  en:
    "This copy has no model available right now, so there is nothing here that could pick out what matters in your material.\n\n" +
    "Either no key is set, or the shared free allowance is spent for the moment — it comes back on its own. Inventing key points would give you something to revise from that nobody checked, which is worse than an empty panel.",
  es:
    "Esta copia no tiene modelo disponible ahora mismo, así que aquí no hay nada que pueda sacar lo que importa de tu material.\n\n" +
    "O no hay clave configurada, o el cupo gratuito compartido está agotado por el momento; se recupera solo. Inventar puntos clave te daría algo que estudiar que nadie ha comprobado, y eso es peor que un panel vacío.",
};

/**
 * @returns {{ summary: string, points: string[], remember: string } | { unavailable: string }}
 */
export async function study({ rawText, student, profile, lang = DEFAULT_LANG }) {
  if (env.aiMode === "mock") {
    return { unavailable: UNAVAILABLE[lang] ?? UNAVAILABLE.en };
  }

  const text = await complete({
    system: systemFor(student, profile, lang),
    user: studyPrompt(rawText),
    maxTokens: 1200,
  });

  return parseStudy(text);
}

/**
 * Reads the SUMMARY / POINTS / REMEMBER shape back.
 *
 * Section headers rather than JSON, for the reason the solver learned the hard
 * way: multi-line prose inside a JSON string is invalid the moment the model
 * writes a real newline, and the parse then loses content it was carrying.
 *
 * Missing sections come back empty rather than throwing. A model that gave two
 * good sections and skipped the third has still helped; discarding all of it
 * over the third would be the parser overruling the answer.
 */
export function parseStudy(text) {
  const cleaned = String(text ?? "")
    .replace(/^\s*```[a-z]*\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  if (!cleaned) throw new Error("empty study");

  /*
    Find the headers, then take what lies between them.

    The first attempt built one lookahead regex per section and matched
    nothing at all — under the `m` flag the trailing `$` in the lookahead
    matched the end of the very first line, so every section stopped before it
    started, and the whole reply fell through to the "no shape found" branch
    and was returned as the summary. Locating the headers once and slicing is
    both correct and readable, which the clever version was neither.
  */
  const HEADER = /^[ \t]*(SUMMARY|RESUMEN|POINTS|PUNTOS|REMEMBER|RECORDAR)[ \t]*:?[ \t]*$/gim;
  const found = [...cleaned.matchAll(HEADER)].map((m) => ({
    name: m[1].toUpperCase(),
    from: m.index + m[0].length,
    at: m.index,
  }));

  const sectionAt = (...names) => {
    const i = found.findIndex((h) => names.includes(h.name));
    if (i === -1) return "";
    const end = found[i + 1]?.at ?? cleaned.length;
    return cleaned.slice(found[i].from, end).trim();
  };

  const summary = sectionAt("SUMMARY", "RESUMEN");
  const rawPoints = sectionAt("POINTS", "PUNTOS");
  const remember = sectionAt("REMEMBER", "RECORDAR");

  const points = rawPoints
    .split("\n")
    .map((line) => line.replace(/^\s*[-–—•·*+]\s*/, "").trim())
    // Only blanks and stray punctuation. The threshold was three characters,
    // which silently dropped legitimately short points — a date, a formula,
    // "pH 7" — and dropped them without trace, so the panel looked as though
    // the model had found less than it had.
    .filter((line) => line.length > 1);

  // Nothing parsed at all means the model ignored the shape entirely. Rather
  // than show three empty boxes, hand the whole reply back as the summary —
  // it is usually a perfectly good answer wearing the wrong clothes.
  if (!summary && !points.length && !remember) {
    return { summary: cleaned, points: [], remember: "" };
  }

  return { summary, points, remember };
}
