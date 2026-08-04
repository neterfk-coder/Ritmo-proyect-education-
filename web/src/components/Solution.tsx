import { useState } from "react";
import { api } from "../lib/api";
import { useT } from "../lib/i18n";

/**
 * The answer, behind a deliberate press.
 *
 * The rest of this product is built on not doing the student's work, and that
 * is still the argument. But a student who has attempted the steps and wants
 * to know whether they landed is asking something reasonable, and until now
 * the honest answer was "this cannot tell you" — which sent them to a tool
 * with no steps at all.
 *
 * Three things keep this from becoming a homework machine:
 *
 *   1. It is closed, it is below the steps, and it says so in the label. You
 *      reach it after the work, not instead of it.
 *   2. Nothing is generated until it is opened. An answer produced with the
 *      steps and merely folded away is one right-click from being read, which
 *      would make the deliberateness decorative.
 *   3. For an assignment that asks the student to produce something original,
 *      the server refuses to write it and demonstrates the technique on a
 *      different example instead. That distinction is made by the model, in
 *      ai/prompts.js, because only it has read the task.
 */
export function Solution({ taskId }: { taskId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ kind: string; body: string } | null>(null);
  const [failed, setFailed] = useState(false);

  const toggle = async () => {
    if (open) return setOpen(false);
    setOpen(true);
    if (result || busy) return;

    setBusy(true);
    setFailed(false);
    try {
      const solved = await api.solveTask(taskId);
      setResult({ kind: solved.kind, body: solved.body });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-line pt-8">
      <button className="btn-quiet" onClick={toggle} aria-expanded={open}>
        {open ? t("solution.close") : t("solution.open")}
      </button>

      {!open && <p className="text-xs text-faint reading max-w-reading pt-3">{t("solution.note")}</p>}

      {open && (
        <div className="panel p-6 sm:p-7 mt-4 space-y-4 rise">
          <span className="panel-legend">{t("solution.legend")}</span>

          {busy && (
            <div className="flex items-center gap-2 pt-1" role="status" aria-live="polite">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="think-dot block h-1.5 w-1.5 rounded-full bg-lit"
                  style={{ animationDelay: `${i * 0.16}s` }}
                  aria-hidden
                />
              ))}
              <span className="text-sm text-muted">{t("solution.working")}</span>
            </div>
          )}

          {failed && <p className="text-sm text-muted reading">{t("solution.failed")}</p>}

          {result && (
            <>
              {/* Said before the content, not after it: a student scanning for
                  the answer has to read past the reason there is not one. */}
              {result.kind === "method" && (
                <p className="text-sm text-muted reading border-l-2 border-lit/50 pl-3">
                  {t("solution.methodNote")}
                </p>
              )}
              <pre className="whitespace-pre-wrap font-sans text-[0.9375rem] reading max-w-reading pt-1">
                {result.body}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
