import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useStudent } from "../state/StudentContext";
import { FormatGlyph } from "../components/FormatGlyph";
import type { Format } from "../lib/types";

/**
 * Onboarding is where the student writes the rules the model has to follow.
 *
 * The order matters. We ask for the rules before we ask for anything else,
 * because the point of the product is that the tool adapts to the person. If
 * the first screen were a task upload, the tool would be the subject and the
 * student would be the input.
 */

const SUGGESTED_RULES = [
  "Never tell me how many steps are left.",
  "Do not encourage me. Just tell me the next thing.",
  "Short sentences. I lose long ones halfway through.",
  "Give me one thing at a time, even if it is slower.",
  "If I ask what finished looks like, answer literally.",
  "No metaphors. Say the actual thing.",
  "Do not tell me something is easy.",
];

const OPTIONS: { key: string; label: string }[] = [
  { key: "shrink", label: "Make this step smaller" },
  { key: "readAloud", label: "Read it to me" },
  { key: "speakInstead", label: "Let me say it instead of typing" },
  { key: "pause", label: "Two minutes away from this" },
  { key: "reframe", label: "Show it a different way" },
  { key: "skip", label: "Park this and come back" },
];

const FORMATS: { key: Format; label: string }[] = [
  { key: "skeleton", label: "A bare outline" },
  { key: "dialogue", label: "Two people talking it through" },
  { key: "map", label: "A map of where things sit" },
  { key: "comic", label: "Six panels" },
  { key: "audio", label: "Something to listen to" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { setStudent, signIn } = useStudent();

  const [alias, setAlias] = useState("");
  const [ageBand, setAgeBand] = useState<"elementary" | "middle" | "high">("middle");
  const [identifiesAs, setIdentifiesAs] = useState("");
  const [rules, setRules] = useState<string[]>([SUGGESTED_RULES[0], SUGGESTED_RULES[1]]);
  const [custom, setCustom] = useState("");
  const [keys, setKeys] = useState<string[]>(["shrink", "readAloud", "pause"]);
  const [format, setFormat] = useState<Format>("skeleton");
  const [existingId, setExistingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const student = await api.createStudent({
        alias: alias.trim() || "Me",
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
        <p className="eyebrow">Setting up</p>
        <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight">
          Before anything else, tell the tool how to talk to you.
        </h1>
        <p className="text-muted reading">
          What you choose here is not a preferences panel. These sentences are handed to the model
          as its instructions, ahead of everything we wrote. You can read them and change them at
          any time.
        </p>
      </header>

      <Section n="01" title="What should this call you?">
        <input
          className="field max-w-xs"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Any name. It never leaves this device."
        />
        <div className="flex flex-wrap gap-2 pt-3">
          {(["elementary", "middle", "high"] as const).map((band) => (
            <Chip key={band} active={ageBand === band} onClick={() => setAgeBand(band)}>
              {band === "elementary" ? "Primary" : band === "middle" ? "Middle" : "High school"}
            </Chip>
          ))}
        </div>
      </Section>

      <Section n="02" title="Your rules for the model">
        <div className="space-y-2">
          {SUGGESTED_RULES.map((rule) => (
            <label
              key={rule}
              className="flex items-start gap-3 text-[0.9375rem] reading cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={rules.includes(rule)}
                onChange={() => toggle(rules, setRules, rule)}
                className="mt-1.5 accent-pine h-4 w-4 shrink-0"
              />
              <span className="group-hover:text-ink transition-colors">{rule}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 pt-3">
          <input
            className="field"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Write your own rule"
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                setRules([...rules, custom.trim()]);
                setCustom("");
              }
            }}
          />
          <button
            className="btn-quiet shrink-0"
            onClick={() => { if (custom.trim()) { setRules([...rules, custom.trim()]); setCustom(""); } }}
          >
            Add
          </button>
        </div>

        {/*
          The claim on this screen is that these sentences go to the model
          above everything we wrote. Showing them assembling, in the position
          they will actually occupy, is the difference between the student
          reading that claim and the student watching it be true.
        */}
        <div className="panel p-5 mt-6 space-y-3">
          <span className="panel-legend">What the model will be told</span>
          <span className="panel-meta">{rules.length} of yours</span>
          {rules.length === 0 ? (
            <p className="text-sm text-faint reading pt-1">
              Nothing yet. With no rules it keeps everything short and literal.
            </p>
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
                    onClick={() => setRules(rules.filter((_, j) => j !== i))}
                  >
                    remove
                  </button>
                </li>
              ))}
            </ol>
          )}
          <p className="text-xs text-faint reading border-t border-line pt-3">
            These sit above our instructions on every call. Where they disagree, yours wins.
          </p>
        </div>
      </Section>

      <Section n="03" title="When you get stuck, what should appear?">
        <p className="text-sm text-muted reading pb-1">
          Choose now, while nothing is wrong. Deciding what helps is much harder in the moment.
        </p>
        <div className="space-y-2">
          {OPTIONS.map((option) => (
            <label key={option.key} className="flex items-start gap-3 text-[0.9375rem] reading cursor-pointer">
              <input
                type="checkbox"
                checked={keys.includes(option.key)}
                onChange={() => toggle(keys, setKeys, option.key)}
                className="mt-1.5 accent-pine h-4 w-4 shrink-0"
              />
              {option.label}
            </label>
          ))}
        </div>
      </Section>

      <Section n="04" title="Where do you want things to start?">
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
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-faint reading pt-3">
          You can change this on any task, as many times as you want. Nothing is dropped between
          shapes — if an idea is hard it stays hard, it just changes form.
        </p>
      </Section>

      <Section n="05" title="Anything you want it to know about you?">
        <input
          className="field"
          value={identifiesAs}
          onChange={(e) => setIdentifiesAs(e.target.value)}
          placeholder="Optional. Free text. Nothing here is a diagnosis field."
        />
        <p className="text-xs text-faint pt-2 reading">
          You can leave this empty and nothing about the tool changes. It is here because some
          people want to say it, not because we need it.
        </p>
      </Section>

      {error && <p className="text-sm text-muted">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button className="btn-primary" onClick={create} disabled={busy}>
          {busy ? "Setting up…" : "Start"}
        </button>
        <details className="text-sm">
          <summary className="btn-bare cursor-pointer list-none">I already have an account id</summary>
          <div className="flex gap-2 pt-3">
            <input
              className="field"
              value={existingId}
              onChange={(e) => setExistingId(e.target.value)}
              placeholder="Paste the id"
            />
            <button
              className="btn-quiet shrink-0"
              onClick={() =>
                signIn(existingId.trim())
                  .then(() => navigate("/work"))
                  .catch((e) => setError(e.message))
              }
            >
              Open
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
