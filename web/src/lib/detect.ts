import type { Lang } from "./strings";

/**
 * Which language an assignment is written in.
 *
 * Not for translating anything — the model reads both fluently and answers in
 * whichever language the interface is set to. This exists for one narrower
 * job: noticing that the two disagree, so a student who pasted Spanish
 * homework into an English interface can be told the switch exists rather than
 * receiving English steps and assuming that is all there is.
 *
 * Deliberately never switches anything by itself. The mismatch is often
 * intentional — somebody studying English wants English help with a Spanish
 * text, and somebody in a Spanish class wants the reverse — so this offers and
 * the student decides.
 *
 * Function words rather than a library: they are the highest-signal, lowest-
 * cost discriminator between exactly two known languages, and shipping a
 * detection model to answer a yes/no question would cost more than the whole
 * feature is worth.
 */

const MARKERS: Record<Lang, string[]> = {
  es: [
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al",
    "y", "o", "que", "en", "con", "por", "para", "su", "sus", "se", "lo",
    "como", "más", "pero", "sobre", "entre", "cuando", "donde", "cada",
    "este", "esta", "estos", "estas", "ese", "esa", "tu", "tus", "mi", "mis",
    "debe", "debes", "hay", "son", "está", "están", "ser", "hacer", "tiene",
  ],
  en: [
    "the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "with",
    "your", "you", "it", "is", "are", "was", "were", "be", "this", "that",
    "these", "those", "at", "by", "from", "as", "but", "about", "between",
    "each", "must", "should", "will", "has", "have", "do", "does", "not",
  ],
};

/** Characters that appear in Spanish and effectively never in English. */
const SPANISH_LETTERS = /[áéíóúüñ¿¡]/i;

export interface Detection {
  lang: Lang;
  /** 0..1. Below `CONFIDENT` the answer is not worth acting on. */
  confidence: number;
}

const CONFIDENT = 0.62;

export function detectLanguage(text: string): Detection | null {
  const words = String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    // Keep the combining marks out of the word but remember they were there.
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  // Too little to judge. A three-word fragment matching one article proves
  // nothing, and guessing on it would mean offering to switch at random.
  if (words.length < 8) return null;

  const es = new Set(MARKERS.es);
  const en = new Set(MARKERS.en);
  let hitsEs = 0;
  let hitsEn = 0;

  for (const raw of words) {
    // Compare unaccented, since the input was decomposed above.
    const w = raw.replace(/[̀-ͯ]/g, "");
    if (es.has(w) || es.has(raw)) hitsEs += 1;
    if (en.has(w)) hitsEn += 1;
  }

  // Accents are near-decisive on their own. Weighted, not absolute, so one
  // stray "café" in an English brief does not flip it.
  if (SPANISH_LETTERS.test(text)) hitsEs += Math.max(2, words.length * 0.04);

  const total = hitsEs + hitsEn;
  if (total < 3) return null;

  const lang: Lang = hitsEs >= hitsEn ? "es" : "en";
  const confidence = Math.max(hitsEs, hitsEn) / total;

  return confidence >= CONFIDENT ? { lang, confidence } : null;
}
