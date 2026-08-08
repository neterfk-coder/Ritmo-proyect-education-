import { env } from "../env.js";
import { ApiError } from "../lib/http.js";

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";

/**
 * Single point of contact with the model. Everything else in the app calls
 * this, so swapping providers, adding retries, or logging cost happens once.
 *
 * Two providers behind one function. The companion has had this for a while;
 * the decomposition pipeline did not, which meant a project holding a working
 * Groq key still ran every assignment through the offline templates.
 */
const TIMEOUT_MS = 30000;

/**
 * The model that will actually answer.
 *
 * Callers record this against what they produced. Reading `env.model`
 * directly labelled Groq's output as Anthropic's, which is the kind of wrong
 * that is invisible until somebody is trying to work out why a result looks
 * unfamiliar.
 */
export const activeModel = () => (env.aiProvider === "groq" ? env.groqModel : env.model);

export async function complete({ system, user, maxTokens = 1600 }) {
  if (env.aiMode === "mock") {
    throw new ApiError(503, "Running in mock mode.");
  }

  const request =
    env.aiProvider === "groq"
      ? {
          endpoint: `${env.groqBaseUrl}/chat/completions`,
          headers: { authorization: `Bearer ${env.groqKey}` },
          // OpenAI-compatible: the system prompt is the first message rather
          // than its own field.
          body: {
            model: env.groqModel,
            max_tokens: maxTokens,
            temperature: 0.3,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          },
          read: (data) => data.choices?.[0]?.message?.content?.trim() ?? "",
        }
      : {
          endpoint: ANTHROPIC_ENDPOINT,
          headers: { "x-api-key": env.anthropicKey, "anthropic-version": "2023-06-01" },
          body: { model: env.model, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] },
          read: (data) =>
            data.content
              .filter((block) => block.type === "text")
              .map((block) => block.text)
              .join("\n")
              .trim(),
        };

  // Without this a hung connection never returns, so the callers' fallback to
  // the offline engine never fires and the student waits on a blank screen —
  // the exact failure the fallback exists to prevent.
  let res;
  try {
    res = await fetch(request.endpoint, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "content-type": "application/json", ...request.headers },
      body: JSON.stringify(request.body),
    });
  } catch (err) {
    const timedOut = err.name === "TimeoutError" || err.name === "AbortError";
    throw new ApiError(504, timedOut ? "The model took too long." : "Could not reach the model.");
  }

  if (!res.ok) {
    const body = await res.text();

    /*
      A quota that refills is not the same failure as a broken one, and the
      difference is the only thing the student can act on. Both providers'
      free tiers cap tokens per day, and on the hosted copy that cap is shared
      by everyone using it — so "try again shortly" is true, useful, and
      completely invisible unless this case is separated out here.

      Without this it surfaced as "the solution could not be worked out", which
      reads as a permanent defect in the feature rather than a queue.
    */
    if (res.status === 429 || /rate.?limit|quota|too many requests/i.test(body)) {
      throw new ApiError(429, "The model is out of capacity for now.", body.slice(0, 400));
    }
    throw new ApiError(502, "The model did not answer.", body.slice(0, 400));
  }

  return request.read(await res.json());
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
