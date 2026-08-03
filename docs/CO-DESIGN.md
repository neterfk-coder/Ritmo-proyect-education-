# Co-design log

> **This file is a template with the structure already in place. The names,
> quotes and numbers below are marked `[FILL]` and are yours to replace with
> what actually happened. Do not submit it with the placeholders in — a judging
> panel that includes a Stanford neurodiversity advisor and a clinical
> psychotherapist will spot invented user research immediately, and the honest
> version of a small pilot beats a fabricated large one every time.**
>
> The seed data in `server/prisma/seed.js` is illustrative demo data, clearly
> labelled as such. It is not evidence and must not be presented as evidence.

---

## Who

| Who | Age | Self-described | How involved | When |
| --- | --- | --- | --- | --- |
| `[FILL name or initial]` | `[FILL]` | `[FILL — their words, not a diagnosis you assign]` | Baseline + two test sessions | `[FILL date]` |
| `[FILL]` | `[FILL]` | `[FILL]` | Design session + final test | `[FILL date]` |
| `[FILL]` | `[FILL]` | `[FILL]` | Test session, async written feedback | `[FILL date]` |

Consent: `[FILL — who agreed to what, and whether a parent or guardian was
involved. If someone is happy to appear in the demo video, say so here.]`

---

## The protocol we ran

**Baseline, before any code.** Each tester worked on a real assignment of their
own for fifteen minutes with whatever they normally use. We recorded three
things and nothing else:

1. time from opening the assignment to writing the first word
2. number of times they switched away from the task
3. whether they finished, paused, or abandoned it

Baseline numbers:

| Tester | Time to first word | Switch-aways | Outcome |
| --- | --- | --- | --- |
| `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |

**Design session.** We showed paper sketches, not a prototype. The question was
never "do you like this" — it was "what would make you close this."

**Test session.** Same tester, comparable assignment, same three measures.

---

## What they said, and what changed because of it

This is the section that matters. Each entry needs the quote, the change, and
the commit.

### `[FILL — quote]`
**Changed:** `[FILL — the specific thing you removed or rebuilt]`
**Where:** `[FILL — file and commit]`

### `[FILL — quote]`
**Changed:** `[FILL]`
**Where:** `[FILL]`

---

## Design decisions that came from testers

These are already implemented, and each is written into the code as a comment
so nobody removes them later without knowing why:

- **The step total is hidden by default.** `web/src/components/AccessibilityBar.tsx`
- **No praise, no encouragement, no exclamation marks.** Written into the prompt
  house style: `server/src/ai/prompts.js`
- **No camera.** Friction is inferred from interaction only: `web/src/lib/friction.ts`
- **The intervention menu is written by the student during onboarding**, before
  they need it: `web/src/pages/Onboarding.tsx`
- **"No, I am fine" is a first-class button** and raises the threshold, so
  wrongly interrupting makes the tool interrupt less: `web/src/components/InterventionSheet.tsx`
- **Dismissed insights are never regenerated**: `server/src/services/profileEngine.js`
- **The sheet names what is happening on the page, never a state of mind.** It
  says "this one has been open a while", not "you seem frustrated."

Confirm each of these against what your testers actually said. If a tester did
not ask for one of them, either get it confirmed in a session or take the
claim out of your submission.

---

## After

| Tester | Time to first word | Switch-aways | Outcome |
| --- | --- | --- | --- |
| `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |

**What we are not claiming.** `[FILL — write this section honestly. Three
testers over one week is a pilot. There is no control group, the testers knew
what we were hoping for, and the assignments were not identical. Say so.]`

---

## What we would do next with more than a week

`[FILL — two or three specific things, sized realistically.]`
