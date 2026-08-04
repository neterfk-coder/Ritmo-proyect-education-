import { useEffect, useState } from "react";
import { useT } from "../lib/i18n";
import type { Key } from "../lib/i18n";

/**
 * What is on screen while the assignment is being worked out.
 *
 * This used to be a disabled button reading "Working out what this asks…",
 * which for several seconds is indistinguishable from a page that has frozen.
 * A student who is not sure whether anything is happening presses again, or
 * leaves — and the wait lands at exactly the moment they have finally started.
 *
 * The lines below are the actual stages of the prompt, in order, so what is on
 * screen is true. There is no percentage and no time estimate: we do not know
 * how long a model will take, and inventing a bar that stalls at 90% teaches a
 * student not to believe the interface.
 */
const STAGES: Key[] = ["decomp.1", "decomp.2", "decomp.3", "decomp.4", "decomp.5"];

export function Decompiling() {
  const t = useT();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stops on the last line rather than looping. A cycle that starts over
    // says the work restarted, which is not what is happening.
    if (stage >= STAGES.length - 1) return;
    const timer = window.setTimeout(() => setStage((s) => s + 1), 1700);
    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <div className="panel p-6 sm:p-8 space-y-5 rise" role="status" aria-live="polite">
      <span className="panel-legend">{t("decomp.legend")}</span>

      <div className="flex items-center gap-1.5 pt-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="think-dot block h-1.5 w-1.5 rounded-full bg-lit"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>

      {/* Keyed so each line arrives rather than replacing the last in place. */}
      <p key={stage} className="step-in font-display text-xl leading-snug reading">
        {t(STAGES[stage])}
      </p>

      <ol className="space-y-1.5">
        {STAGES.slice(0, stage).map((line) => (
          <li key={line} className="settle flex items-baseline gap-3 text-sm text-faint">
            <span aria-hidden className="font-mono text-xs">✓</span>
            <span>{t(line)}</span>
          </li>
        ))}
      </ol>

      <p className="text-xs text-faint reading pt-1">{t("decomp.note")}</p>
    </div>
  );
}
