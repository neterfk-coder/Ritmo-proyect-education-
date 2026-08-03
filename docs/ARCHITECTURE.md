# Architecture

## Shape

```
  browser                          server                        store
  ─────────────────────────        ────────────────────────      ──────────
  FrictionTracker  ──signals──▶    frictionEngine.score          FrictionEvent
       │                                  │                       (score + signal
       │                                  ▼                        name only)
       │                           Intervention menu
       ▼                                                          
  TaskIntake       ──raw text──▶   ai/decompose ──▶ model  ──▶    Task
                                                                  Decomposition
                                                                  MicroStep

  FormatSwitcher   ──format────▶   ai/reformat  ──▶ model  ──▶    Rendering (cached)
                   └─rate for the format being left ────────▶     ReadingSample

  Session end      ─────────────▶  profileEngine.recompute ──▶    LearningProfile
                                                                  Insight
                                          │
                                          ▼
                                   systemFor(student, profile)
                                          │
                                          └──▶ becomes the system prompt
                                               on the next model call
```

The loop is the product. Every model call is prefixed with sentences the
student wrote, and every finished session may change those sentences.

## Boundaries that were chosen deliberately

**No Teacher or Parent table.** Not omitted for scope — omitted so that the
feature cannot be added by writing a query. The only path by which anything
leaves a student's account is `ProfileExport`, which requires an explicit call
and writes an audit row.

**Telemetry is normalised in the browser.** `FrictionTracker` holds raw event
counts in a closure and emits five floats. The server never receives keystrokes,
content, timings per character, or anything that could reconstruct them.

**Model failures degrade to the offline engine, never to an error.** A student
staring at a blank page at 9pm should not meet a stack trace because a provider
was rate-limited. `decompose` and `reformat` both catch and fall through to
`ai/mock.js`. The client carries a 30-second timeout so a hung connection
reaches that fallback instead of hanging behind it.

**Renderings are cached per (task, format).** Switching format is a question,
not a command — students flip back and forth. The second look is free, and it
records a reading rate without closing the session: asking a question is not
the same as walking away from the task.

## Friction scoring

Five signals, weighted, summed, compared against a per-student threshold.

| signal        | weight | what it is                                        |
| ------------- | ------ | ------------------------------------------------- |
| `dwell`       | 0.30   | far past this student's own predicted block time  |
| `deleteBurst` | 0.25   | type, delete, type, delete                        |
| `idle`        | 0.20   | no input, window still focused                    |
| `tabAway`     | 0.15   | focus lost and stayed lost                        |
| `reread`      | 0.10   | scrolled back over passed material, repeatedly    |

`dwell` is scored against this student's own measured reading rate, not a
constant. A fixed expectation saturates the signal for exactly the readers this
is built for, so a slow reader would be interrupted for reading normally.

A `FrictionEvent` row is written only when the score crosses the threshold —
never once per sample. That distinction is load-bearing: the profile reads the
earliest row of a session as the moment focus broke, so a row per sample would
put that moment fifteen seconds into every session.

The threshold starts at 0.62 and moves. If fewer than 30% of offers are taken,
it rises — we were interrupting a person who was fine. Above 75%, it falls. A
student is never interrupted twice within three minutes, because repeated
interruption is itself a source of friction. Crossings suppressed by that
cooldown are still recorded; they are just not offered.

## Profile computation

`recomputeProfile` runs on session end over the last 40 closed sessions:

- **fastestFormat** — mean words-per-minute grouped by format, over every
  `ReadingSample` rather than one pair per session. Students flip between
  shapes mid-task, and ranking formats on whichever one happened to be open
  last would rank nothing.
- **readingRateWpm** — median across formats; sent back to the browser to
  calibrate dwell
- **bestBlockMinutes** — time from session start to first friction crossing.
  Null until there is something to measure: the UI shows a dash, because a
  default presented as a measurement is a lie.
- **medianFirstActionMs** — open to first real action
- **frictionThreshold** — retuned from intervention take-rate. `timesOffered`
  is counted when the menu appears, not when an option is picked, or every
  option looks like it was taken every time.

Insights are then generated (model, or the offline engine) and reconciled
against dismissals. A dismissed insight is never regenerated: if the student
says an observation about them is wrong, the software does not argue.

## Why SQLite

The database is a file on the student's machine. That is the strongest privacy
guarantee available at hackathon scale, and it is not a compromise: the schema
is normalised, migrated with Prisma, and moves to Postgres by changing one line
in `schema.prisma` if this ever needs a hosted deployment.
