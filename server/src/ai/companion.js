import { env } from "../env.js";
import { DEFAULT_LANG } from "../lib/lang.js";
import { CAPABILITY_SUMMARY, answerFor, fallbackFor, findTopic } from "./guide.js";

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
export a one-page profile for a teacher. The whole interface is available in
English and Spanish, switched by the EN / ES pair in the header. Nothing uses a
camera or a keystroke log; it runs offline with no API key.

Topics you cover:
${CAPABILITY_SUMMARY}

Rules. Answer only about Ritmo — if asked something else, say that is outside
what you can help with and name what you can. Be concrete: name the button and
the page. Keep it under 120 words. Plain sentences, no emoji, no exclamation
marks. Never invent a feature that is not listed above; if you do not know,
say so and point at the nearest thing that exists. Do not do the student's
homework — you explain the tool, not the subject.`;

/**
 * Answer in the language the interface is in, not the language of the question.
 *
 * These two come apart more often than they look: a student reading the Spanish
 * interface will paste an English button label into the box, and a question
 * that is half one language and half the other is normal in a bilingual school.
 * The interface language is the one the student chose, so it wins.
 */
const LANGUAGE_RULE = {
  en: "Answer in English.",
  es: `Answer in Spanish (español), whatever language the question arrives in —
the student has set the interface to Spanish and that is the choice that counts.
Conjugate for tú, never usted, and drop the pronoun itself — Spanish carries
the person in the verb, so "tú puedes cambiarlo" should be "puedes cambiarlo".
Writing it out in every sentence is the clearest sign of machine text there is.
No exclamation marks, which means no ¡ either.
Ritmo's own screens read Trabajo, Cómo trabajo, Mis datos, Lectura, "Puedes
parar cuando", "Haz solo esto", "Muy grande", "Apárcalo": name the button as it
appears on their screen, not as a translation of the English one.`,
};

export async function answerQuestion({ question, directives = [], lang = DEFAULT_LANG, hosted = false }) {
  const provider = env.companionProvider;

  /*
    The matched topic is found first and handed to the model as ground truth.

    Without it the model only saw topic ids and their trigger words, and filled
    the gaps with plausible-sounding invention: asked where to change the
    stuck-moment options it answered "on the Intervenciones screen", which does
    not exist and never did. A student then goes looking for it, does not find
    it, and concludes they are the problem — the one failure mode this guide is
    supposed to remove rather than create.

    The curated answers are already written, already correct, and already
    bilingual. The model's job is to phrase the right one for the question
    actually asked, not to remember the product.
  */
  const topic = findTopic(question, lang);

  if (provider !== "offline") {
    try {
      const text = await callProvider(provider, question, directives, lang, hosted, topic);
      if (text) return { text, source: provider, topic: topic?.id ?? null };
    } catch (err) {
      console.warn(`companion fell back to the offline guide: ${err.message}`);
    }
  }

  return {
    text: topic ? answerFor(topic, lang, hosted) : fallbackFor(lang),
    source: "offline",
    topic: topic?.id ?? null,
  };
}

/**
 * Where this copy runs changes which support answers are true. "Run npm run
 * dev" fixes a laptop and confuses a phone; the live model needs to know which
 * one it is talking to for the same reason the offline topics carry two
 * variants.
 */
const PLACEMENT = {
  local:
    "This copy runs locally: data is a SQLite file on this machine, and the fix for most problems is checking that `npm run dev` is running and http://localhost:4000/api/health answers.",
  hosted:
    "This copy is hosted on a website: the student cannot restart servers or run commands, so never suggest npm, localhost or terminal commands. For loading problems suggest a hard refresh and trying again shortly. Data lives in a database on the server, and the privacy page explains what that means.",
};

function callProvider(provider, question, directives, lang, hosted, topic) {
  // The student's own rules apply here too. A student who wrote "short
  // sentences, I lose long ones halfway through" meant it for every sentence
  // this software produces, not only the ones about their homework.
  // The verified answer for whatever the question matched, quoted at the model
  // so button and page names come from the product rather than from guesswork.
  const grounding = topic
    ? `\n\nThis is the verified answer to this question, taken from the guide.
Every page name, button label and instruction in it is correct. Rephrase it to
answer what was actually asked — shorten it, or use only the relevant part —
but do not contradict it and do not name any screen, button or feature it does
not mention:\n\n"""\n${answerFor(topic, lang, hosted)}\n"""`
    : `\n\nNothing in the guide matched this question closely. Say you are not
sure which part it is about and name two or three things you can help with.
Do not guess at page or button names.`;

  const base = `${SYSTEM}\n\n${hosted ? PLACEMENT.hosted : PLACEMENT.local}\n\n${LANGUAGE_RULE[lang] ?? LANGUAGE_RULE.en}${grounding}`;
  const system = directives.length
    ? `${base}\n\nThis student wrote these rules for you. They override the above:\n${directives
        .map((d) => `- ${d}`)
        .join("\n")}`
    : base;

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
