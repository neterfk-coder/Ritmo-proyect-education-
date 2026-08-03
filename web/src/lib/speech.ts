/**
 * Read-aloud with word-level highlighting.
 *
 * Built on the browser's own speech synthesis rather than a hosted TTS API for
 * two reasons: it works with no key and no network, and the audio never leaves
 * the device. For a student reading their own homework, that second one is not
 * a technicality.
 */

export interface SpeechHandle {
  stop: () => void;
}

export function isSpeechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(
  text: string,
  opts: { rate?: number; onWord?: (charIndex: number) => void; onEnd?: () => void } = {}
): SpeechHandle {
  if (!isSpeechAvailable()) {
    opts.onEnd?.();
    return { stop: () => {} };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts.rate ?? 0.95;
  utterance.pitch = 1;

  utterance.onboundary = (event) => {
    if (event.name === "word" || event.charIndex !== undefined) {
      opts.onWord?.(event.charIndex);
    }
  };
  utterance.onend = () => opts.onEnd?.();

  window.speechSynthesis.speak(utterance);
  return { stop: () => window.speechSynthesis.cancel() };
}

/** Dictation, for students who can say it but cannot start typing it. */
export function listen(onResult: (text: string, final: boolean) => void) {
  const Ctor =
    (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = navigator.language || "en-US";

  recognition.onresult = (event: any) => {
    let text = "";
    let final = false;
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      text += event.results[i][0].transcript;
      if (event.results[i].isFinal) final = true;
    }
    onResult(text, final);
  };

  recognition.start();
  return { stop: () => recognition.stop() };
}
