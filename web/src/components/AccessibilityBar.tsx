import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useStudent } from "../state/StudentContext";
import type { Theme, Tint } from "../lib/types";

const THEMES: { key: Theme; label: string }[] = [
  { key: "calm", label: "Calm" },
  { key: "dark", label: "Dark" },
  { key: "contrast", label: "High contrast" },
];

const TINTS: { key: Tint; label: string; swatch: string }[] = [
  { key: "none", label: "None", swatch: "transparent" },
  { key: "amber", label: "Amber", swatch: "rgb(255 214 140)" },
  { key: "rose", label: "Rose", swatch: "rgb(255 196 202)" },
  { key: "mint", label: "Mint", swatch: "rgb(176 232 208)" },
  { key: "slate", label: "Slate", swatch: "rgb(176 198 224)" },
];

/**
 * Reading controls live in the header, not buried in a settings page, because
 * the moment a student needs them is the moment they are struggling to read.
 */
export function AccessibilityBar() {
  const { student, patch } = useStudent();
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
        Reading
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 card p-4 space-y-4 rise shadow-sm">
          <Group label="Surface">
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map((t) => (
                <Chip
                  key={t.key}
                  active={student.readingTheme === t.key}
                  onClick={() => patch({ readingTheme: t.key })}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </Group>

          <Group label="Overlay">
            <div className="flex gap-2">
              {TINTS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => patch({ readingTint: t.key })}
                  aria-label={t.label}
                  aria-pressed={student.readingTint === t.key}
                  className={`h-7 w-7 rounded-full border-2 transition-colors ${
                    student.readingTint === t.key ? "border-ink" : "border-line"
                  }`}
                  style={{ background: t.swatch }}
                />
              ))}
            </div>
          </Group>

          <Group label={`Line spacing · ${student.lineHeight.toFixed(1)}`}>
            <input
              type="range" min={1.4} max={2.4} step={0.1}
              value={student.lineHeight}
              onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
              className="w-full accent-pine"
            />
          </Group>

          <Group label={`Letter spacing · ${student.letterSpacing.toFixed(2)}em`}>
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
            Show how many steps are left
          </label>
          <p className="text-xs text-faint leading-relaxed">
            Off by default. Two testers said seeing the total made them stop before starting.
          </p>

          <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer border-t border-line pt-4">
            <input
              type="checkbox"
              checked={student.companionOn}
              onChange={(e) => patch({ companionOn: e.target.checked })}
              className="accent-pine h-4 w-4"
            />
            Show the guide
          </label>
          <p className="text-xs text-faint leading-relaxed">
            The owl on the right. It never speaks first — it waits to be opened.
          </p>

          <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={student.backdropOn}
              onChange={(e) => patch({ backdropOn: e.target.checked })}
              className="accent-pine h-4 w-4"
            />
            Moving background
          </label>
          <p className="text-xs text-faint leading-relaxed">
            It stays behind the cards, never under text. If your system asks for reduced motion it
            holds still on its own.
          </p>
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
