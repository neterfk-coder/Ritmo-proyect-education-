# Devpost submission draft

Fill the bracketed parts, paste into the Devpost form. Keep the structure —
it maps onto the judging criteria in the order they are weighted.

---

## Elevator pitch (one line)

Ritmo works out what an assignment is actually asking, hands back one step
small enough to start, and turns what it learns into a page you can give your
teacher.

---

## The problem

Most AI study tools help a student who is stuck on the ideas. A large number of
neurodivergent students are not stuck on the ideas — they are stuck on the
shape of the task. "Discuss the causes" assumes you already know how long, what
structure, and how you would know you were finished. That layer is never
written down, and for a student who does not infer it, the work does not start.

The second failure is the interface itself. Showing twelve steps to someone with
a task-initiation difficulty is not helpful information, it is an avalanche.

`[FILL — one sentence from a real tester describing this in their own words.]`

---

## Who it is for

Neurodivergent students aged roughly 9 to 18, working on their own homework.
The primary user is the student, not the teacher and not the parent. This is a
design constraint that shows up in the database schema: there is no table for
anyone who is not the student.

---

## How AI is used meaningfully

Four distinct jobs, not one chatbot:

1. **Decompiling.** The model extracts the hidden verb behind the assignment
   wording, the discrete deliverables, the unstated expectations, and a literal
   definition of done. It then produces micro-steps under one hard constraint:
   the first step must require zero decisions. Input can be pasted, dictated,
   or a PDF — read on the device, so the file itself never leaves it.
2. **Format transformation.** The same content is re-rendered as skeleton,
   dialogue, spatial map, six panels, or an ear-first script. Nothing is
   dropped between formats — if an idea is hard it stays hard, it changes shape.
3. **Profile synthesis.** Session data becomes plain-language observations with
   evidence attached, written in second person, ready to hand to a teacher.
4. **The worked solution, on request.** Opened deliberately, after the steps,
   and nothing is generated until it is — an answer produced alongside the steps
   and merely folded away would be one right-click from being read.

### What is actually novel here

**The direction of configuration is reversed.** Almost every AI tool in
education configures the model *about* the student — a reading level, a
diagnosis, a difficulty band inferred and applied to them. Here the student
writes the model's system prompt. "Never tell me how many steps are left." "Do
not encourage me." Those sentences sit above everything we wrote, on every
call, and the student can read, edit and delete each one. There is no hidden
second version, and the page that holds them says so. That is not a settings
panel with better copy; it is the opposite relationship.

**The model's job is to expose a contract, not to answer.** Most study tools
summarise or solve. This one decompiles the *expectations* — that "discuss"
means "write several paragraphs putting two or more positions next to each
other", and that you may stop when two named causes and their sources are on
the page. The unstated layer is the actual barrier for the students this is
for, and it is the layer nothing else names.

**Refusal is designed in, and enforced per task type.** The guide answers about
the tool and declines the homework. The solution engine decides whether the
task has a determinate answer — an equation gets worked line by line; an essay
gets the technique demonstrated on a different example and a plain statement of
why. An AI study tool that will not write your essay is an unusual position and
a deliberate one.

**It degrades to fully working, not to broken.** With no key the same code
paths run a deterministic engine and every feature stays usable, offline and
free. That is an equity property before it is a technical one: a student
without a paid API key gets the whole product, not a teaser. Model failures
fall back rather than surfacing as errors.

**The whole of it is bilingual, including the parts the model writes.** English
and Spanish for the interface, the decomposed steps, the guide, the
observations, and the page handed to a teacher — plus voice selection for
read-aloud and dictation. A toggle that repaints the chrome and leaves the
generated content in English is a translated menu bar, not a bilingual tool.

---

## Neurodivergent users in the design

`[FILL — this is worth roughly a quarter of the score. Name who, say what they
told you, and name the specific thing you changed because of it. See
docs/CO-DESIGN.md. One concrete "we removed our favourite feature because a
tester said it felt patronising" is worth more than a paragraph of process.]`

`[FILL — if you or a teammate are neurodivergent, say so plainly here. It also
makes the project eligible for the Neurodivergent Innovator prize.]`

---

## Impact, measured

`[FILL — before and after numbers from docs/CO-DESIGN.md. Time to first word,
switch-aways, completion. Small honest numbers with a named method beat large
vague ones.]`

`[FILL — and then the limits: pilot size, no control, testers knew what you
were hoping for.]`

---

## Technical execution

React + TypeScript + Vite + Tailwind on the front, Express + Prisma + SQLite
behind it. Runs with no API key on a deterministic offline engine that
exercises the same code paths, so it is reviewable in two commands.

Friction detection is five interaction signals computed in the browser,
weighted, and compared against a per-student threshold that self-tunes on
whether offers get taken. It is heuristics, and we say so in the README rather
than calling it a model.

---

## What is honest about this

`[FILL — keep the README's honesty section here too. Judges respond to a team
that names its own limits before they have to find them.]`

---

## Demo video plan (3 minutes)

| Time | What is on screen |
| --- | --- |
| 0:00–0:20 | A real tester, in their own voice or their own words on screen, describing the problem. Not you pitching. |
| 0:20–1:50 | One unbroken take on a real assignment: decompile → definition of done → the one lit step → format switch → friction sheet appearing. |
| 1:50–2:20 | Co-design. Names, one quote, one thing you changed, one before/after number. Show the actual message from your tester. |
| 2:20–2:45 | Export the profile. Hand it to a teacher. This is the strongest thirty seconds you have. |
| 2:45–3:00 | The privacy position, said out loud: no camera, no dashboard, no engagement score. |

---

## Links

- Repository: https://github.com/neterfk-coder/Ritmo-proyect-education-
- Live: https://ritmo-smoky.vercel.app — opens on a landing page that runs the
  decompiler on a real assignment, then "go straight in" needs no account
- Demo video: `[FILL]`
- Track: AI for K–12 Learning
