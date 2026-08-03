import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isSpeechAvailable, speak } from "../lib/speech";
import type { SpeechHandle } from "../lib/speech";

/**
 * The reader splits text into blocks and reports which one is on screen, which
 * is how dwell and reread are measured without ever touching the content.
 *
 * Read-aloud highlights at the word the voice is currently on. Sync matters:
 * unsynced audio plus text is worse than either alone for most dyslexic readers.
 */
export function ReaderPane({
  body, onBlockChange, onFirstPaint, speakRequest = 0,
}: {
  body: string;
  onBlockChange?: (index: number) => void;
  onFirstPaint?: (wordCount: number, blockCount: number) => void;
  /** Increment to start reading aloud from outside — the "read it to me" option. */
  speakRequest?: number;
}) {
  const [spoken, setSpoken] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const handle = useRef<SpeechHandle | null>(null);
  const container = useRef<HTMLDivElement>(null);

  const blocks = useMemo(
    () => body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean),
    [body]
  );

  useEffect(() => {
    onFirstPaint?.(body.split(/\s+/).filter(Boolean).length, blocks.length);
    return () => handle.current?.stop();
  }, [body]);

  // Which block is the reader actually looking at right now?
  useEffect(() => {
    if (!container.current || !onBlockChange) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) onBlockChange(Number((visible.target as HTMLElement).dataset.index));
      },
      { threshold: [0.4, 0.9] }
    );
    container.current.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [blocks, onBlockChange]);

  const startSpeech = useCallback(() => {
    if (!isSpeechAvailable()) return;
    setSpeaking(true);
    handle.current = speak(body, {
      onWord: (charIndex) => setSpoken(charIndex),
      onEnd: () => {
        setSpeaking(false);
        setSpoken(null);
      },
    });
  }, [body]);

  const stopSpeech = useCallback(() => {
    handle.current?.stop();
    setSpeaking(false);
    setSpoken(null);
  }, []);

  // Fires when the student picks "read it to me" from the friction sheet.
  useEffect(() => {
    if (speakRequest > 0) startSpeech();
  }, [speakRequest]);

  const toggleSpeech = () => (speaking ? stopSpeech() : startSpeech());

  return (
    <div className="space-y-4">
      {isSpeechAvailable() && (
        <button className="btn-quiet !py-1.5 !text-xs" onClick={toggleSpeech}>
          {speaking ? "Stop reading" : "Read it to me"}
        </button>
      )}

      <div ref={container} className="max-w-reading space-y-5">
        {blocks.map((block, i) => (
          <p
            key={i}
            data-index={i}
            className="reading text-[1.0625rem] whitespace-pre-wrap"
          >
            {speaking ? <Highlighted text={block} offset={offsetOf(blocks, i)} cursor={spoken} /> : block}
          </p>
        ))}
      </div>
    </div>
  );
}

function offsetOf(blocks: string[], index: number) {
  return blocks.slice(0, index).reduce((sum, b) => sum + b.length + 2, 0);
}

/** Highlights the single word the synthesiser is currently saying. */
function Highlighted({
  text, offset, cursor,
}: { text: string; offset: number; cursor: number | null }) {
  if (cursor === null) return <>{text}</>;
  const local = cursor - offset;
  if (local < 0 || local > text.length) return <>{text}</>;

  const start = text.lastIndexOf(" ", local) + 1;
  const rawEnd = text.indexOf(" ", local);
  const end = rawEnd === -1 ? text.length : rawEnd;

  return (
    <>
      {text.slice(0, start)}
      <mark
        className="rounded-sm px-0.5"
        style={{ background: "rgb(var(--c-lit) / 0.28)", color: "inherit" }}
      >
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}
