/**
 * Read-aloud with word-level highlighting.
 *
 * Built on the browser's own speech synthesis rather than a hosted TTS API for
 * two reasons: it works with no key and no network, and the audio never leaves
 * the device. For a student reading their own homework, that second one is not
 * a technicality.
 */

import { LOCALE, currentLang } from "./i18n";

export interface SpeechHandle {
  stop: () => void;
}

export function isSpeechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Picks a voice that speaks the language on screen.
 *
 * Without this, "read it to me" hands Spanish text to whatever voice the
 * browser defaults to — usually an English one, which pronounces Spanish as
 * nonsense. For the reader this feature exists for, unintelligible audio
 * alongside text they already struggle with is worse than no audio at all.
 *
 * An exact regional match wins; any voice for the same language will do; and
 * if the system has neither, we leave the voice alone and only set `lang`,
 * because a wrong voice chosen deliberately is worse than the browser's guess.
 */
function voiceFor(locale: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  if (!voices.length) return null;
  const base = locale.split("-")[0].toLowerCase();
  return (
    voices.find((v) => v.lang?.toLowerCase() === locale.toLowerCase()) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith(base)) ??
    null
  );
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

  const locale = LOCALE[currentLang()];
  utterance.lang = locale;
  const voice = voiceFor(locale);
  if (voice) utterance.voice = voice;

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
  // The language the interface is in, not the one the OS is in. A student
  // reading Spanish and dictating Spanish should not have to change a system
  // setting for the transcript to come back as words.
  recognition.lang = LOCALE[currentLang()];

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
