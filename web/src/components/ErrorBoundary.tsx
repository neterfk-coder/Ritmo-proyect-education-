import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

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

    return (
      <div className="min-h-screen grid place-items-center px-6 py-16">
        <div className="w-full max-w-[26rem] panel p-6 sm:p-8 space-y-5">
          <span className="panel-legend">Something broke</span>

          <div className="space-y-2 pt-1">
            <h1 className="font-display text-[1.6rem] leading-[1.25] tracking-tight">
              That was us, not you.
            </h1>
            <p className="text-sm text-muted reading">
              Part of the interface stopped working. Nothing you had already finished is lost — the
              steps you completed and everything the sessions recorded are saved, not held on this
              screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reload the page
            </button>
            <button
              className="btn-quiet"
              onClick={() => {
                window.location.href = "/work";
              }}
            >
              Back to my work
            </button>
          </div>

          <details className="border-t border-line pt-4">
            <summary className="btn-bare cursor-pointer list-none">
              What went wrong, technically
            </summary>
            <pre className="mt-3 text-xs text-faint font-mono whitespace-pre-wrap break-words">
              {error.message}
            </pre>
            <p className="text-xs text-faint reading pt-2">
              If this keeps happening, the full trace is in the browser console.
            </p>
          </details>
        </div>
      </div>
    );
  }
}
