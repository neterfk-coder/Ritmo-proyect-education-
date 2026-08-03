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

Three distinct jobs, not one chatbot:

1. **Decompiling.** The model extracts the hidden verb behind the assignment
   wording, the discrete deliverables, the unstated expectations, and a literal
   definition of done. It then produces micro-steps under one hard constraint:
   the first step must require zero decisions.
2. **Format transformation.** The same content is re-rendered as skeleton,
   dialogue, spatial map, six panels, or an ear-first script. Nothing is
   dropped between formats — if an idea is hard it stays hard, it changes shape.
3. **Profile synthesis.** Session data becomes plain-language observations with
   evidence attached, written in second person, ready to hand to a teacher.

The part we would point at: **the student's own sentences become the model's
system prompt.** Rules like "never tell me how many steps are left" and "do not
encourage me" are placed above everything we wrote, on every call, and the
student can read and edit each one. There is no hidden second version.

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

- Repository: `[FILL]`
- Demo video: `[FILL]`
- Track: AI for K–12 Learning
