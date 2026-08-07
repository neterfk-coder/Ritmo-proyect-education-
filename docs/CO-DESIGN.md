# Co-design log

> **STATUS: INCOMPLETE — DO NOT SUBMIT WITH `[FILL]` STILL IN IT.**
>
> The decisions below are transcribed from the code, where each one is already
> recorded as a comment next to the thing it caused. Those are real and they are
> checkable — every entry names the file that implements it.
>
> What is missing is the human half: who these people are, when you met them,
> and the before/after numbers. Nobody can write that but you, and inventing it
> would be the fastest way to lose. A judging panel that includes a Stanford
> neurodiversity advisor and a clinical psychotherapist reads fabricated user
> research for a living.
>
> **Two testers documented honestly beats six invented ones.** If the real
> number is two, write two here and change the figure in `README.md` to match.
> The claim and the evidence have to be the same size.
>
> Confirm every quote below actually came from the person you attribute it to.
> If one did not, cut it — from this file, from the README, and from the
> interface copy that cites it.
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

Seven decisions, each traceable to a line of code that exists because of it.
Attribute each quote to a name from the table above before submitting.

### "It sounds fake and I stop trusting it"
*On praise and encouragement.*

**Changed:** Encouragement was removed from the product as a category, not
softened. The prompt house style now forbids praise, cheerleading, exclamation
marks and emoji outright, and forbids ever describing the work as easy, simple,
quick or fun. When a companion with motivational lines was later added, it was
written to be survivable by this tester — no praise for work that has not
happened, nothing that congratulates you for existing — and given an off switch.

**Where:** `server/src/ai/prompts.js` (HOUSE_STYLE), `web/src/lib/companion.ts`

---

### Being watched while struggling is what makes struggling worse
*On webcam attention tracking, rejected in the first session.*

**Changed:** The obvious build for this product is gaze tracking. It was
abandoned. Friction is inferred instead from five interaction signals computed
in the browser and discarded after scoring — what reaches the server is one
number and one signal name. No camera, no keystroke log, no content.

**Where:** `server/src/services/frictionEngine.js`, `web/src/lib/friction.ts`

---

### Twelve steps is not information, it is an avalanche
*Two of three testers closed the tab in their first session when shown a full
step list.*

**Changed:** Exactly one step is lit at a time and nothing ahead is drawn unless
asked for. The first step is guaranteed to require zero decisions, because task
initiation is a decision problem before it is a motivation one.

**Where:** `web/src/components/StepLantern.tsx`

---

### Seeing the total made them stop before starting
*Two testers, on the step counter.*

**Changed:** The step total is hidden by default and only the ground already
covered is drawn. A student who wants the count can turn it on. This is stated
in the interface itself, next to the switch, so the reason survives.

**Where:** `web/src/components/StepLantern.tsx` (Marks),
`web/src/components/AccessibilityBar.tsx`

---

### Not knowing when it is finished is a different problem from not knowing how
*The piece testers reacted to hardest.*

**Changed:** "You can stop when" is extracted explicitly, placed first, set in
the display face, and given the only full-width panel on the screen. School
assignments almost never state it; the decompiler makes that layer explicit.

**Where:** `web/src/components/ContractCard.tsx`, `server/src/ai/prompts.js`

---

### Being diagnosed by software is the fastest way to lose someone
*On what the interruption panel is allowed to say.*

**Changed:** The panel names what is happening on the page — "this one has been
open a while" — never a state of mind. It never says "you seem frustrated." The
options in it were written by the student during setup, before they needed
them, because deciding what helps is much harder in the moment.

**Where:** `web/src/components/InterventionSheet.tsx` (the three rules are written
at the top of the file), `web/src/pages/Onboarding.tsx` (section 03), and the
copy itself at `setup.q3blurb` in `web/src/lib/strings.ts`

---

### If the software is wrong about you, it should not argue
*On being interrupted at the wrong moment, and on incorrect observations.*

**Changed:** "No, I am fine" is a first-class button, not a grey dismiss, and
taking it raises this student's own threshold so the tool interrupts less from
then on. On the profile, an observation marked "Not true" is never generated
again.

**Where:** `web/src/components/InterventionSheet.tsx`,
`server/src/services/frictionEngine.js` (tuneThreshold),
`server/src/services/profileEngine.js`

---

## After

| Tester | Time to first word | Switch-aways | Outcome |
| --- | --- | --- | --- |
| `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |

**What we are not claiming.** This is a pilot, not a study. There is no control
group. The testers knew what we were hoping to see, which is the strongest bias
in this data and cannot be corrected for after the fact. The baseline and test
assignments were comparable but not identical, so the before/after numbers
describe two similar afternoons rather than a controlled comparison. `[FILL —
add the sample size and the time window in one sentence, and delete this
bracket.]`

The design decisions above are better evidenced than the numbers are: each one
is a specific thing a specific person said, and a specific thing that changed
because of it. That is what a one-week pilot can honestly produce.

---

## What we would do next with more than a week

`[FILL — two or three specific things, sized realistically. The obvious
candidates: run the baseline with someone who does not know what the tool is
meant to do; test the teacher handover with an actual teacher rather than
assuming it lands; and check whether the friction threshold self-tunes usefully
over more than a handful of sessions, which the current data cannot show.]`
