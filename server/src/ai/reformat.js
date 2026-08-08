import { complete } from "./client.js";
import { reformatPrompt, systemFor } from "./prompts.js";
import { mockReformat } from "./mock.js";
import { env } from "../env.js";

export const FORMATS = ["skeleton", "dialogue", "map", "comic", "audio"];

/**
 * The version of the reformatting rules.
 *
 * Renderings are cached per task, so a change to `reformatPrompt` only reached
 * tasks created afterwards: a student who had already opened a shape kept the
 * old output for ever. Raise this whenever the prompt changes in a way that
 * should reach work already in progress, and the next request regenerates
 * rather than serving what the previous rules produced.
 *
 *   1  original
 *   2  short input is unpacked rather than permuted, and the shape is enforced
 */
export const RECIPE = 2;

export const FORMAT_LABELS = {
  skeleton: "Skeleton",
  dialogue: "Dialogue",
  map: "Map",
  comic: "Panels",
  audio: "Read aloud",
};

/** Same content, different shape. Never a summary — nothing is dropped. */
export async function reformat({ rawText, format, student, profile, lang = "en" }) {
  if (!FORMATS.includes(format)) format = "skeleton";
  if (env.aiMode === "mock") return mockReformat(rawText, format, lang);

  try {
    const body = await complete({
      system: systemFor(student, profile, lang),
      user: reformatPrompt(rawText, format),
      maxTokens: 2000,
    });
    return body || mockReformat(rawText, format, lang);
  } catch (err) {
    console.warn("reformat fell back to mock:", err.message);
    return mockReformat(rawText, format, lang);
  }
}
