import { complete } from "./client.js";
import { reformatPrompt, systemFor } from "./prompts.js";
import { mockReformat } from "./mock.js";
import { env } from "../env.js";

export const FORMATS = ["skeleton", "dialogue", "map", "comic", "audio"];

export const FORMAT_LABELS = {
  skeleton: "Skeleton",
  dialogue: "Dialogue",
  map: "Map",
  comic: "Panels",
  audio: "Read aloud",
};

/** Same content, different shape. Never a summary — nothing is dropped. */
export async function reformat({ rawText, format, student, profile }) {
  if (!FORMATS.includes(format)) format = "skeleton";
  if (env.aiMode === "mock") return mockReformat(rawText, format);

  try {
    const body = await complete({
      system: systemFor(student, profile),
      user: reformatPrompt(rawText, format),
      maxTokens: 2000,
    });
    return body || mockReformat(rawText, format);
  } catch (err) {
    console.warn("reformat fell back to mock:", err.message);
    return mockReformat(rawText, format);
  }
}
