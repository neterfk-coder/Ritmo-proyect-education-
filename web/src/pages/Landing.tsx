import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Owl } from "../components/Owl";
import { LangToggle } from "../components/LangToggle";
import { useT } from "../lib/i18n";
import type { Key, T } from "../lib/i18n";
import { useDocumentTitle } from "../lib/title";

/**
 * The front door.
 *
 * Before this, the first thing anyone saw was a sign-in box. A reviewer with
 * three minutes met a password field and had to guess what the product was; a
 * student met a form before being given anything. Both are the same mistake in
 * different clothes — asking before offering.
 *
 * So the page does not describe the product, it runs it. A real messy
 * assignment turns into a contract and one lit step, in about eight seconds,
 * with no account, no key and no network call. That is the entire thesis, and
 * watching it happen is faster than reading a paragraph about it.
 *
 * Two rules the layout obeys:
 *
 *   1. The way in is above the fold, next to the one-line claim. A student who
 *      arrived stuck must not have to scroll past a pitch to start working —
 *      that is the wall this product exists to remove, rebuilt in marketing.
 *   2. The demonstration uses the real components' visual language, not
 *      screenshots. What you watch is what you get.
 */

/** Milliseconds each stage holds before the next arrives. */
const BEATS = [900, 1700, 1900, 2400];

export function Landing() {
  const navigate = useNavigate();
  const t = useT();
  useDocumentTitle(null);

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-page px-6 pt-6 flex items-center gap-3">
        <Owl size={34} />
        <div>
          <p className="font-display text-xl leading-none tracking-tight">Ritmo</p>
          <p className="text-[0.6875rem] text-faint leading-tight pt-1">{t("landing.tagline")}</p>
        </div>
        <LangToggle className="ml-auto" />
      </header>

      <main className="mx-auto max-w-page px-6 py-12 sm:py-16 space-y-16 sm:space-y-24">
        <section className="max-w-reading space-y-6 rise">
          <h1 className="font-display text-[2.25rem] sm:text-[3rem] leading-[1.08] tracking-tight">
            {t("landing.title")}
          </h1>
          <p className="text-muted reading text-[1.0625rem]">{t("landing.blurb")}</p>

          {/* The way in, before anything has to be read or scrolled past. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">
            <button className="btn-primary" onClick={() => navigate("/signin?guest=1")}>
              {t("landing.enter")}
            </button>
            <button className="btn-bare" onClick={() => navigate("/signin")}>
              {t("landing.haveAccount")}
            </button>
          </div>
          <p className="text-xs text-faint">{t("landing.noSignup")}</p>
        </section>

        <Demonstration t={t} />

        <section className="grid gap-8 sm:grid-cols-3 stagger">
          {(
            [
              ["landing.claim1", "landing.claim1Body"],
              ["landing.claim2", "landing.claim2Body"],
              ["landing.claim3", "landing.claim3Body"],
            ] as [Key, Key][]
          ).map(([title, body]) => (
            <div key={title} className="space-y-2.5">
              <h2 className="font-display text-lg leading-snug">{t(title)}</h2>
              <p className="text-sm text-muted reading">{t(body)}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line mt-8">
        <div className="mx-auto max-w-page px-6 py-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button className="btn-primary" onClick={() => navigate("/signin?guest=1")}>
            {t("landing.enter")}
          </button>
          <p className="text-sm text-muted">{t("shell.promise")}</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * The product, performing.
 *
 * Stages arrive on a timer rather than on scroll: the point is the *order* —
 * what it asks, when you can stop, then one action — and scroll-triggered
 * reveals let somebody see the answer before the question.
 *
 * With reduced motion requested the whole thing is simply present from the
 * start. An animation whose content is the argument must still deliver the
 * argument when the animation is refused.
 */
function Demonstration({ t }: { t: T }) {
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);

  const stillness =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (stillness) return setStage(BEATS.length);
    setStage(0);
    const timers = BEATS.map((_, i) =>
      window.setTimeout(
        () => setStage(i + 1),
        BEATS.slice(0, i + 1).reduce((a, b) => a + b, 0)
      )
    );
    return () => timers.forEach(window.clearTimeout);
  }, [run, stillness]);

  const done = stage >= BEATS.length;

  return (
    <section className="space-y-5" aria-label={t("landing.demoLegend")}>
      <div className="flex items-baseline gap-4 flex-wrap">
        <h2 className="eyebrow">{t("landing.demoLegend")}</h2>
        {done && !stillness && (
          <button className="btn-bare !text-xs" onClick={() => setRun((n) => n + 1)}>
            {t("landing.demoReplay")}
          </button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        {/* What arrives: the assignment, exactly as it was handed over. */}
        <div className="panel p-5 sm:p-6 space-y-3">
          <span className="panel-legend">{t("landing.demoPasted")}</span>
          <p className="reading text-[0.9375rem] text-muted pt-1">
            {t("landing.demoAssignment")}
          </p>
        </div>

        {/* What comes back. */}
        <div className="space-y-5 min-h-[19rem]">
          {stage === 1 && (
            <div className="panel p-5 space-y-3 step-in" role="status" aria-live="polite">
              <span className="panel-legend">{t("decomp.legend")}</span>
              <div className="flex items-center gap-2 pt-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="think-dot block h-1.5 w-1.5 rounded-full bg-lit"
                    style={{ animationDelay: `${i * 0.16}s` }}
                    aria-hidden
                  />
                ))}
                <span className="text-sm text-muted">{t("landing.demoWorking")}</span>
              </div>
            </div>
          )}

          {stage >= 2 && (
            <div className="panel p-5 space-y-2 step-in">
              <span className="panel-legend">{t("landing.demoVerbLabel")}</span>
              <p className="reading text-[0.9375rem] pt-1">{t("landing.demoVerb")}</p>
            </div>
          )}

          {stage >= 3 && (
            <div className="panel p-5 space-y-2 step-in">
              <span className="panel-legend">{t("contract.stopWhen")}</span>
              <p className="font-display text-[1.0625rem] leading-snug reading pt-1">
                {t("landing.demoDone")}
              </p>
            </div>
          )}

          {/* The signature element, drawn exactly as the workspace draws it. */}
          {stage >= 4 && (
            <div
              className="lantern panel ignite border-lit/40 p-5 sm:p-6 space-y-4"
              style={{ background: "rgb(var(--c-lit) / 0.045)" }}
            >
              <span className="panel-legend" style={{ color: "rgb(var(--c-lit))" }}>
                {t("lantern.doOnly")}
              </span>
              <span className="panel-meta">{t("landing.demoStepMeta")}</span>
              <p className="font-display text-[1.3rem] sm:text-[1.45rem] leading-[1.3] reading pt-1">
                {t("landing.demoStep")}
              </p>
            </div>
          )}
        </div>
      </div>

      {done && (
        <p className="text-xs text-faint reading max-w-reading settle">
          {t("landing.demoCaption")}
        </p>
      )}
    </section>
  );
}
