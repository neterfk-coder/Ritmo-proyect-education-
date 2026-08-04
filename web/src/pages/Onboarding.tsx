import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useStudent } from "../state/StudentContext";
import { FormatGlyph } from "../components/FormatGlyph";
import { LangToggle } from "../components/LangToggle";
import { useT } from "../lib/i18n";
import type { Key } from "../lib/i18n";
import type { Format } from "../lib/types";

/**
 * Onboarding is where the student writes the rules the model has to follow.
 *
 * The order matters. We ask for the rules before we ask for anything else,
 * because the point of the product is that the tool adapts to the person. If
 * the first screen were a task upload, the tool would be the subject and the
 * student would be the input.
 */

const SUGGESTED_RULES: Key[] = [
  "rule.1", "rule.2", "rule.3", "rule.4", "rule.5", "rule.6", "rule.7",
];

// Every option here is wired to a real action in Workspace.tsx. "Let me say
// it instead of typing" used to be on this list and was wired to nothing —
// see DEFAULT_INTERVENTIONS in server/src/routes/students.js for the story.
const OPTIONS: { key: string; label: Key }[] = [
  { key: "shrink", label: "iv.shrink" },
  { key: "readAloud", label: "iv.readAloud" },
  { key: "pause", label: "iv.pause" },
  { key: "reframe", label: "iv.reframe" },
  { key: "skip", label: "iv.skip" },
];

const FORMATS: { key: Format; label: Key }[] = [
  { key: "skeleton", label: "setup.fmt.skeleton" },
  { key: "dialogue", label: "setup.fmt.dialogue" },
  { key: "map", label: "setup.fmt.map" },
  { key: "comic", label: "setup.fmt.comic" },
  { key: "audio", label: "setup.fmt.audio" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { setStudent, signIn } = useStudent();
  const t = useT();

  const [alias, setAlias] = useState("");
  const [ageBand, setAgeBand] = useState<"elementary" | "middle" | "high">("middle");
  const [identifiesAs, setIdentifiesAs] = useState("");
  // Held as keys until they are written to the account. A student who switches
  // language mid-setup should see the checked rules follow, and the sentence
  // that reaches the model should be the one they could read when they chose it.
  const [ruleKeys, setRuleKeys] = useState<Key[]>([SUGGESTED_RULES[0], SUGGESTED_RULES[1]]);
  const [written, setWritten] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [keys, setKeys] = useState<string[]>(["shrink", "readAloud", "pause"]);
  const [format, setFormat] = useState<Format>("skeleton");
  const [existingId, setExistingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = <V extends string>(list: V[], set: (v: V[]) => void, value: V) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  /** The suggested rules first, in the order they are listed, then any typed. */
  const rules = [...ruleKeys.map((key) => t(key)), ...written];

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const student = await api.createStudent({
        alias: alias.trim() || t("setup.defaultAlias"),
        ageBand,
        identifiesAs: identifiesAs.trim() || null,
        defaultFormat: format,
        interventionKeys: keys,
        directives: rules,
      });
      setStudent(student);
      navigate("/work");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-reading px-6 py-16 sm:py-24 space-y-14">
      <header className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow">{t("setup.eyebrow")}</p>
          <LangToggle />
        </div>
        <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight">
          {t("setup.title")}
        </h1>
        <p className="text-muted reading">{t("setup.blurb")}</p>
      </header>

      <Section n="01" title={t("setup.q1")}>
        <input
          className="field max-w-xs"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder={t("setup.namePlaceholder")}
        />
        <div className="flex flex-wrap gap-2 pt-3">
          {(
            [
              ["elementary", "setup.band.elementary"],
              ["middle", "setup.band.middle"],
              ["high", "setup.band.high"],
            ] as const
          ).map(([band, label]) => (
            <Chip key={band} active={ageBand === band} onClick={() => setAgeBand(band)}>
              {t(label)}
            </Chip>
          ))}
        </div>
      </Section>

      <Section n="02" title={t("setup.q2")}>
        <div className="space-y-2">
          {SUGGESTED_RULES.map((rule) => (
            <label
              key={rule}
              className="flex items-start gap-3 text-[0.9375rem] reading cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={ruleKeys.includes(rule)}
                onChange={() => toggle(ruleKeys, setRuleKeys, rule)}
                className="mt-1.5 accent-pine h-4 w-4 shrink-0"
              />
              <span className="group-hover:text-ink transition-colors">{t(rule)}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 pt-3">
          <input
            className="field"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={t("setup.ownRule")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                setWritten([...written, custom.trim()]);
                setCustom("");
              }
            }}
          />
          <button
            className="btn-quiet shrink-0"
            onClick={() => {
              if (custom.trim()) { setWritten([...written, custom.trim()]); setCustom(""); }
            }}
          >
            {t("setup.add")}
          </button>
        </div>

        {/*
          The claim on this screen is that these sentences go to the model
          above everything we wrote. Showing them assembling, in the position
          they will actually occupy, is the difference between the student
          reading that claim and the student watching it be true.
        */}
        <div className="panel p-5 mt-6 space-y-3">
          <span className="panel-legend">{t("setup.willBeTold")}</span>
          <span className="panel-meta">{t("setup.ofYours", { n: rules.length })}</span>
          {rules.length === 0 ? (
            <p className="text-sm text-faint reading pt-1">{t("setup.noRules")}</p>
          ) : (
            <ol className="space-y-1.5 pt-1">
              {rules.map((rule, i) => (
                <li key={rule} className="rise flex items-start gap-3">
                  <span className="font-mono text-[0.6875rem] text-faint pt-1 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm reading flex-1">{rule}</span>
                  <button
                    className="btn-bare !text-xs shrink-0"
                    onClick={() =>
                      i < ruleKeys.length
                        ? setRuleKeys(ruleKeys.filter((_, j) => j !== i))
                        : setWritten(written.filter((_, j) => j !== i - ruleKeys.length))
                    }
                  >
                    {t("setup.remove")}
                  </button>
                </li>
              ))}
            </ol>
          )}
          <p className="text-xs text-faint reading border-t border-line pt-3">
            {t("setup.yoursWins")}
          </p>
        </div>
      </Section>

      <Section n="03" title={t("setup.q3")}>
        <p className="text-sm text-muted reading pb-1">{t("setup.q3blurb")}</p>
        <div className="space-y-2">
          {OPTIONS.map((option) => (
            <label key={option.key} className="flex items-start gap-3 text-[0.9375rem] reading cursor-pointer">
              <input
                type="checkbox"
                checked={keys.includes(option.key)}
                onChange={() => toggle(keys, setKeys, option.key)}
                className="mt-1.5 accent-pine h-4 w-4 shrink-0"
              />
              {t(option.label)}
            </label>
          ))}
        </div>
      </Section>

      <Section n="04" title={t("setup.q4")}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FORMATS.map((f) => {
            const active = format === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFormat(f.key)}
                aria-pressed={active}
                className={`text-left rounded-card border p-3 space-y-2 transition-colors
                  duration-200 ease-calm ${
                    active
                      ? "bg-ink text-surface border-ink"
                      : "border-line text-muted hover:text-ink hover:border-muted hover:bg-raised"
                  }`}
              >
                <FormatGlyph format={f.key} />
                <span className={`block text-sm ${active ? "text-surface" : "text-ink"}`}>
                  {t(f.label)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-faint reading pt-3">{t("setup.fmtNote")}</p>
      </Section>

      <Section n="05" title={t("setup.q5")}>
        <input
          className="field"
          value={identifiesAs}
          onChange={(e) => setIdentifiesAs(e.target.value)}
          placeholder={t("setup.q5placeholder")}
        />
        <p className="text-xs text-faint pt-2 reading">{t("setup.q5note")}</p>
      </Section>

      {error && <p className="text-sm text-muted">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button className="btn-primary" onClick={create} disabled={busy}>
          {busy ? t("setup.starting") : t("setup.start")}
        </button>
        <details className="text-sm">
          <summary className="btn-bare cursor-pointer list-none">{t("setup.haveId")}</summary>
          <div className="flex gap-2 pt-3">
            <input
              className="field"
              value={existingId}
              onChange={(e) => setExistingId(e.target.value)}
              placeholder={t("setup.pasteId")}
            />
            <button
              className="btn-quiet shrink-0"
              onClick={() =>
                signIn(existingId.trim())
                  .then(() => navigate("/work"))
                  .catch((e) => setError(e.message))
              }
            >
              {t("setup.open")}
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="relative space-y-4 rise">
      <div className="flex items-baseline gap-4">
        {/* The numbering is real: this is a sequence and the order carries
            meaning. The rule below it makes the sequence visible as a spine
            rather than as five headings that happen to have numbers. */}
        <span className="font-mono text-xs text-faint pt-1 tabular-nums">{n}</span>
        <h2 className="font-display text-2xl leading-snug">{title}</h2>
      </div>
      <div
        aria-hidden
        className="hidden sm:block absolute left-[0.6rem] top-9 bottom-0 w-px bg-line"
      />
      <div className="pl-0 sm:pl-10">{children}</div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 text-sm rounded-card border transition-colors duration-200 ease-calm ${
        active ? "bg-ink text-surface border-ink" : "border-line text-muted hover:text-ink hover:border-muted"
      }`}
    >
      {children}
    </button>
  );
}
