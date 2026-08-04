import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useStudent } from "../state/StudentContext";
import { useT } from "../lib/i18n";
import type { Key } from "../lib/i18n";
import { Owl } from "./Owl";
import { STARTERS, nextPhrase, randomPhrase } from "../lib/companion";

interface Message {
  id: number;
  from: "you" | "owl";
  text: string;
}

/**
 * The companion: a guide docked to the right edge.
 *
 * Three rules it follows, and they are what keep it from fighting the product
 * it sits inside:
 *
 *   1. It never speaks first while a step is lit. It waits to be opened. An
 *      assistant that interrupts is a second thing to attend to, and the whole
 *      design exists to keep the count of those at one.
 *   2. It answers about the tool, never about the homework. Explaining the
 *      button is help; writing the essay is not.
 *   3. It can be switched off completely, and the switch is in the same panel
 *      as the reading settings rather than buried.
 */
export function Companion() {
  const { student, patch } = useStudent();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState<Key>(randomPhrase);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  const panel = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  if (!student || student.companionOn === false) return null;

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;

    setMessages((prev) => [...prev, { id: nextId.current++, from: "you", text: question }]);
    setDraft("");
    setThinking(true);
    try {
      const reply = await api.askCompanion(question, student.id);
      setMessages((prev) => [...prev, { id: nextId.current++, from: "owl", text: reply.text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, from: "owl", text: t("owl.unreachable") },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label={t("owl.dialog")}
          className="companion-in panel w-[min(22rem,calc(100vw-2rem))] shadow-lg overflow-hidden"
        >
          <header className="flex items-center gap-3 px-4 py-3 border-b border-line bg-raised/50">
            <Owl size={30} />
            <div className="min-w-0">
              <p className="text-sm text-ink leading-tight">Ovi</p>
              <p className="text-[0.6875rem] text-faint leading-tight">{t("owl.role")}</p>
            </div>
            <button
              className="ml-auto btn-bare !text-xs !no-underline text-faint hover:text-ink"
              onClick={() => setOpen(false)}
              aria-label={t("owl.closeAria")}
            >
              {t("owl.close")}
            </button>
          </header>

          <div ref={log} className="max-h-[46vh] overflow-y-auto px-4 py-4 space-y-4">
            <div className="rounded-card border border-line bg-raised/40 p-3.5">
              <p className="text-[0.9375rem] reading">{t(phrase)}</p>
              <button
                className="btn-bare !text-xs mt-2"
                onClick={() => setPhrase(nextPhrase(phrase))}
              >
                {t("owl.another")}
              </button>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-in flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap text-[0.9375rem] reading rounded-card px-3.5 py-2.5 ${
                    m.from === "you"
                      ? "bg-ink text-surface"
                      : "border border-line bg-surface text-ink"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}

            {thinking && (
              <div className="flex items-center gap-1.5 pl-1" aria-label={t("owl.thinking")}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="think-dot block h-1.5 w-1.5 rounded-full bg-faint"
                    style={{ animationDelay: `${i * 0.16}s` }}
                  />
                ))}
              </div>
            )}

            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="eyebrow">{t("owl.orPick")}</p>
                <div className="flex flex-col gap-1.5">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter}
                      onClick={() => send(t(starter))}
                      className="text-left text-sm text-muted border border-line rounded-card
                                 px-3 py-2 hover:text-ink hover:border-muted hover:bg-raised
                                 transition-colors duration-200 ease-calm"
                    >
                      {t(starter)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-3 space-y-2">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <label htmlFor="companion-input" className="sr-only">
                {t("owl.inputLabel")}
              </label>
              <input
                id="companion-input"
                ref={input}
                className="field !py-2 text-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("owl.placeholder")}
              />
              <button className="btn-quiet !px-3 shrink-0" disabled={!draft.trim() || thinking}>
                {t("owl.send")}
              </button>
            </form>
            <button
              className="btn-bare !text-[0.6875rem] text-faint"
              onClick={() => patch({ companionOn: false })}
            >
              {t("owl.turnOff")}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t("owl.closeAria") : t("owl.openAria")}
        title={open ? t("owl.closeAria") : t("owl.askTitle")}
        className="owl-dock grid place-items-center h-14 w-14 rounded-full bg-surface border
                   border-line shadow-md hover:border-pine focus-visible:border-pine"
      >
        <Owl size={38} />
      </button>
    </div>
  );
}
