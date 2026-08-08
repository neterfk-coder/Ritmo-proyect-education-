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
Conjugate for tú, never usted — but drop the pronoun itself. Spanish carries
the person in the verb ending, so writing it out lands on the reader as
emphasis or as a translation from English, and doing it in every sentence is
the clearest sign of machine text there is.

  BAD:  "tú calculas a qué hora un tren alcanza a otro"
  GOOD: "calcula a qué hora un tren alcanza a otro"

  BAD:  "tú puedes parar cuando tú tienes la hora"
  GOOD: "puedes parar cuando tengas la hora"

Use neutral phrasing rather than gendered adjectives about the student: you do
not know their gender and must not guess it. No exclamation marks, which in
Spanish means no ¡ either.`,
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
levels. Every line carries something the line above it did not.`,
    dialogue: `A conversation between two people working it out loud. One asks
the questions a confused reader would actually ask — including the ones they
would be embarrassed to ask. The other answers plainly. No narrator, no stage
directions.

Start every line with the speaker, "A." or "B.", and alternate. A reader who
cannot tell who is talking is reading a wall, and that is the reader this
shape exists for.`,
    map: `A spatial layout in text, not a description of one. Put each region
on its own line in capitals, and indent what sits inside it beneath. Say which
regions connect and why. Position and containment, never sequence.

Like this, and not as prose about regions:

CENTRE — the thing everything else hangs off
  the claim itself
AROUND IT — what holds it up
  · first support
  · second support
EDGES — what you can come back to`,
    comic: `Six panels, numbered. For each panel give a one-line description of
what is shown and one line of caption, both labelled:

PANEL 1
  Shows: one concrete image
  Caption: the line that goes with it

Concrete images only, no abstractions.`,
    audio: `A script to be read aloud. Sentences under 20 words. One idea per
sentence. Mark a line break wherever a listener would need a breath.`,
  };

  /*
    Long material gets reshaped; a short problem statement gets unpacked. The
    same instruction cannot serve both, and treating the second like the first
    is what produced outlines saying the same three things three times.

    200 characters, not 400. The first attempt at this used 400 and swept in a
    three-hundred-character assignment brief with real content, which then came
    back as explanatory prose with no panels in it at all — the unpacking
    instruction had quietly overridden the shape. A genuine one-line problem is
    well under two hundred.
  */
  const thin = rawText.trim().length < 200;

  const job = thin
    ? `This is short — a problem statement or a brief instruction rather than a
body of material. Reshaping it alone would just permute the same few words, so
what goes into the shape is an unpacking of it:

- name what you are given, separately from what you are asked for
- say what each technical term in it actually means, in plain words
- make the relationship between the parts explicit
- state anything the wording assumes the reader already knows

Never repeat a fact you have already stated in a different arrangement. If you
find yourself with nothing new to add, stop — a short honest answer is better
than a padded one, and padding is what makes a student stop trusting this.

Do NOT solve it. Do not compute the answer, choose the numbers, or write the
thing being asked for. Explaining what the question means is help; doing it is
not, and there is a separate place in this product for the worked solution.`
    : `Keep every fact. Do not add facts about the subject. Do not summarise
away difficulty: if an idea is hard, it stays hard, it just changes shape.
Never restate the same point twice in a different arrangement.`;

  // The shape is stated last as well as first, because it is the instruction
  // that must survive: an unpacking that arrives as prose when six panels were
  // asked for has answered a question nobody put.
  return `Rewrite the material below in this shape:

${shapes[format] ?? shapes.skeleton}

${job}

The shape above is not optional. Whatever you put in it, it comes out in that
form — six panels stay six panels, an outline stays an outline, a script stays
a script.

This is displayed as plain text, not rendered as markdown, so any markdown you
write is shown to the student exactly as typed. Do not use *, -, +, #, or **
to mark structure — they appear on screen as literal asterisks and hashes over
their homework. Show nesting with indentation alone, and where a bullet is
genuinely needed use "·".

Return only the rewritten text, in the shape asked for.

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

/**
 * What to keep once the work is done.
 *
 * The steps get a student through tonight. This is the part that survives to
 * the exam, and it is the half of "teaching" the product did not do: it broke
 * a task down and never helped anybody retain what the task was about.
 *
 * The hard rule is that generic study advice is worthless here. "Use
 * flashcards" and "review regularly" are true of everything and therefore
 * about nothing — and a student who has just been given precise, specific help
 * with their assignment will read filler as the tool giving up. Every line has
 * to be about this content.
 */
export function studyPrompt(rawText) {
  return `Here is an assignment a student has been working on.

<assignment>
${rawText}
</assignment>

Produce three things that would help them still know this in a month.

Answer in exactly this shape, nothing else:

SUMMARY
one paragraph, four sentences at most, covering what this topic actually is —
not what the assignment asks. Somebody reading only this should understand the
subject well enough to follow a conversation about it.

POINTS
- between three and five lines
- each one a specific fact, relationship or distinction from THIS material
- the things that would cost marks to get wrong, not the things that are easy
- no line may restate another

REMEMBER
one technique, applied to this content rather than described in the abstract.
Build the actual thing: if it is an acronym, spell out the acronym; if it is
grouping, name the groups and what goes in each; if it is a comparison table,
give the rows. Two or three sentences.

Rules, all of them mandatory:
- Everything must come from this material. Do not invent facts to make a
  neater summary, and do not pad a section to fill it.
- No generic study advice. "Use flashcards", "review often", "make a mind map"
  with nothing in it — all forbidden. If a technique is named, it arrives
  already built out of this content.
- If the assignment is too thin to support one of these sections honestly,
  write the section as a single short line saying so rather than inventing
  material. A short true answer is worth more than a full invented one.
- Do not solve the assignment. This is for remembering the subject, not for
  producing the thing being marked.
- Plain text. No markdown syntax — it is displayed exactly as typed.`;
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
