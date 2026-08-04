import { FormatGlyph } from "./FormatGlyph";
import { useT } from "../lib/i18n";
import type { Key } from "../lib/i18n";
import type { Format } from "../lib/types";

const FORMATS: { key: Format; label: Key; blurb: Key }[] = [
  { key: "skeleton", label: "fmt.skeleton", blurb: "fmt.skeleton.blurb" },
  { key: "dialogue", label: "fmt.dialogue", blurb: "fmt.dialogue.blurb" },
  { key: "map", label: "fmt.map", blurb: "fmt.map.blurb" },
  { key: "comic", label: "fmt.comic", blurb: "fmt.comic.blurb" },
  { key: "audio", label: "fmt.audio", blurb: "fmt.audio.blurb" },
];

/**
 * Not an accessibility setting. A question: in which shape does this go in?
 * Nothing is dropped between formats — if an idea is hard it stays hard, it
 * just changes shape.
 *
 * Each option shows its shape and says what it is, because the point of the
 * switcher is that a student who does not yet know what "map" means here can
 * still pick it and find out. Nothing is hidden behind a hover.
 */
export function FormatSwitcher({
  value, onChange, fastest, busy,
}: {
  value: Format;
  onChange: (f: Format) => void;
  fastest?: Format | null;
  busy: boolean;
}) {
  const t = useT();

  return (
    <div className="space-y-3">
      <p className="eyebrow">{t("fmt.title")}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 stagger">
        {FORMATS.map((f) => {
          const active = value === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              disabled={busy}
              aria-pressed={active}
              className={`group relative text-left rounded-card border p-3 space-y-2
                transition-colors duration-200 ease-calm disabled:opacity-40
                disabled:cursor-not-allowed ${
                  active
                    ? "bg-ink text-surface border-ink"
                    : "border-line text-muted hover:text-ink hover:border-muted hover:bg-raised"
                }`}
            >
              <FormatGlyph format={f.key} />
              <div className="space-y-0.5">
                <p className={`text-sm ${active ? "text-surface" : "text-ink"}`}>{t(f.label)}</p>
                <p
                  className={`text-[0.6875rem] leading-snug ${
                    active ? "text-surface/70" : "text-faint"
                  }`}
                >
                  {t(f.blurb)}
                </p>
              </div>

              {fastest === f.key && !active && (
                <span
                  title={t("fmt.fastestTitle")}
                  className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-lit"
                >
                  <span className="sr-only">{t("fmt.fastestSr")}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {fastest && <p className="text-xs text-faint reading">{t("fmt.dotNote")}</p>}
    </div>
  );
}
