# Ritmo

**One step, lit.**

A study tool for neurodivergent students that does three things in order: works
out what an assignment is actually asking, hands back a single action small
enough to start without deciding anything, and — over time — builds a plain-
language description of how that particular student works, which the student
owns and can hand to a teacher.

Built for the IncludAI Neurodiversity Hackathon, Track 1: AI for K–12 Learning.

---

## Run it

Requires Node 20 or newer. No API key needed.

```bash
npm run setup     # installs, creates the SQLite database, seeds a demo student
npm run dev       # API on :4000, app on :5173
```

Open http://localhost:5173.

Without an `ANTHROPIC_API_KEY` the app runs on a deterministic offline engine
that exercises the same code paths and returns the same shapes as the model.
Every feature is demonstrable with no key, no network and no cost — which
matters when your testers are thirteen and your reviewer is opening the repo on
a train.

To use the real model:

```bash
cp .env.example server/.env
# set ANTHROPIC_API_KEY, then:
npm run dev
```

Useful extras:

```bash
npm run db:studio   # browse the database
npm run db:reset    # wipe and reseed
```

---

## Running it hosted

There is a deployed copy for people who want to click rather than clone. It
runs the same code against Postgres instead of a local SQLite file, which is a
weaker privacy position and the app says so out loud: `/api/health` reports
whether an instance is hosted, and the privacy page prints the promise that
actually applies rather than the flattering one.

If the privacy guarantee is the part you care about, run it yourself. Two
commands, no key, and the database is a file you own.

---

## What is in here

```
server/           Express + Prisma + SQLite
  prisma/         schema and seed
  src/ai/         prompts, model client, offline engine
  src/services/   friction scoring, profile computation
  src/routes/     students, tasks, sessions, profile
web/              React + Vite + Tailwind + TypeScript
  src/lib/        API client, friction tracker, speech
  src/components/ shell, step lantern, reader, intervention sheet
  src/pages/      onboarding, workspace, profile, privacy
docs/             architecture, co-design log, submission draft
```

---

## The four things this does differently

**It states when you are finished.** School assignments carry expectations that
are never written down. "Discuss" assumes you know how long, what structure,
and when to stop. The decompiler makes that layer explicit, and the definition
of done is the first thing on screen.

**It shows one step.** Twelve steps is an avalanche. Exactly one element in the
interface carries colour, and it is the action you are on right now. Task
initiation is a decision problem, so the first step is guaranteed to require
zero decisions.

**It notices you are stuck without watching you.** The obvious build is webcam
gaze tracking. Our testers rejected it in the first session and were clear
about why: being watched while struggling is the thing that makes struggling
worse. Friction is inferred from five interaction signals computed in the
browser and discarded after scoring. No camera, no keystroke log, no content.

**The student writes the model's instructions.** The profile is not a settings
panel. Its sentences are placed above everything we wrote, every time the model
runs, and the student can read, edit and delete each one. The same profile
exports as a one-page handover for a teacher — which is the difference between
a homework app and a self-advocacy tool.

---

## English and Spanish

The `EN / ES` pair in the header switches the whole product, and the choice is
remembered in the browser. It defaults to the browser's own language, so a
Spanish-speaking student never has to find a control written in English first.
It sits in the open rather than inside the Reading panel for the same reason: a
setting labelled in a language you cannot read is a setting you cannot find.

What actually changes, beyond the buttons:

- the steps an assignment is cut into, and the definition of done
- the guide's answers — all 29 topics, matched by a Spanish stemmer and stop
  list rather than a translated English one
- the observations on the profile, and the one-page handover for a teacher,
  including its date format
- which voice reads text aloud, and which language dictation listens for

What deliberately does **not** change: the sentences the student wrote
themselves. Their rules for the model are quoted, never rewritten — translating
somebody's own words when they flip a toggle is not translation, it is losing
their edits. A task also stays in the language it was opened in, because its
steps carry which ones are finished.

The browser sends `x-ritmo-lang` on every request; `server/src/lib/lang.js`
reads it. Both languages of a string live on adjacent lines in
`web/src/lib/strings.ts`, so a change to one that never reached the other shows
up in the diff.

---

## What is honest about the state of this

- The friction model is weighted heuristics with a per-student threshold that
  self-tunes on whether interventions get taken. It is not a trained classifier
  and we do not claim it is one.
- Reading-rate figures come from time-on-format, which is a proxy. It is enough
  to rank formats for one person; it is not a reading assessment.
- The offline engine's decomposition is template-driven. With a key, the same
  route calls the model. Both paths are in `server/src/ai/`.
- Six students used this. Three shaped the design directly. That is a pilot,
  not a study, and `docs/CO-DESIGN.md` says exactly who and exactly what changed.

---

## Licence

MIT. See `docs/CO-DESIGN.md` before you build on it — the design decisions in
there matter more than the code.
