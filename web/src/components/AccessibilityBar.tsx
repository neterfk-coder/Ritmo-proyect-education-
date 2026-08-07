import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useStudent } from "../state/StudentContext";
import { useT } from "../lib/i18n";
import type { Key } from "../lib/i18n";
import type { Theme, Tint } from "../lib/types";

const THEMES: { key: Theme; label: Key }[] = [
  { key: "calm", label: "a11y.theme.calm" },
  { key: "dark", label: "a11y.theme.dark" },
  { key: "contrast", label: "a11y.theme.contrast" },
];

const TINTS: { key: Tint; label: Key; swatch: string }[] = [
  { key: "none", label: "a11y.tint.none", swatch: "transparent" },
  { key: "amber", label: "a11y.tint.amber", swatch: "rgb(255 214 140)" },
  { key: "rose", label: "a11y.tint.rose", swatch: "rgb(255 196 202)" },
  { key: "mint", label: "a11y.tint.mint", swatch: "rgb(176 232 208)" },
  { key: "slate", label: "a11y.tint.slate", swatch: "rgb(176 198 224)" },
];

/**
 * Reading controls live in the header, not buried in a settings page, because
 * the moment a student needs them is the moment they are struggling to read.
 *
 * Language is not in here. It sits outside as its own control, for the reason
 * written in `LangToggle.tsx`: a panel labelled "Reading" is unfindable to
 * somebody who cannot read that word.
 */
export function AccessibilityBar() {
  const { student, patch } = useStudent();
  const t = useT();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!student) return null;

  return (
    <div className="relative" ref={panel}>
      <button
        className="btn-quiet !px-3 !py-1.5 !text-xs"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {t("a11y.button")}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 card p-4 space-y-4 rise floating">
          <Group label={t("a11y.surface")}>
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map((option) => (
                <Chip
                  key={option.key}
                  active={student.readingTheme === option.key}
                  onClick={() => patch({ readingTheme: option.key })}
                >
                  {t(option.label)}
                </Chip>
              ))}
            </div>
          </Group>

          <Group label={t("a11y.overlay")}>
            <div className="flex gap-2">
              {TINTS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => patch({ readingTint: option.key })}
                  aria-label={t(option.label)}
                  aria-pressed={student.readingTint === option.key}
                  className={`h-7 w-7 rounded-full border-2 transition-colors ${
                    student.readingTint === option.key ? "border-ink" : "border-line"
                  }`}
                  style={{ background: option.swatch }}
                />
              ))}
            </div>
          </Group>

          <Group label={t("a11y.lineSpacing", { v: student.lineHeight.toFixed(1) })}>
            <input
              type="range" min={1.4} max={2.4} step={0.1}
              value={student.lineHeight}
              onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
              className="w-full accent-pine"
            />
          </Group>

          <Group label={t("a11y.letterSpacing", { v: student.letterSpacing.toFixed(2) })}>
            <input
              type="range" min={0} max={0.12} step={0.01}
              value={student.letterSpacing}
              onChange={(e) => patch({ letterSpacing: Number(e.target.value) })}
              className="w-full accent-pine"
            />
          </Group>

          <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={student.showStepCount}
              onChange={(e) => patch({ showStepCount: e.target.checked })}
              className="accent-pine h-4 w-4"
            />
            {t("a11y.showSteps")}
          </label>
          <p className="text-xs text-faint leading-relaxed">{t("a11y.showStepsNote")}</p>

          <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer border-t border-line pt-4">
            <input
              type="checkbox"
              checked={student.companionOn}
              onChange={(e) => patch({ companionOn: e.target.checked })}
              className="accent-pine h-4 w-4"
            />
            {t("a11y.guide")}
          </label>
          <p className="text-xs text-faint leading-relaxed">{t("a11y.guideNote")}</p>

          <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={student.backdropOn}
              onChange={(e) => patch({ backdropOn: e.target.checked })}
              className="accent-pine h-4 w-4"
            />
            {t("a11y.backdrop")}
          </label>
          <p className="text-xs text-faint leading-relaxed">{t("a11y.backdropNote")}</p>
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="eyebrow">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-1 text-xs rounded-card border transition-colors ${
        active ? "bg-ink text-surface border-ink" : "border-line text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
