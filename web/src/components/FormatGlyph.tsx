import type { Format } from "../lib/types";

/**
 * A mark per format, drawn as the shape the format actually is.
 *
 * The switcher used to be five words in five identical boxes, which asks the
 * student to read and compare before they can choose. A shape is recognised
 * before it is read. For a student who is already stuck, the difference
 * between recognising and reading is the difference between choosing and not.
 *
 * They carry no colour of their own — they take the ink of whatever they sit
 * inside, so the one-lit-element rule is never broken by an icon.
 */
export function FormatGlyph({ format }: { format: Format }) {
  return (
    <svg className="glyph" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {SHAPES[format]}
    </svg>
  );
}

const SHAPES: Record<Format, JSX.Element> = {
  // Structure only: lines that indent and stop early.
  skeleton: (
    <>
      <line x1="3" y1="4.5" x2="17" y2="4.5" />
      <line x1="6.5" y1="9" x2="17" y2="9" />
      <line x1="6.5" y1="13" x2="13.5" y2="13" />
      <line x1="3" y1="17" x2="17" y2="17" />
    </>
  ),
  // Two people: two blocks, offset, overlapping in the middle.
  dialogue: (
    <>
      <rect x="1.8" y="3.2" width="11" height="7.6" rx="2" />
      <rect x="7.2" y="9.2" width="11" height="7.6" rx="2" />
    </>
  ),
  // Where things sit: a centre with things hanging off it.
  map: (
    <>
      <line x1="10" y1="10" x2="4.5" y2="5" />
      <line x1="10" y1="10" x2="16" y2="6" />
      <line x1="10" y1="10" x2="14" y2="16" />
      <circle cx="10" cy="10" r="2.8" />
      <circle cx="4.5" cy="5" r="1.5" />
      <circle cx="16" cy="6" r="1.5" />
      <circle cx="14" cy="16" r="1.5" />
    </>
  ),
  // Six panels, drawn as six panels.
  comic: (
    <>
      <rect x="2" y="3.5" width="4.7" height="5.6" rx="0.7" />
      <rect x="7.65" y="3.5" width="4.7" height="5.6" rx="0.7" />
      <rect x="13.3" y="3.5" width="4.7" height="5.6" rx="0.7" />
      <rect x="2" y="10.9" width="4.7" height="5.6" rx="0.7" />
      <rect x="7.65" y="10.9" width="4.7" height="5.6" rx="0.7" />
      <rect x="13.3" y="10.9" width="4.7" height="5.6" rx="0.7" />
    </>
  ),
  // Written for the ear: a source and what leaves it.
  audio: (
    <>
      <circle className="solid" cx="4.2" cy="10" r="1.9" />
      <path d="M8 6.6a5 5 0 0 1 0 6.8" />
      <path d="M11.6 4.1a9 9 0 0 1 0 11.8" />
      <path d="M15.2 1.6a13 13 0 0 1 0 16.8" />
    </>
  ),
};
