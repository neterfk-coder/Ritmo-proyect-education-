import { env } from "../env.js";
import { ApiError } from "../lib/http.js";

const ENDPOINT = "https://api.anthropic.com/v1/messages";

/**
 * Single point of contact with the model. Everything else in the app calls
 * this, so swapping providers, adding retries, or logging cost happens once.
 */
const TIMEOUT_MS = 30000;

export async function complete({ system, user, maxTokens = 1600 }) {
  if (env.aiMode === "mock") {
    throw new ApiError(503, "Running in mock mode.");
  }

  // Without this a hung connection never returns, so the callers' fallback to
  // the offline engine never fires and the student waits on a blank screen —
  // the exact failure the fallback exists to prevent.
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "content-type": "application/json",
        "x-api-key": env.anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
  } catch (err) {
    const timedOut = err.name === "TimeoutError" || err.name === "AbortError";
    throw new ApiError(504, timedOut ? "The model took too long." : "Could not reach the model.");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(502, "The model did not answer.", body.slice(0, 400));
  }

  const data = await res.json();
  return data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

/** Models sometimes wrap JSON in fences. Strip them before parsing. */
export function parseJson(text, fallback = null) {
  const cleaned = text.replace(/^```(?:json)?/gm, "").replace(/```$/gm, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/[[{][\s\S]*[\]}]/);
    if (!match) return fallback;
    try {
      return JSON.parse(match[0]);
    } catch {
      return fallback;
    }
  }
}
