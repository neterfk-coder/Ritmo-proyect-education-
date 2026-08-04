import type { Key } from "./i18n";

/**
 * The companion's own lines.
 *
 * A caveat worth keeping in the file rather than only in a commit message:
 * `server/src/ai/prompts.js` forbids encouragement everywhere else in this
 * product, because a tester said praise "sounds fake and I stop trusting it".
 * These lines exist because they were asked for, and they are written to be
 * survivable by that tester — no exclamation marks, no praise for work that
 * has not happened yet, nothing that congratulates you for existing. They tell
 * the truth about how starting feels rather than cheering at you.
 *
 * The student can silence them entirely. That switch is the reason this can
 * coexist with the rest of the product.
 *
 * Held as keys rather than sentences: the Spanish is written to the same rules
 * and lives beside the English in `i18n.tsx`, where the pair can be read as one
 * thing. A line that got softer in translation would be a real regression here.
 */
export const PHRASES: Key[] = [
  "phrase.1", "phrase.2", "phrase.3", "phrase.4", "phrase.5",
  "phrase.6", "phrase.7", "phrase.8", "phrase.9", "phrase.10",
  "phrase.11", "phrase.12", "phrase.13", "phrase.14", "phrase.15",
];

/**
 * Picks a line that is not the one already showing, so opening the companion
 * twice does not look like it is broken.
 */
export function nextPhrase(current?: Key | null): Key {
  if (PHRASES.length < 2) return PHRASES[0];
  let pick = current;
  while (pick === current) pick = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  return pick as Key;
}

export function randomPhrase(): Key {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

/** Openers offered as buttons, so asking costs no writing and no spelling. */
export const STARTERS: Key[] = [
  "starter.1", "starter.2", "starter.3", "starter.4", "starter.5", "starter.6",
];
