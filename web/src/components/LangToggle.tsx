import { LANGS, useLang } from "../lib/i18n";

/**
 * Two letters, always visible.
 *
 * This one deliberately does not live inside the Reading panel with the other
 * settings. A student who cannot read the interface cannot find a control
 * labelled in the language they cannot read — burying the language switch
 * behind a word is the one place where "tuck it into settings" fails on its
 * own terms. So it sits in the header, and on the sign-in screen, in both
 * languages at once.
 *
 * The pair is drawn as a segmented control rather than a dropdown because
 * with exactly two options a dropdown hides half the answer.
 */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="group"
      aria-label={t("lang.aria")}
      className={`flex items-center rounded-card border border-line overflow-hidden ${className}`}
    >
      {LANGS.map((option) => {
        const active = lang === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLang(option.code)}
            aria-pressed={active}
            // The full name is the accessible name; the two letters are what
            // fits in a header. A screen reader should not read out "EN".
            aria-label={option.name}
            title={option.name}
            lang={option.code}
            className={`px-2 py-1 text-[0.6875rem] font-mono tracking-wide transition-colors
                        duration-200 ease-calm ${
                          active
                            ? "bg-ink text-surface"
                            : "text-faint hover:text-ink hover:bg-raised"
                        }`}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
}
