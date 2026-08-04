/**
 * Every prompt here is written to a single rule: the student is the primary
 * user, and the student is not a patient, a project, or a child to be praised.
 *
 * Things these prompts explicitly forbid, each because a tester asked for it:
 *   - encouragement and praise ("it sounds fake and I stop trusting it")
 *   - exclamation marks and emoji
 *   - naming a total number of steps in the step text
 *   - steps that require choosing between options
 */

const HOUSE_STYLE = `
Voice rules, all mandatory:
- Second person, plain verbs, sentence case, no exclamation marks, no emoji.
- No praise, encouragement, cheerleading, or motivational language of any kind.
- No mention of how many steps remain or how long the whole task will take.
- Never describe the work as easy, simple, quick, or fun.
- Assume the reader is intelligent and is not confused about the subject.
  They are stuck on the shape of the task, not on the ideas in it.`;

/**
 * The language instruction.
 *
 * Deliberately explicit about register rather than only naming the language.
 * Spanish has a formality choice English does not, and a model left to guess
 * reaches for `usted` — which puts a desk between a 13-year-old and the tool
 * that is supposed to be theirs. The tú instruction is the same decision made
 * in `web/src/lib/i18n.tsx`, and the two have to agree or the interface and
 * its content will address the same student two different ways on one screen.
 */
const LANGUAGE = {
  en: `
Write in English.`,
  es: `
Write everything in Spanish (español). This includes every string inside any
JSON you return — keys stay in English, values are Spanish.
Address the student as tú, never usted. Use neutral phrasing rather than
gendered adjectives about the student: you do not know their gender and must
not guess it. No exclamation marks, which in Spanish means no ¡ either.`,
};

/** Builds the system prompt from the student's own profile directives. */
export function systemFor(student, profile, lang = "en") {
  const directives = profile?.directives ?? [];
  const lines = directives.length
    ? directives.map((d) => `- ${d}`).join("\n")
    : "- No directives recorded yet. Keep everything short and literal.";

  return `You are the reasoning layer inside Ritmo, a study tool whose primary
users are neurodivergent students aged 9 to 18.

This student wrote the following instructions for you. They override your own
defaults. If one of them conflicts with what you would normally do, follow the
student.

${lines}

Age band: ${student.ageBand}. Preferred format: ${student.defaultFormat}.
${HOUSE_STYLE}
${LANGUAGE[lang] ?? LANGUAGE.en}`;
}

export function decomposePrompt(rawText) {
  return `Here is an assignment exactly as the student received it.

<assignment>
${rawText}
</assignment>

School assignments carry expectations that are never written down. A word like
"discuss" or "explore" assumes the reader already knows how long the answer
should be, what structure it needs, and when it is finished. That unwritten
layer is what you are going to make explicit.

Return only JSON, no prose around it, matching this shape:

{
  "title": "short name for this task, under 8 words",
  "subject": "school subject or null",
  "hiddenVerb": "what the assignment verb actually asks you to physically produce",
  "plainAsk": "one sentence, second person, what you are being asked to do",
  "definitionOfDone": "one sentence describing the state in which you can stop",
  "deliverables": ["each separate thing that must exist when you are finished"],
  "trapWarnings": ["expectations the assignment assumes but never states"],
  "estimatedMinutes": 20,
  "steps": [
    { "text": "an action, not a goal", "estimatedSeconds": 120 }
  ]
}

Rules for steps:
- The first step must be doable in under 90 seconds and must require the
  student to make zero decisions. "Choose a topic" is a decision and is
  forbidden as a first step. "Write the assignment question at the top of a
  blank page, word for word" is not a decision and is allowed.
- Each step names one physical action with an observable end state.
- Six steps maximum. If the task needs more, make the steps larger.
- No step may reference other steps by number.`;
}

export function reformatPrompt(rawText, format) {
  const shapes = {
    skeleton: `A bare structural outline. Short lines. Nesting no deeper than two
levels. Strip every sentence that does not carry information.`,
    dialogue: `A conversation between two people working the problem out loud.
One asks the questions a confused reader would actually ask. The other answers
plainly. No narrator, no stage directions.`,
    map: `A spatial layout in text. Name the regions of the idea and what sits
inside each one, and state which regions connect and why. Describe position and
containment, not sequence.`,
    comic: `Six panels. For each panel give a one-line description of what is
shown and one line of caption. Concrete images only, no abstractions.`,
    audio: `A script to be read aloud. Sentences under 20 words. One idea per
sentence. Mark a line break wherever a listener would need a breath.`,
  };

  return `Rewrite the material below in this shape:

${shapes[format] ?? shapes.skeleton}

Keep every fact. Do not add facts. Do not summarise away difficulty: if an idea
is hard, it stays hard, it just changes shape. Return only the rewritten text.

<material>
${rawText}
</material>`;
}

export function insightPrompt(summary) {
  return `Here is aggregate data from one student's sessions.

<data>
${JSON.stringify(summary, null, 2)}
</data>

Write up to three observations this student could hand to a teacher as evidence
for an accommodation. Each observation must be something the data actually
supports, written in second person, with the evidence named.

Do not write anything the data does not show. If the data is too thin for an
observation, return fewer, or return an empty array.

Return only JSON:
[{ "kind": "format|pacing|initiation|intervention", "statement": "...",
   "evidence": "...", "confidence": 0.0 }]`;
}
