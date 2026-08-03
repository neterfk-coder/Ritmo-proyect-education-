import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useStudent } from "../state/StudentContext";
import type { Insight, LearningProfile } from "../lib/types";

/**
 * The page the whole product exists to fill in.
 *
 * Two things are happening here. One: the student can see, edit and delete
 * every sentence the model has been given about them — there is no hidden
 * profile. Two: they can turn it into a page and hand it to a teacher, which
 * is the difference between a homework app and a self-advocacy tool.
 */
export function Profile() {
  const { student } = useStudent();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stats, setStats] = useState({ sessions: 0, finished: 0 });
  const [directives, setDirectives] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [exported, setExported] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!student) return;
    api.getProfile(student.id).then((data) => {
      setProfile(data.profile);
      setInsights(data.insights);
      setStats(data.stats);
      setDirectives(data.profile?.directives ?? []);
    });
  }, [student?.id]);

  if (!student) return null;

  const saveDirectives = async (next: string[]) => {
    setDirectives(next);
    await api.saveDirectives(student.id, next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="mx-auto max-w-page px-6 py-12 sm:py-16 space-y-16">
      <header className="max-w-reading space-y-4">
        <p className="eyebrow">
          {stats.sessions} sessions recorded · {stats.finished} finished
        </p>
        <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight">How I work</h1>
        <p className="text-muted reading">
          Everything on this page came from your own sessions. Nothing here was assumed about you
          before you started.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="eyebrow">What the sessions show</h2>
        {insights.length === 0 ? (
          <p className="text-muted reading max-w-reading">
            Not enough yet. Finish two or three tasks and observations will appear here, each with
            the evidence attached.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 stagger">
            {insights.map((insight) => (
              <li
                key={insight.id}
                className="card p-5 space-y-3 hover:border-muted transition-colors duration-200 ease-calm"
              >
                <p className="reading text-[1.0625rem]">{insight.statement}</p>
                <div className="flex items-end justify-between gap-4 pt-1">
                  <p className="text-xs text-faint reading">{insight.evidence}</p>
                  <button
                    className="btn-bare !text-xs shrink-0"
                    onClick={() => {
                      api.dismissInsight(insight.id);
                      setInsights((prev) => prev.filter((i) => i.id !== insight.id));
                    }}
                  >
                    Not true
                  </button>
                </div>
                <Meter value={insight.confidence} />
              </li>
            ))}
          </ul>
        )}
        {insights.length > 0 && (
          <p className="text-xs text-faint max-w-reading reading">
            The bar is how confident the calculation is, not how true it is. If an observation is
            wrong, mark it. Dismissed observations are never generated again.
          </p>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-baseline gap-4 flex-wrap">
          <h2 className="eyebrow">The instructions the model gets</h2>
          {saved && <span className="text-xs text-pine">saved</span>}
        </div>
        <p className="text-muted reading max-w-reading text-sm">
          These sentences are placed above everything we wrote, every time the model runs. This is
          the whole prompt as far as your preferences go — there is no second, hidden version.
        </p>
        <ul className="space-y-2 max-w-reading">
          {directives.map((rule, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <span className="font-mono text-xs text-faint pt-1.5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="reading text-[0.9375rem] flex-1">{rule}</span>
              <button
                className="btn-bare !text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={() => saveDirectives(directives.filter((_, j) => j !== i))}
              >
                remove
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 max-w-reading">
          <input
            className="field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a rule"
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                saveDirectives([...directives, draft.trim()]);
                setDraft("");
              }
            }}
          />
          <button
            className="btn-quiet shrink-0"
            onClick={() => {
              if (!draft.trim()) return;
              saveDirectives([...directives, draft.trim()]);
              setDraft("");
            }}
          >
            Add
          </button>
        </div>
      </section>

      {profile && (
        <section className="space-y-5">
          <div className="flex items-baseline gap-4 flex-wrap">
            <h2 className="eyebrow">Measured</h2>
            <span className="font-mono text-[0.6875rem] text-faint">
              from {profile.sessionsAnalysed} {profile.sessionsAnalysed === 1 ? "session" : "sessions"}
            </span>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3 stagger">
            <Stat
              label="Focus block"
              value={profile.bestBlockMinutes ? `${profile.bestBlockMinutes}` : "—"}
              unit={profile.bestBlockMinutes ? "min" : undefined}
              note="Before friction starts to rise"
            />
            <Stat
              label="Time to start"
              value={
                profile.medianFirstActionMs
                  ? `${Math.round(profile.medianFirstActionMs / 1000)}`
                  : "—"
              }
              unit={profile.medianFirstActionMs ? "s" : undefined}
              note="From opening a task to first action"
            />
            <Stat
              label="Reading rate"
              value={profile.readingRateWpm ? `${Math.round(profile.readingRateWpm)}` : "—"}
              unit={profile.readingRateWpm ? "wpm" : undefined}
              note={
                profile.fastestFormat
                  ? `Fastest in ${profile.fastestFormat} form`
                  : "Median across every format"
              }
            />
          </dl>
          <p className="text-xs text-faint reading max-w-reading">
            A dash means there is not enough recorded to say yet. We would rather show nothing than
            show a default and call it a measurement.
          </p>
        </section>
      )}

      <section className="space-y-5 border-t border-line pt-12">
        <h2 className="font-display text-2xl">Give it to a teacher</h2>
        <p className="text-muted reading max-w-reading">
          One page, in your words, with the evidence attached. This is the only way anything here
          leaves your account, and it only happens when you press this.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["teacher", "family", "self"] as const).map((audience) => (
            <button
              key={audience}
              className="btn-quiet"
              onClick={async () => setExported((await api.exportProfile(student.id, audience)).body)}
            >
              For {audience === "self" ? "myself" : `my ${audience}`}
            </button>
          ))}
        </div>

        {exported && (
          <div className="space-y-3 rise">
            <pre className="card p-6 whitespace-pre-wrap font-sans text-[0.9375rem] reading max-w-reading">
              {exported}
            </pre>
            <div className="flex gap-3">
              <button
                className="btn-quiet"
                onClick={() => navigator.clipboard.writeText(exported)}
              >
                Copy
              </button>
              <button className="btn-quiet" onClick={() => window.print()}>
                Print
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label, value, unit, note,
}: { label: string; value: string; unit?: string; note: string }) {
  return (
    <div className="panel p-5 space-y-2">
      <dt className="panel-legend">{label}</dt>
      <dd className="flex items-baseline gap-1.5 pt-1">
        <span className="font-display text-[2.5rem] leading-none tabular-nums">{value}</span>
        {unit && <span className="font-mono text-xs text-faint">{unit}</span>}
      </dd>
      <p className="text-xs text-faint reading">{note}</p>
    </div>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <div
      className="h-px bg-line"
      role="img"
      aria-label={`confidence ${Math.round(value * 100)} percent`}
    >
      <div
        className="h-px bg-muted transition-[width] duration-700 ease-calm"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}
