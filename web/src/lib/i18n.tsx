import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LOCALE, translate } from "./strings";
import type { Key, Lang } from "./strings";

/**
 * The language the interface is in.
 *
 * The strings themselves live in `strings.ts`, which imports nothing — so the
 * API client, the speech helpers and the guest flow can read a translation
 * without pulling React in, and the pairs can be checked on their own.
 */

export type { Key, Lang } from "./strings";
export { LANGS, LOCALE, STRINGS, translate } from "./strings";

const STORAGE_KEY = "ritmo.lang";

function detect(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  // A Spanish-speaking student should not have to find a toggle written in
  // English before the interface makes sense to them.
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}

/**
 * The active language outside React.
 *
 * The API client and the speech helpers are plain modules — they run where
 * hooks cannot. They read this instead, and the provider keeps it in step with
 * the rendered tree.
 */
let active: Lang = detect();
export const currentLang = () => active;

export type T = (key: Key, vars?: Record<string, string | number>) => string;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);

  // `lang` on the root element is not decoration: screen readers pick their
  // voice from it, and browsers hyphenate by it.
  useEffect(() => {
    active = lang;
    document.documentElement.lang = LOCALE[lang];
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  // Set before paint as well as in the effect, so the very first render of a
  // non-React consumer — the API client, on a request fired from a mount
  // effect — does not go out labelled with the previous language.
  const setLang = useCallback((next: Lang) => {
    active = next;
    setLangState(next);
  }, []);

  const t = useCallback<T>((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

/** The common case: only the translate function. */
export function useT(): T {
  return useLang().t;
}
