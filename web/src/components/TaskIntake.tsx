import { useRef, useState } from "react";
import { listen } from "../lib/speech";
import { Decompiling } from "./Decompiling";

/**
 * The front door. Paste, drop a text file, or talk.
 *
 * Dictation is here rather than in a settings menu because for a portion of
 * our users the gap between "I know what this says" and "I have typed it in"
 * is where the whole evening goes.
 */
export function TaskIntake({
  onSubmit, busy,
}: { onSubmit: (text: string) => void; busy: boolean }) {
  const [text, setText] = useState("");
  const [dictating, setDictating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<{ stop: () => void } | null>(null);

  const readFile = async (file: File) => {
    if (file.size > 400_000) {
      setError("That file is larger than this reads. Paste the part you need instead.");
      return;
    }
    setError(null);
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
      setError("This browser has no dictation. Chrome and Edge do.");
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
        <span className="panel-legend">{dragging ? "Drop it here" : "The assignment"}</span>

        <label htmlFor="assignment" className="sr-only">
          Paste the assignment
        </label>
        <textarea
          id="assignment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="Paste the assignment exactly as your teacher wrote it. Do not tidy it up — the messy wording is the part this is for."
          className="w-full bg-transparent px-4 pt-5 pb-3.5 text-[0.9375rem] reading resize-y
                     outline-none placeholder:text-faint"
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2.5">
          <button className="btn-bare" onClick={toggleDictation}>
            {dictating ? "Stop talking" : "Say it instead"}
          </button>
          <span className="text-faint" aria-hidden>·</span>
          <label className="btn-bare cursor-pointer">
            Open a text file
            <input
              type="file"
              accept=".txt,.md"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
            />
          </label>
          <span className="ml-auto font-mono text-[0.6875rem] text-faint">
            {words} {words === 1 ? "word" : "words"}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-muted">{error}</p>}
      {dictating && (
        <p className="flex items-center gap-2 text-sm text-muted rise">
          <span className="think-dot block h-1.5 w-1.5 rounded-full bg-lit" aria-hidden />
          Listening. It writes as you finish each sentence.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button className="btn-primary" disabled={!ready} onClick={() => onSubmit(text.trim())}>
          Work out what this asks
        </button>
        {!ready && text.length > 0 && (
          <p className="text-xs text-faint">A little more of it, and this turns on.</p>
        )}
      </div>
    </div>
  );
}
