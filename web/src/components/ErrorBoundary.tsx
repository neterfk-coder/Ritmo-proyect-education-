import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useT } from "../lib/i18n";

/**
 * What a student meets when the interface itself breaks.
 *
 * Without this, a render error is a white screen — which for somebody who
 * finally sat down to start their homework reads as "you broke it", and there
 * is nothing on the page to disagree. So: say plainly that it was us, keep the
 * work that is already saved, and offer the two ways out.
 *
 * The details are behind a fold rather than hidden. A stack trace as the first
 * thing on screen is frightening; a stack trace that cannot be found at all is
 * useless to whoever has to fix it.
 */
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Ritmo hit a render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return <CrashScreen error={error} />;
  }
}

/**
 * Split out as a function component so it can reach the language context — a
 * class cannot call a hook, and this is the one screen most in need of being
 * in a language the reader actually has.
 */
function CrashScreen({ error }: { error: Error }) {
  const t = useT();

  return (
    <div className="min-h-screen grid place-items-center px-6 py-16">
      <div className="w-full max-w-[26rem] panel p-6 sm:p-8 space-y-5">
        <span className="panel-legend">{t("crash.legend")}</span>

        <div className="space-y-2 pt-1">
          <h1 className="font-display text-[1.6rem] leading-[1.25] tracking-tight">
            {t("crash.title")}
          </h1>
          <p className="text-sm text-muted reading">{t("crash.body")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => window.location.reload()}>
            {t("crash.reload")}
          </button>
          <button
            className="btn-quiet"
            onClick={() => {
              window.location.href = "/work";
            }}
          >
            {t("crash.back")}
          </button>
        </div>

        <details className="border-t border-line pt-4">
          <summary className="btn-bare cursor-pointer list-none">{t("crash.details")}</summary>
          <pre className="mt-3 text-xs text-faint font-mono whitespace-pre-wrap break-words">
            {error.message}
          </pre>
          <p className="text-xs text-faint reading pt-2">{t("crash.console")}</p>
        </details>
      </div>
    </div>
  );
}
