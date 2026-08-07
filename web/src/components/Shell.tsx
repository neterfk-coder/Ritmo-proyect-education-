import { NavLink, Outlet } from "react-router-dom";
import { useStudent } from "../state/StudentContext";
import { useT } from "../lib/i18n";
import type { Key } from "../lib/i18n";
import { AccessibilityBar } from "./AccessibilityBar";
import { Companion } from "./Companion";
import { GuestStrip } from "./GuestStrip";
import { LangToggle } from "./LangToggle";
import { AccountMenu } from "./AccountMenu";

const NAV: { to: string; label: Key }[] = [
  { to: "/work", label: "nav.work" },
  { to: "/profile", label: "nav.profile" },
  { to: "/privacy", label: "nav.privacy" },
];

export function Shell() {
  const { student, aiMode, hosted } = useStudent();
  const t = useT();

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
                   focus:bg-surface focus:border focus:border-line focus:rounded-card
                   focus:px-4 focus:py-2 focus:text-sm"
      >
        {t("shell.skip")}
      </a>

      {/* Spacing tightens before anything is hidden: on a 360px phone the
          header held more than fit, and the first thing to give must be air,
          not controls — every control up here exists because somebody needs
          it mid-struggle. */}
      <header className="border-b border-line bg-surface/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-page px-3 sm:px-6 h-16 flex items-center gap-2 sm:gap-8">
          <Wordmark />
          {/* The active page is marked by a rule under it rather than a filled
              pill: it reads as "you are here" without another block of colour
              competing with the step. */}
          <nav className="flex items-center gap-1 h-full" aria-label={t("nav.aria")}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative h-full flex items-center px-1.5 sm:px-3 text-sm transition-colors
                   duration-200 ease-calm ${isActive ? "text-ink" : "text-muted hover:text-ink"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {t(item.label)}
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
          <div className="ml-auto flex items-center gap-1.5 sm:gap-4">
            {aiMode === "mock" && (
              <span className="eyebrow hidden lg:inline" title={t("shell.offlineTitle")}>
                {t("shell.offline")}
              </span>
            )}
            <LangToggle />
            <AccessibilityBar />
            {/* The name used to sit here as plain text — the one thing in the
                header that looked like it should do something and did not.
                Behind it were four fields locked since setup. */}
            <AccountMenu />
          </div>
        </div>
      </header>

      <GuestStrip />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Companion />

      <footer className="border-t border-line">
        <div className="mx-auto max-w-page px-6 py-6 flex flex-wrap gap-x-6 gap-y-2 items-baseline">
          <span className="eyebrow">Ritmo</span>
          <p className="text-sm text-muted">
            {t("shell.promise")}{" "}
            {hosted ? (
              <>
                {t("shell.hosted")}{" "}
                <NavLink to="/privacy" className="underline underline-offset-4 decoration-line">
                  {t("shell.hostedLink")}
                </NavLink>
                .
              </>
            ) : (
              t("shell.local")
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Wordmark() {
  return (
    <span className="flex items-baseline gap-2 select-none shrink-0">
      <span className="font-display text-xl sm:text-2xl tracking-tight">Ritmo</span>
      {/* The mark is the product thesis: many steps, one lit. On a narrow
          phone the name alone carries it — the bars are the first ornament
          to go, and the only one. */}
      <span className="hidden sm:flex items-center gap-[3px] pb-1" aria-hidden="true">
        <i className="block w-[3px] h-[7px] rounded-sm bg-faint/50" />
        <i className="block w-[3px] h-[11px] rounded-sm bg-lit" />
        <i className="block w-[3px] h-[7px] rounded-sm bg-faint/50" />
        <i className="block w-[3px] h-[7px] rounded-sm bg-faint/50" />
      </span>
    </span>
  );
}
