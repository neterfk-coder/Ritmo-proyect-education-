import { useRef, useState } from "react";
import { listen } from "../lib/speech";
import { useLang, useT } from "../lib/i18n";
import { detectLanguage } from "../lib/detect";
import { MAX_PDF_BYTES, PdfError, extractPdfText } from "../lib/pdf";
import { PAGES_THAT_FIT, capacityOf } from "../lib/limits";
import { Decompiling } from "./Decompiling";

/**
 * The front door. Paste, drop a PDF or a text file, or talk.
 *
 * Dictation is here rather than in a settings menu because for a portion of
 * our users the gap between "I know what this says" and "I have typed it in"
 * is where the whole evening goes. PDFs are here for the same reason: it is
 * the format homework actually arrives in, and "retype it first" is the wall
 * this product exists to remove, not one to rebuild at the entrance.
 */
export function TaskIntake({
  onSubmit, busy,
}: { onSubmit: (text: string) => void; busy: boolean }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const [text, setText] = useState("");
  const [dismissedOffer, setDismissedOffer] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [reading, setReading] = useState<number | null>(null);
  const recognition = useRef<{ stop: () => void } | null>(null);

  const capacity = capacityOf(text);

  /*
    The assignment is in the other language.

    The model reads both fluently and answers in whichever language the
    interface is set to, so nothing here is broken — but a student whose
    browser opened in English and who then pasted Spanish homework gets Spanish
    work explained in English and no reason to suspect a switch exists.

    Offered, never applied. The mismatch is frequently deliberate: somebody
    studying English wants English help with a Spanish text, and somebody in a
    Spanish class wants exactly the reverse. Switching their interface out from
    under them because of one paste would be the tool overruling a choice it
    cannot see the reason for.
  */
  const detected = detectLanguage(text);
  const offerSwitch = !dismissedOffer && detected && detected.lang !== lang;

  const isPdf = (file: File) =>
    file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  const readFile = async (file: File) => {
    setError(null);
    setNote(null);

    if (isPdf(file)) {
      if (file.size > MAX_PDF_BYTES) {
        setError(t("intake.pdfTooLarge"));
        return;
      }
      setReading(0);
      try {
        const pdf = await extractPdfText(file, setReading);
        // Appended rather than replacing, so dropping a PDF onto something
        // already typed does not silently delete it.
        setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${pdf.text}` : pdf.text));

        // Say what was read. A student who dropped in a 40-page PDF and got
        // six pages back needs to know that happened, and that it was the
        // limit rather than a failure — otherwise the missing pages look like
        // a bug and they lose trust in everything that follows.
        setNote(
          pdf.stoppedEarly
            ? t("intake.pdfTrimmed", { read: pdf.pagesRead, total: pdf.totalPages })
            : pdf.totalPages === 1
              ? t("intake.pdfOnePage")
              : t("intake.pdfPages", { n: pdf.totalPages })
        );
      } catch (err) {
        setError(
          err instanceof PdfError
            ? t(
                err.reason === "encrypted"
                  ? "intake.pdfLocked"
                  : err.reason === "empty"
                    ? "intake.pdfScanned"
                    : "intake.pdfBroken"
              )
            : t("intake.pdfBroken")
        );
      } finally {
        setReading(null);
      }
      return;
    }

    if (file.size > 400_000) {
      setError(t("intake.tooLarge"));
      return;
    }
    setText(await file.text());
  };

  const toggleDictation = () => {
    if (dictating) {
      recognition.current?.stop();
      setDictating(false);
      return;
    }
    const handle = listen((heard, final) => {
      if (final) setText((prev) => `${prev} ${heard}`.trim());
    });
    if (!handle) {
      setError(t("intake.noDictation"));
      return;
    }
    recognition.current = handle;
    setDictating(true);
  };

  // The form is replaced rather than disabled. A greyed-out box with a spinner
  // beside it invites a second press; a box that is gone does not.
  if (busy) return <Decompiling />;

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const ready = text.trim().length >= 10;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) readFile(file);
        }}
        className={`panel transition-colors duration-200 ease-calm ${
          dragging ? "border-pine bg-raised" : ""
        }`}
      >
        <span className="panel-legend">
          {dragging ? t("intake.drop") : t("intake.legend")}
        </span>

        <label htmlFor="assignment" className="sr-only">
          {t("intake.label")}
        </label>
        <textarea
          id="assignment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={t("intake.placeholder")}
          className="w-full bg-transparent px-4 pt-5 pb-3.5 text-[0.9375rem] reading resize-y
                     outline-none placeholder:text-faint"
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2.5">
          <button className="btn-bare" onClick={toggleDictation}>
            {dictating ? t("intake.stopTalking") : t("intake.sayIt")}
          </button>
          <span className="text-faint" aria-hidden>·</span>
          <label className="btn-bare cursor-pointer">
            {t("intake.openFile")}
            <input
              type="file"
              accept=".txt,.md,.pdf,application/pdf"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
            />
          </label>
          {/*
            The capacity line. It says the same thing three ways depending on
            where you are, because the useful sentence changes:

              empty     → how much fits, answering "can I paste all of this?"
                          before somebody spends effort finding out
              typing    → just the count, staying out of the way
              crowded   → the count and the fact that room is running out
              over      → exactly how much has to go, as a number they can act
                          on rather than "too long"

            aria-live so a screen reader hears the state change at the moment
            the button stops working, rather than discovering it by pressing.
          */}
          <span
            className={`ml-auto font-mono text-[0.6875rem] tabular-nums transition-colors
                        duration-200 ${capacity.over ? "text-ink" : "text-faint"}`}
            aria-live="polite"
          >
            {capacity.chars === 0
              ? t("intake.capacityEmpty", { pages: PAGES_THAT_FIT })
              : capacity.over
                ? t("intake.capacityOver", { n: capacity.excess.toLocaleString() })
                : capacity.crowded
                  ? t("intake.capacityCrowded", { n: capacity.words.toLocaleString() })
                  : `${capacity.words.toLocaleString()} ${
                      capacity.words === 1 ? t("intake.word") : t("intake.words")
                    }`}
          </span>
        </div>

        {/* Drawn only once it matters. A gauge that sits at 3% full for the
            whole of a normal paste is noise on a screen built to have as
            little of it as possible. */}
        {(capacity.crowded || capacity.over) && (
          <div className="h-px bg-line" aria-hidden>
            <div
              className={`h-px transition-[width] duration-300 ease-calm ${
                capacity.over ? "bg-ink" : "bg-lit"
              }`}
              style={{ width: `${Math.min(100, Math.round(capacity.fraction * 100))}%` }}
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-muted reading max-w-reading">{error}</p>}

      {/* What the PDF turned out to be. Sits apart from `error` because it is
          not one — the read worked, this is just what it found. */}
      {note && !error && (
        <p className="text-xs text-faint reading max-w-reading rise">{note}</p>
      )}

      {/* A long PDF is several seconds of nothing. Say it is moving, and say
          how far, because this is a wait that lands right when somebody has
          finally started. */}
      {reading !== null && (
        <div className="space-y-2 rise" role="status" aria-live="polite">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="think-dot block h-1.5 w-1.5 rounded-full bg-lit" aria-hidden />
            {t("intake.readingPdf")}
          </p>
          <div className="h-px bg-line max-w-reading">
            <div
              className="h-px bg-lit transition-[width] duration-300 ease-calm"
              style={{ width: `${Math.round(reading * 100)}%` }}
            />
          </div>
        </div>
      )}

      {dictating && (
        <p className="flex items-center gap-2 text-sm text-muted rise">
          <span className="think-dot block h-1.5 w-1.5 rounded-full bg-lit" aria-hidden />
          {t("intake.listening")}
        </p>
      )}

      {/* Above the button, because it is about the thing the button is about
          to do, and after it has run the choice has already been made. */}
      {offerSwitch && detected && (
        <div className="panel p-4 space-y-3 rise" role="status" aria-live="polite">
          <p className="text-sm text-muted reading">
            {t(detected.lang === "es" ? "intake.looksSpanish" : "intake.looksEnglish")}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button className="btn-quiet !py-1.5 !text-xs" onClick={() => setLang(detected.lang)}>
              {t(detected.lang === "es" ? "intake.switchToSpanish" : "intake.switchToEnglish")}
            </button>
            <button
              className="btn-bare !text-xs"
              onClick={() => setDismissedOffer(true)}
            >
              {t("intake.keepLanguage")}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          className="btn-primary"
          disabled={!capacity.ready}
          onClick={() => onSubmit(text.trim())}
        >
          {t("intake.submit")}
        </button>
        {/* Over the limit is a different problem from under it, and the old
            copy — "a little more of it, and this turns on" — was actively
            wrong in one of those directions. */}
        {capacity.over ? (
          <p className="text-xs text-muted reading max-w-reading">
            {t("intake.tooMuch", { n: capacity.excess.toLocaleString() })}
          </p>
        ) : (
          !capacity.ready &&
          capacity.chars > 0 && <p className="text-xs text-faint">{t("intake.needMore")}</p>
        )}
      </div>
    </div>
  );
}
