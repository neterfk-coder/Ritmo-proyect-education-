/**
 * Which language the answer should be written in.
 *
 * A good half of what a student reads in this product is generated here, not
 * in the browser: the steps a task is cut into, the guide's replies, the
 * observations on the profile, and the one page they hand to a teacher. A
 * language toggle that only repaints the chrome and leaves all of that in
 * English is not a bilingual product, it is a translated menu bar.
 *
 * The browser sends `x-ritmo-lang` on every request. It is a custom header
 * because `Accept-Language` is on the fetch forbidden-header list and cannot be
 * set from a page.
 */

export const LANGS = ["en", "es"];

export const DEFAULT_LANG = "en";

/** @returns {"en"|"es"} */
export function langOf(req) {
  const header = req?.headers?.["x-ritmo-lang"];
  const value = Array.isArray(header) ? header[0] : header;
  const tag = String(value ?? "").trim().toLowerCase().slice(0, 5);
  if (!tag) return DEFAULT_LANG;

  // Accept a full tag as well as a bare code, so es-419 and es-MX both land on
  // Spanish rather than silently falling back to English.
  const base = tag.split("-")[0];
  return LANGS.includes(base) ? base : DEFAULT_LANG;
}

/**
 * Picks one of a pair by language.
 * @template T
 * @param {"en"|"es"} lang
 * @param {{en: T, es: T}} pair
 */
export function pick(lang, pair) {
  return pair[lang] ?? pair[DEFAULT_LANG];
}

/** Date formatting for the handover page. */
export const LOCALE = { en: "en-GB", es: "es-ES" };
