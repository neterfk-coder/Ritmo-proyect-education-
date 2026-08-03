import { useEffect, useRef } from "react";
import type { FrictionReading } from "../lib/types";

/**
 * What appears when friction crosses this student's own threshold.
 *
 * Three rules, all of them from testers:
 *   1. It never says what it thinks is wrong with you. It names what is
 *      happening on the page ("this one has been open a while"), not a state
 *      of mind ("you seem frustrated"). Being diagnosed by software is the
 *      fastest way to lose someone.
 *   2. The options were written by the student during onboarding, before they
 *      ever needed them. Nothing here is a suggestion from us.
 *   3. Dismissing is a first-class option, not a small grey x. If we were
 *      wrong to interrupt, saying so should be the easiest thing on screen —
 *      and it raises the threshold so we interrupt less next time.
 */
export function InterventionSheet({
  reading, onChoose, onDismiss,
}: {
  reading: FrictionReading;
  onChoose: (key: string) => void;
  onDismiss: () => void;
}) {
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    first.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Options"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 rise"
    >
      <div className="mx-auto max-w-reading panel p-5 sm:p-6 space-y-4 shadow-lg">
        <span className="panel-legend">Noticed</span>
        <span className="panel-meta" title="Score against your own threshold">
          {reading.score.toFixed(2)} / {reading.threshold.toFixed(2)}
        </span>

        <p className="text-sm text-muted reading pt-1">
          This one has been open a while — {reading.reading}. Anything here help?
        </p>

        <div className="flex flex-col gap-1.5 stagger">
          {reading.options.map((option, i) => (
            <button
              key={option.key}
              ref={i === 0 ? first : undefined}
              onClick={() => onChoose(option.key)}
              className="group flex items-center gap-3 text-left px-3.5 py-3 rounded-card border
                         border-line text-[0.9375rem] hover:bg-raised hover:border-muted
                         transition-colors duration-200 ease-calm"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-line group-hover:bg-lit shrink-0
                           transition-colors duration-200"
              />
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button className="btn-bare" onClick={onDismiss}>
            No, I am fine — ask me less often
          </button>
          <span className="font-mono text-[0.6875rem] text-faint" aria-hidden>
            esc
          </span>
        </div>
      </div>
    </div>
  );
}
