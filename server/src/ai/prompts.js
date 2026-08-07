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
  "hiddenVerb": "SEE THE RULE BELOW — never a single verb",
  "plainAsk": "one sentence, second person, what you are being asked to do",
  "definitionOfDone": "one sentence describing the state in which you can stop",
  "deliverables": ["each separate thing that must exist when you are finished"],
  "trapWarnings": ["SEE THE RULE BELOW — each must be specific enough to act on"],
  "estimatedMinutes": 20,
  "steps": [
    { "text": "an action, not a goal", "estimatedSeconds": 120 }
  ]
}

Rule for hiddenVerb. This is the single most important field and the easiest to
get wrong. It must be a phrase describing the physical thing to produce and the
shape it takes. A bare verb is a failed answer, because it repeats the word the
student was already stuck on instead of decoding it.

  BAD:  "write"                      — this is the word they already read
  BAD:  "write a commentary"         — still their own wording, just longer
  GOOD: "write several paragraphs that put two or more positions next to each
         other, and say which you find stronger"

  BAD:  "analyse"
  GOOD: "break the thing into parts and say what each part does"

Read it back and ask: if the student already knew this much, would they still be
stuck? If yes, it is not decoded enough.

Rule for trapWarnings. Each one names something the assignment assumes and never
says, and each must be concrete enough to act on tonight. A warning the student
cannot do anything with is worse than none, because it adds worry without
adding direction.

  BAD:  "the response should be a reasonable length"
  GOOD: "No length is given. One page is the usual expectation unless your
         teacher said otherwise."

  BAD:  "you should support your points"
  GOOD: "Quoting the text is expected here even though it does not say so —
         at least one quotation per point you make."

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

/**
 * The worked solution, produced only when the student presses for it.
 *
 * The hard part of this prompt is not solving anything — it is the line between
 * two kinds of task that look identical when pasted in.
 *
 * A quadratic has an answer. Showing the working and stating x = 5 is what a
 * textbook's back pages have always done, and a student who has attempted the
 * steps and wants to know whether they landed is asking a reasonable question
 * that Ritmo previously could not answer at all.
 *
 * An essay has no answer. "Discuss the symbolism of water in 800 words" has an
 * artefact the student is being marked on producing, and writing it here would
 * not be checking their work, it would be replacing it. So that branch returns
 * the technique demonstrated on a deliberately different example, plus the
 * checks they can run against their own — useful, and not submittable.
 *
 * The model decides which it is, because only the model has read the task.
 */
export function solutionPrompt(rawText) {
  return `Here is an assignment a student has been working on. They have
already been given it broken into steps, have attempted it, and have now
deliberately asked to see the solution.

<assignment>
${rawText}
</assignment>

First decide which kind of task this is.

"worked" — the task has a determinate answer that can be checked: an equation,
a calculation, a conversion, a translation of a specific sentence, a factual
question with one correct response. Anything where two competent people would
produce the same result.

"method" — the task asks the student to produce something original that is
marked on their own thinking: an essay, an argument, an opinion, a piece of
creative writing, a design, a personal reflection. Anything where two competent
people would produce different work and both be right.

For "worked": show the working line by line, in order, then state the result
plainly. Name the rule or operation used at each line so the student can see
where their own attempt diverged. Do not skip the algebra. If there are several
parts, do all of them.

For "method": DO NOT write the thing they were asked to produce. That would be
doing the assignment, not showing a solution. Instead give:
  - the same technique demonstrated on a clearly different example of your own
  - a short list of concrete checks they can run against their own draft
State at the top, in one sentence, that this is a demonstration on a different
example because the assignment asks for their own work.

Answer in exactly this shape, and nothing else:

KIND: worked
---
the solution here, in plain text, across as many lines as it needs

Deliberately not JSON. The body of a solution is multi-line prose and working,
and a raw newline inside a JSON string is invalid JSON — asking for one is
asking for a malformed answer that loses the content it was carrying. The first
line names the kind, the marker ends the header, and everything after it is the
answer verbatim. No markdown headings, no bold, no code fences.`;
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
