import { NavLink, Outlet } from "react-router-dom";
import { useStudent } from "../state/StudentContext";
import { AccessibilityBar } from "./AccessibilityBar";
import { Companion } from "./Companion";

const NAV = [
  { to: "/work", label: "Work" },
  { to: "/profile", label: "How I work" },
  { to: "/privacy", label: "My data" },
];

export function Shell() {
  const { student, aiMode, hosted } = useStudent();

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
                   focus:bg-surface focus:border focus:border-line focus:rounded-card
                   focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to the work
      </a>

      <header className="border-b border-line bg-surface/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-page px-6 h-16 flex items-center gap-8">
          <Wordmark />
          {/* The active page is marked by a rule under it rather than a filled
              pill: it reads as "you are here" without another block of colour
              competing with the step. */}
          <nav className="flex items-center gap-1 h-full" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative h-full flex items-center px-3 text-sm transition-colors duration-200
                   ease-calm ${isActive ? "text-ink" : "text-muted hover:text-ink"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-2 -bottom-px h-px transition-colors duration-200 ${
                        isActive ? "bg-ink" : "bg-transparent"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            {aiMode === "mock" && (
              <span className="eyebrow hidden sm:inline" title="No API key set. Everything still works.">
                offline engine
              </span>
            )}
            <AccessibilityBar />
            {student && <span className="text-sm text-muted">{student.alias}</span>}
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Companion />

      <footer className="border-t border-line">
        <div className="mx-auto max-w-page px-6 py-6 flex flex-wrap gap-x-6 gap-y-2 items-baseline">
          <span className="eyebrow">Ritmo</span>
          <p className="text-sm text-muted">
            No camera. No microphone unless you press it. No teacher dashboard.{" "}
            {hosted ? (
              <>
                This copy stores your work on a server —{" "}
                <NavLink to="/privacy" className="underline underline-offset-4 decoration-line">
                  what that means
                </NavLink>
                .
              </>
            ) : (
              "Nothing leaves this device unless you export it."
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Wordmark() {
  return (
    <span className="flex items-baseline gap-2 select-none">
      <span className="font-display text-2xl tracking-tight">Ritmo</span>
      {/* The mark is the product thesis: many steps, one lit. */}
      <span className="flex items-center gap-[3px] pb-1" aria-hidden="true">
        <i className="block w-[3px] h-[7px] rounded-sm bg-faint/50" />
        <i className="block w-[3px] h-[11px] rounded-sm bg-lit" />
        <i className="block w-[3px] h-[7px] rounded-sm bg-faint/50" />
        <i className="block w-[3px] h-[7px] rounded-sm bg-faint/50" />
      </span>
    </span>
  );
}
