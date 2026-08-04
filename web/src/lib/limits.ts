/**
 * How much assignment fits, said in units a person actually holds.
 *
 * The number is enforced in `server/src/routes/tasks.js` — `rawText` is
 * `z.string().min(10).max(20000)`. Until now nothing on screen mentioned it,
 * so a student who pasted a long PDF filled the box, pressed the button, and
 * got a validation error from a library. Being told a limit exists *after*
 * failing it is the worst order to learn it in, and it lands on somebody who
 * had just managed to start.
 *
 * If the server's number changes, change this one. They are deliberately not
 * fetched from an endpoint: one constant with a comment is easier to keep
 * honest than a round trip that can silently answer stale.
 */
export const MAX_CHARS = 20_000;

/** Below this there is not enough to work out what is being asked. */
export const MIN_CHARS = 10;

/**
 * Characters are what the limit is made of; pages are what homework arrives
 * in. Roughly 2,500 characters to a printed page of prose — deliberately
 * conservative, so "about eight pages" under-promises rather than leaving
 * somebody two paragraphs short of a limit they were told they had.
 */
const CHARS_PER_PAGE = 2_500;

export const PAGES_THAT_FIT = Math.floor(MAX_CHARS / CHARS_PER_PAGE);

/** Past this, say space is running out. Before it, stay quiet. */
export const CROWDED_AT = 0.75;

export interface Capacity {
  chars: number;
  words: number;
  /** 0..1+, so over-full is expressible rather than clamped away. */
  fraction: number;
  crowded: boolean;
  over: boolean;
  /** How many characters have to go. Zero unless over. */
  excess: number;
  ready: boolean;
}

export function capacityOf(text: string): Capacity {
  const trimmed = text.trim();
  const chars = trimmed.length;
  return {
    chars,
    words: trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0,
    fraction: chars / MAX_CHARS,
    crowded: chars >= MAX_CHARS * CROWDED_AT && chars <= MAX_CHARS,
    over: chars > MAX_CHARS,
    excess: Math.max(0, chars - MAX_CHARS),
    ready: chars >= MIN_CHARS && chars <= MAX_CHARS,
  };
}
