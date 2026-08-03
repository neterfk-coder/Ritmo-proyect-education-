import { FormatGlyph } from "./FormatGlyph";
import type { Format } from "../lib/types";

const FORMATS: { key: Format; label: string; blurb: string }[] = [
  { key: "skeleton", label: "Skeleton", blurb: "Structure only" },
  { key: "dialogue", label: "Dialogue", blurb: "Two people working it out" },
  { key: "map", label: "Map", blurb: "Where things sit" },
  { key: "comic", label: "Panels", blurb: "Six pictures" },
  { key: "audio", label: "Read aloud", blurb: "Written for the ear" },
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
  return (
    <div className="space-y-3">
      <p className="eyebrow">Same words, different shape</p>

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
                <p className={`text-sm ${active ? "text-surface" : "text-ink"}`}>{f.label}</p>
                <p
                  className={`text-[0.6875rem] leading-snug ${
                    active ? "text-surface/70" : "text-faint"
                  }`}
                >
                  {f.blurb}
                </p>
              </div>

              {fastest === f.key && !active && (
                <span
                  title="You read fastest in this one"
                  className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-lit"
                >
                  <span className="sr-only">your fastest format</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {fastest && (
        <p className="text-xs text-faint reading">
          The dot marks the format you read fastest, measured from your own sessions.
        </p>
      )}
    </div>
  );
}
