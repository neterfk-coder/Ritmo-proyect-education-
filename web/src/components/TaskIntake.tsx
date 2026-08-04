import { useRef, useState } from "react";
import { listen } from "../lib/speech";
import { useT } from "../lib/i18n";
import { MAX_PDF_BYTES, PdfError, extractPdfText } from "../lib/pdf";
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
  const [text, setText] = useState("");
  const [dictating, setDictating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<number | null>(null);
  const recognition = useRef<{ stop: () => void } | null>(null);

  const isPdf = (file: File) =>
    file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  const readFile = async (file: File) => {
    setError(null);

    if (isPdf(file)) {
      if (file.size > MAX_PDF_BYTES) {
        setError(t("intake.pdfTooLarge"));
        return;
      }
      setReading(0);
      try {
        const extracted = await extractPdfText(file, setReading);
        // Appended rather than replacing, so dropping a PDF onto something
        // already typed does not silently delete it.
        setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${extracted}` : extracted));
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
          <span className="ml-auto font-mono text-[0.6875rem] text-faint">
            {words} {words === 1 ? t("intake.word") : t("intake.words")}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-muted reading max-w-reading">{error}</p>}

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

      <div className="flex flex-wrap items-center gap-4">
        <button className="btn-primary" disabled={!ready} onClick={() => onSubmit(text.trim())}>
          {t("intake.submit")}
        </button>
        {!ready && text.length > 0 && (
          <p className="text-xs text-faint">{t("intake.needMore")}</p>
        )}
      </div>
    </div>
  );
}
