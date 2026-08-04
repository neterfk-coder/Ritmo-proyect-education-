import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../state/StudentContext";
import { useDocumentTitle } from "../lib/title";
import { useT } from "../lib/i18n";
import type { Key } from "../lib/i18n";

const NOT_COLLECTED: Key[] = ["privacy.no1", "privacy.no2", "privacy.no3", "privacy.no4"];

/**
 * A page that exists because of what this product could have been.
 *
 * The obvious version of Ritmo ships a teacher dashboard, a parent digest and
 * an engagement score. Every one of those was possible with the data model we
 * already have. We did not build them, and this page is where we say so in
 * plain terms rather than in a policy nobody reads.
 */
export function Privacy() {
  const { student, erase, signOut, hosted } = useStudent();
  const navigate = useNavigate();
  const t = useT();
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  useDocumentTitle(t("privacy.eyebrow"));

  if (!student) return null;

  return (
    <div className="mx-auto max-w-reading px-6 py-16 space-y-14">
      <header className="space-y-4">
        <p className="eyebrow">{t("privacy.eyebrow")}</p>
        <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight">
          {t("privacy.title")}
        </h1>
      </header>

      <section className="space-y-5">
        <h2 className="eyebrow">{t("privacy.notCollected")}</h2>
        <ul className="space-y-3.5">
          {NOT_COLLECTED.map((line) => (
            <li key={line} className="flex gap-3.5 reading text-[0.9375rem]">
              <span aria-hidden className="text-faint font-mono text-xs pt-1.5">—</span>
              <span>{t(line)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5">
        <h2 className="eyebrow">{t("privacy.stored")}</h2>
        <p className="reading text-[0.9375rem] text-muted">{t("privacy.storedBody")}</p>
        {/*
          The two sentences below are different promises, and which one is true
          depends on where this copy is running. The page asks the server and
          says the one that applies, rather than printing the flattering one
          and hoping.
        */}
        {hosted ? (
          <div className="panel p-5 space-y-3">
            <span className="panel-legend">{t("privacy.hostedLegend")}</span>
            <p className="reading text-[0.9375rem] text-muted pt-1">{t("privacy.hostedBody")}</p>
            <p className="reading text-[0.9375rem] text-muted">
              {t("privacy.hostedRun")}{" "}
              <code className="font-mono text-xs bg-raised border border-line rounded px-1.5 py-0.5">
                npm run setup && npm run dev
              </code>
            </p>
          </div>
        ) : (
          <p className="reading text-[0.9375rem] text-muted">{t("privacy.localBody")}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="eyebrow">{t("privacy.accountId")}</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <code className="font-mono text-xs bg-raised border border-line rounded-card px-3 py-2 break-all">
            {student.id}
          </code>
          <button
            className="btn-quiet !py-1.5 !text-xs"
            onClick={() => {
              navigator.clipboard.writeText(student.id);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? t("privacy.copied") : t("privacy.copy")}
          </button>
        </div>
        <p className="text-xs text-faint reading">{t("privacy.keepThis")}</p>
      </section>

      <section className="space-y-5 border-t border-line pt-10">
        <h2 className="eyebrow">{t("privacy.erase")}</h2>
        <p className="reading text-[0.9375rem] text-muted">{t("privacy.eraseBody")}</p>
        {confirming ? (
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary !bg-ink !border-ink"
              onClick={async () => {
                await erase();
                navigate("/");
              }}
            >
              {t("privacy.eraseYes")}
            </button>
            <button className="btn-quiet" onClick={() => setConfirming(false)}>
              {t("privacy.eraseNo")}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button className="btn-quiet" onClick={() => setConfirming(true)}>
              {t("privacy.erase")}
            </button>
            <button className="btn-bare" onClick={() => { signOut(); navigate("/"); }}>
              {t("privacy.signOut")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
