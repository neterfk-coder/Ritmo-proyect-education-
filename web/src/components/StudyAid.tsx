import { useState } from "react";
import { api } from "../lib/api";
import { useT } from "../lib/i18n";

/**
 * What is left in a month.
 *
 * The steps get a student through tonight, and until now that was the whole
 * product. Breaking a task down is half of teaching; the other half is helping
 * somebody keep what the task was about, and nothing here did that.
 *
 * Deliberately opened, like the solution, and for a different reason. There it
 * was to keep an answer from being read instead of attempted. Here it is that
 * this is the wrong thing to be looking at while you are still working — key
 * points and a summary compete with the one lit step, which is the thing this
 * product exists to protect.
 */
export function StudyAid({ taskId }: { taskId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    summary?: string;
    points?: string[];
    remember?: string;
    unavailable?: string;
  } | null>(null);
  const [failed, setFailed] = useState<null | "busy" | "broken">(null);

  const toggle = async () => {
    if (open) return setOpen(false);
    setOpen(true);
    if (result || busy) return;

    setBusy(true);
    setFailed(null);
    try {
      setResult(await api.studyTask(taskId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setFailed(/capacity|429/i.test(message) ? "busy" : "broken");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-line pt-8">
      <button className="btn-quiet" onClick={toggle} aria-expanded={open}>
        {open ? t("study.close") : t("study.open")}
      </button>

      {!open && <p className="text-xs text-faint reading max-w-reading pt-3">{t("study.note")}</p>}

      {open && (
        <div className="panel p-6 sm:p-7 mt-4 space-y-6 rise">
          <span className="panel-legend">{t("study.legend")}</span>

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
              <span className="text-sm text-muted">{t("study.working")}</span>
            </div>
          )}

          {failed && (
            <p className="text-sm text-muted reading">
              {t(failed === "busy" ? "solution.busy" : "solution.failed")}
            </p>
          )}

          {result?.unavailable && (
            <p className="text-sm text-muted reading whitespace-pre-wrap">{result.unavailable}</p>
          )}

          {result && !result.unavailable && (
            <>
              {result.summary && (
                <Block label={t("study.summary")}>
                  <p className="reading text-[0.9375rem]">{result.summary}</p>
                </Block>
              )}

              {result.points && result.points.length > 0 && (
                <Block label={t("study.points")}>
                  <ul className="space-y-2.5 stagger">
                    {result.points.map((point, i) => (
                      <li key={i} className="flex gap-3 text-[0.9375rem] reading">
                        <span
                          aria-hidden
                          className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-lit shrink-0"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              )}

              {result.remember && (
                <Block label={t("study.remember")}>
                  <p className="reading text-[0.9375rem] whitespace-pre-wrap">{result.remember}</p>
                </Block>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="eyebrow">{label}</p>
      {children}
    </div>
  );
}
