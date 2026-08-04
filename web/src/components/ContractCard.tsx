import type { ReactNode } from "react";
import { useT } from "../lib/i18n";
import type { Decomposition } from "../lib/types";

/**
 * The decompiler's output.
 *
 * "Definition of done" is the piece our testers reacted to hardest. Not knowing
 * when a task is finished is a different problem from not knowing how to do it,
 * and school almost never states the answer. So it goes first, it is the only
 * sentence set in the display face, and it is the one panel drawn at full
 * width — the layout says which line matters before a word is read.
 */
export function ContractCard({ d }: { d: Decomposition }) {
  const t = useT();

  return (
    <section className="space-y-8" aria-label={t("contract.aria")}>
      <div className="panel p-6 sm:p-8 rise">
        <span className="panel-legend">{t("contract.stopWhen")}</span>
        <p className="font-display text-xl sm:text-[1.4rem] leading-snug reading pt-1">
          {d.definitionOfDone}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 items-start">
        <Block label={t("contract.reallyAsking")}>
          <p className="reading text-[0.9375rem]">{d.plainAsk}</p>
          <p className="mt-4 pt-4 border-t border-line text-sm text-muted reading">
            {t("contract.wordMeans")} <span className="text-ink">{d.hiddenVerb}</span>.
          </p>
        </Block>

        <Block label={t("contract.mustExist")}>
          <ul className="space-y-3 stagger">
            {d.deliverables.map((item, i) => (
              <li key={i} className="flex gap-3 text-[0.9375rem] reading">
                <span
                  aria-hidden
                  className="mt-[0.45rem] h-1.5 w-1.5 rounded-full border border-muted shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Block>
      </div>

      {d.trapWarnings.length > 0 && (
        <div className="panel p-6 sm:p-7">
          <span className="panel-legend">{t("contract.traps")}</span>
          <ul className="space-y-4 pt-1 stagger">
            {d.trapWarnings.map((item, i) => (
              <li
                key={i}
                className="text-[0.9375rem] reading text-muted border-l-2 border-line pl-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-raised/40 p-5 sm:p-6 space-y-3 h-full">
      <p className="eyebrow">{label}</p>
      {children}
    </div>
  );
}
