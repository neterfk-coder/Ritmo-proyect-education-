import { useState } from "react";
import type { MicroStep } from "../lib/types";

/**
 * The signature element.
 *
 * Exactly one thing on this screen carries colour, and it is the step you are
 * on right now. Everything you have finished recedes to a rule; everything
 * ahead is not drawn at all unless you ask for it.
 *
 * This is not a stylistic choice. Showing twelve steps is the behaviour that
 * made two of our three testers close the tab in the first session. Task
 * initiation is a decision problem, so we remove the decision: there is one
 * action, it is small, and it is lit.
 *
 * What moves, and why it is allowed to: finishing a step has to feel like
 * something happened, or the student is left unsure whether the button worked.
 * The step folds up into the history, a mark lands, and the next one takes the
 * light. Three quarters of a second, once, in response to a press.
 */
export function StepLantern({
  steps, showCount, onDone, onSkip, onShrink, busy,
}: {
  steps: MicroStep[];
  showCount: boolean;
  onDone: (id: string) => void;
  onSkip: (id: string) => void;
  onShrink: (id: string) => void;
  busy: boolean;
}) {
  const [peeking, setPeeking] = useState(false);
  const active = steps.find((s) => s.status === "active");
  const done = steps.filter((s) => s.status === "done" || s.status === "skipped");
  const ahead = steps.filter((s) => s.status === "waiting");

  if (!active) {
    return (
      <section className="panel p-8 sm:p-10 text-center space-y-4 rise">
        <span className="panel-legend">Nothing left on the list</span>
        <Marks done={done.length} total={showCount ? steps.length : null} />
        <p className="font-display text-2xl leading-snug">That is everything on the list.</p>
        <p className="text-sm text-muted reading max-w-reading mx-auto">
          Read it once from the top. If it matches the line above, you are finished.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="The step you are on" className="space-y-5">
      {done.length > 0 && (
        <ol className="space-y-1.5">
          {done.map((step) => (
            <li
              key={step.id}
              className="settle flex items-baseline gap-3 text-sm text-faint"
            >
              <span aria-hidden className="font-mono text-xs">
                {step.status === "skipped" ? "—" : "✓"}
              </span>
              <span className="line-through decoration-line">{step.text}</span>
            </li>
          ))}
        </ol>
      )}

      {/*
        Keyed on the step id so the panel remounts when the step changes and
        the light visibly moves onto the new one. Without the key the text
        swaps in place and finishing a step looks like nothing happening.
      */}
      <div
        key={active.id}
        className="lantern panel ignite border-lit/40 p-6 sm:p-8 space-y-6"
        style={{ background: "rgb(var(--c-lit) / 0.045)" }}
      >
        <span className="panel-legend" style={{ color: "rgb(var(--c-lit))" }}>
          Do only this
        </span>
        <span className="panel-meta">
          about {Math.round(active.estimatedSeconds / 60) || 1} min
        </span>

        <p className="font-display text-[1.7rem] sm:text-[1.9rem] leading-[1.3] reading pt-1">
          {active.text}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary" onClick={() => onDone(active.id)} disabled={busy}>
            Done — next
          </button>
          <button className="btn-quiet" onClick={() => onShrink(active.id)} disabled={busy}>
            Too big
          </button>
          <button className="btn-quiet" onClick={() => onSkip(active.id)} disabled={busy}>
            Park it
          </button>
          <div className="ml-auto pl-2">
            <Marks done={done.length} total={showCount ? steps.length : null} />
          </div>
        </div>
      </div>

      {ahead.length > 0 && (
        <div>
          <button className="btn-bare" onClick={() => setPeeking((v) => !v)}>
            {peeking ? "Hide what is coming" : "Show what is coming"}
          </button>
          {peeking && (
            <ol className="mt-3 space-y-1.5 stagger">
              {ahead.map((step) => (
                <li key={step.id} className="text-sm text-faint reading">
                  {step.text}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Ground covered, drawn as marks rather than a number.
 *
 * It only ever draws what is behind you. An empty slot for every step ahead
 * would be the step total by another name, and the total is hidden by default
 * for a reason: seeing it made testers stop before starting. A student who has
 * asked for the count gets the remainder drawn hollow.
 */
function Marks({ done, total }: { done: number; total: number | null }) {
  if (done === 0 && !total) return null;
  const ahead = total ? Math.max(0, total - done) : 0;

  return (
    <p
      className="flex items-center gap-1.5"
      aria-label={total ? `${done} of ${total} steps behind you` : `${done} steps behind you`}
    >
      {Array.from({ length: done }, (_, i) => (
        <span
          key={`done-${i}`}
          aria-hidden
          className="mark-in block h-1.5 w-1.5 rounded-full bg-muted"
          style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}
        />
      ))}
      {Array.from({ length: ahead }, (_, i) => (
        <span
          key={`ahead-${i}`}
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full border border-line"
        />
      ))}
    </p>
  );
}
