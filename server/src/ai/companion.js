import { env } from "../env.js";
import { CAPABILITY_SUMMARY, FALLBACK, findTopic } from "./guide.js";

/**
 * The companion's answer engine.
 *
 * Three providers behind one function, chosen by `COMPANION_PROVIDER`:
 *
 *   offline    the curated guide in guide.js — the default, no key, no network
 *   anthropic  the same key the rest of the app already uses
 *   groq       an OpenAI-compatible chat endpoint
 *
 * Every provider falls back to `offline` on any failure, and the offline path
 * is the one that answers "the app will not load" — a support answer that
 * needs the network to arrive is no use to the person who needs it.
 */

const TIMEOUT_MS = 20000;

const SYSTEM = `You are the guide inside Ritmo, a study tool for neurodivergent
students aged 9 to 18. You answer two kinds of question: how a part of Ritmo
works, and what to do when something is not working.

What Ritmo does. It takes an assignment, works out what it is actually asking
(the hidden verb, the deliverables, the unstated expectations, and a literal
definition of done), and hands back one step at a time. The first step always
requires zero decisions. The same material can be re-rendered as skeleton,
dialogue, map, six panels, or a read-aloud script. When interaction signals
suggest the student is stuck, a panel offers options they chose during setup.
The student writes sentences that become the model's system prompt, and can
export a one-page profile for a teacher. Nothing uses a camera or a keystroke
log; it runs offline with no API key.

Topics you cover:
${CAPABILITY_SUMMARY}

Rules. Answer only about Ritmo — if asked something else, say that is outside
what you can help with and name what you can. Be concrete: name the button and
the page. Keep it under 120 words. Plain sentences, no emoji, no exclamation
marks. Never invent a feature that is not listed above; if you do not know,
say so and point at the nearest thing that exists. Do not do the student's
homework — you explain the tool, not the subject.`;

export async function answerQuestion({ question, directives = [] }) {
  const provider = env.companionProvider;

  if (provider !== "offline") {
    try {
      const text = await callProvider(provider, question, directives);
      if (text) return { text, source: provider };
    } catch (err) {
      console.warn(`companion fell back to the offline guide: ${err.message}`);
    }
  }

  const topic = findTopic(question);
  return { text: topic ? topic.answer : FALLBACK, source: "offline", topic: topic?.id ?? null };
}

function callProvider(provider, question, directives) {
  // The student's own rules apply here too. A student who wrote "short
  // sentences, I lose long ones halfway through" meant it for every sentence
  // this software produces, not only the ones about their homework.
  const system = directives.length
    ? `${SYSTEM}\n\nThis student wrote these rules for you. They override the above:\n${directives
        .map((d) => `- ${d}`)
        .join("\n")}`
    : SYSTEM;

  return provider === "groq"
    ? callGroq(system, question)
    : callAnthropic(system, question);
}

async function callAnthropic(system, question) {
  if (!env.anthropicKey) throw new Error("no Anthropic key set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "content-type": "application/json",
      "x-api-key": env.anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.model,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic returned ${res.status}`);
  const data = await res.json();
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Groq speaks the OpenAI chat-completions shape, so this is the same request
 * with the system prompt as the first message instead of its own field.
 *
 * Set in server/.env:
 *   COMPANION_PROVIDER=groq
 *   GROQ_API_KEY=...
 *   GROQ_MODEL=...    (check Groq's current model list — ids change)
 */
async function callGroq(system, question) {
  if (!env.groqKey) throw new Error("no Groq key set");

  const res = await fetch(`${env.groqBaseUrl}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.groqKey}`,
    },
    body: JSON.stringify({
      model: env.groqModel,
      max_tokens: 400,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: question },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq returned ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
