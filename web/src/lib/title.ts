import { useEffect } from "react";

/**
 * The tab's name, per page.
 *
 * More than a finish detail here: this is a tool for students who leave tabs
 * open and come back to them, and "Ritmo" four times over tells you nothing
 * about which one held the thing you were doing. The task title goes first so
 * it survives a narrow tab.
 */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} — Ritmo` : "Ritmo — one step, lit";
    return () => {
      document.title = "Ritmo — one step, lit";
    };
  }, [title]);
}
