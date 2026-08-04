import { useEffect } from "react";
import { useT } from "./i18n";

/**
 * The tab's name, per page.
 *
 * More than a finish detail here: this is a tool for students who leave tabs
 * open and come back to them, and "Ritmo" four times over tells you nothing
 * about which one held the thing you were doing. The task title goes first so
 * it survives a narrow tab.
 */
export function useDocumentTitle(title?: string | null) {
  const t = useT();
  const fallback = t("app.tagline");

  useEffect(() => {
    document.title = title ? `${title} — Ritmo` : fallback;
    return () => {
      document.title = fallback;
    };
  }, [title, fallback]);
}
