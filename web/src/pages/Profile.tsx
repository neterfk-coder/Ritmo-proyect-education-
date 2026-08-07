import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useStudent } from "../state/StudentContext";
import { useDocumentTitle } from "../lib/title";
import { useT } from "../lib/i18n";
import type { T } from "../lib/i18n";
import { formatName, interventionLabel } from "../lib/labels";
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
  const { student, setIntervention } = useStudent();
  const t = useT();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stats, setStats] = useState({ sessions: 0, finished: 0 });
  const [directives, setDirectives] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [exported, setExported] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useDocumentTitle(t("profile.title"));

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
      {/*
        Once a page has been generated for a teacher, printing should produce
        that page and nothing else. Before then, printing the profile itself is
        a reasonable thing to want, so the class only appears when there is an
        export on screen to take precedence over it.
      */}
      <header className={`max-w-reading space-y-4 ${exported ? "no-print" : ""}`}>
        <p className="eyebrow">
          {t("profile.sessions", { n: stats.sessions, f: stats.finished })}
        </p>
        <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight">
          {t("profile.title")}
        </h1>
        <p className="text-muted reading">{t("profile.blurb")}</p>
      </header>

      <section className={`space-y-6 ${exported ? "no-print" : ""}`}>
        <h2 className="eyebrow">{t("profile.whatShow")}</h2>
        {insights.length === 0 ? (
          <p className="text-muted reading max-w-reading">{t("profile.notEnough")}</p>
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
                    {t("profile.notTrue")}
                  </button>
                </div>
                <Meter t={t} value={insight.confidence} />
              </li>
            ))}
          </ul>
        )}
        {insights.length > 0 && (
          <p className="text-xs text-faint max-w-reading reading">{t("profile.barNote")}</p>
        )}
      </section>

      <section className={`space-y-5 ${exported ? "no-print" : ""}`}>
        <div className="flex items-baseline gap-4 flex-wrap">
          <h2 className="eyebrow">{t("profile.instructions")}</h2>
          {saved && <span className="text-xs text-pine">{t("profile.saved")}</span>}
        </div>
        <p className="text-muted reading max-w-reading text-sm">{t("profile.instructionsNote")}</p>
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
                {t("profile.remove")}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 max-w-reading">
          <input
            className="field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("profile.addRule")}
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
            {t("profile.add")}
          </button>
        </div>
      </section>

      {/*
        The stuck-moment options, editable after the fact.

        The guide has always told students they could change these "from your
        account settings". There were no such settings — the endpoint and the
        API method existed, and nothing on any screen called them. It sits here
        rather than in the Reading panel because this is the page about how the
        student works, and "what I want when I stall" is that, not a display
        preference.

        It matters more now than it did: the withdrawn dictation option means
        some accounts were left with a shorter list than they chose, and this
        is where they can see and fix what they actually have.
      */}
      <section className={`space-y-5 ${exported ? "no-print" : ""}`}>
        <h2 className="eyebrow">{t("profile.whenStuck")}</h2>
        <p className="text-muted reading max-w-reading text-sm">
          {t("profile.whenStuckNote")}
        </p>
        <ul className="space-y-2 max-w-reading">
          {student.interventions.map((option) => (
            <li key={option.key}>
              <label className="flex items-start gap-3 text-[0.9375rem] reading cursor-pointer group">
                <input
                  type="checkbox"
                  checked={option.enabled}
                  onChange={(e) => setIntervention(option.key, e.target.checked)}
                  className="mt-1.5 accent-pine h-4 w-4 shrink-0"
                />
                <span className="group-hover:text-ink transition-colors">
                  {interventionLabel(t, option.key, option.label)}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {student.interventions.every((i) => !i.enabled) && (
          <p className="text-xs text-faint reading max-w-reading">
            {t("profile.whenStuckNone")}
          </p>
        )}
      </section>

      {profile && (
        <section className={`space-y-5 ${exported ? "no-print" : ""}`}>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h2 className="eyebrow">{t("profile.measured")}</h2>
            <span className="font-mono text-[0.6875rem] text-faint">
              {profile.sessionsAnalysed === 1
                ? t("profile.fromSession", { n: profile.sessionsAnalysed })
                : t("profile.fromSessions", { n: profile.sessionsAnalysed })}
            </span>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3 stagger">
            <Stat
              label={t("profile.focusBlock")}
              value={profile.bestBlockMinutes ? `${profile.bestBlockMinutes}` : "—"}
              unit={profile.bestBlockMinutes ? t("profile.unit.min") : undefined}
              note={t("profile.focusBlockNote")}
            />
            <Stat
              label={t("profile.timeToStart")}
              value={
                profile.medianFirstActionMs
                  ? `${Math.round(profile.medianFirstActionMs / 1000)}`
                  : "—"
              }
              unit={profile.medianFirstActionMs ? t("profile.unit.sec") : undefined}
              note={t("profile.timeToStartNote")}
            />
            <Stat
              label={t("profile.readingRate")}
              value={profile.readingRateWpm ? `${Math.round(profile.readingRateWpm)}` : "—"}
              unit={profile.readingRateWpm ? t("profile.unit.wpm") : undefined}
              note={
                profile.fastestFormat
                  ? t("profile.fastestIn", { format: formatName(t, profile.fastestFormat) })
                  : t("profile.medianAcross")
              }
            />
          </dl>
          <p className="text-xs text-faint reading max-w-reading">{t("profile.dashNote")}</p>
        </section>
      )}

      <section className="space-y-5 border-t border-line pt-12 print:border-0 print:pt-0">
        <div className={exported ? "no-print" : ""}>
          <h2 className="font-display text-2xl">{t("profile.giveTeacher")}</h2>
          <p className="text-muted reading max-w-reading pt-3">{t("profile.givePage")}</p>
          <div className="flex flex-wrap gap-2 pt-5">
            {(
              [
                ["teacher", "profile.forTeacher"],
                ["family", "profile.forFamily"],
                ["self", "profile.forSelf"],
              ] as const
            ).map(([audience, label]) => (
              <button
                key={audience}
                className="btn-quiet"
                onClick={async () => setExported((await api.exportProfile(student.id, audience)).body)}
              >
                {t(label)}
              </button>
            ))}
          </div>
        </div>

        {exported && (
          <div className="space-y-3 rise">
            <pre className="card p-6 whitespace-pre-wrap font-sans text-[0.9375rem] reading max-w-reading">
              {exported}
            </pre>
            <div className="flex flex-wrap items-center gap-3 no-print">
              <button
                className="btn-quiet"
                onClick={() => navigator.clipboard.writeText(exported)}
              >
                {t("profile.copy")}
              </button>
              <button className="btn-quiet" onClick={() => window.print()}>
                {t("profile.print")}
              </button>
              <p className="text-xs text-faint reading">{t("profile.printNote")}</p>
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

function Meter({ t, value }: { t: T; value: number }) {
  return (
    <div
      className="h-px bg-line"
      role="img"
      aria-label={t("profile.confidence", { n: Math.round(value * 100) })}
    >
      <div
        className="h-px bg-muted transition-[width] duration-700 ease-calm"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}
