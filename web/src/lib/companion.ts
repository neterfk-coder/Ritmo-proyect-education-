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
 */
export const PHRASES = [
  "You do not have to feel ready. You only have to start the one step in front of you.",
  "Starting badly still counts as starting.",
  "The hard part was never the work. It is the beginning, and you are already past it.",
  "Nobody does this in one clean run. Not one person.",
  "You are allowed to make it smaller. That is not giving up, that is aim.",
  "A page you hate is worth more than a page you have not written.",
  "Slow is a pace, not a verdict.",
  "You have finished things before. This is one of those.",
  "If it feels heavy, that is because it matters to you.",
  "Take the break. The work will still be here, and so will you.",
  "You are not behind. You are somewhere in the middle, like everyone.",
  "One step, then look up. That is the entire method.",
  "Confusion is what understanding feels like on the way in.",
  "You do not owe anyone a perfect version today.",
  "Come back to it. Coming back is the skill.",
];

/**
 * Picks a line that is not the one already showing, so opening the companion
 * twice does not look like it is broken.
 */
export function nextPhrase(current?: string | null) {
  if (PHRASES.length < 2) return PHRASES[0];
  let pick = current;
  while (pick === current) pick = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  return pick as string;
}

/** Openers offered as buttons, so asking costs no writing and no spelling. */
export const STARTERS = [
  "How do I start a task?",
  "Why is only one step showing?",
  "What does the panel that interrupted me do?",
  "How do I give this to my teacher?",
  "What do you store about me?",
  "Something is not loading",
];
