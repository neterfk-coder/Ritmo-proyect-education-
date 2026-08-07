import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStudent } from "../state/StudentContext";
import { useT } from "../lib/i18n";
import type { Key, T } from "../lib/i18n";
import { isGuest } from "../lib/guest";
import { FormatGlyph } from "./FormatGlyph";
import type { Format } from "../lib/types";

/**
 * The account menu.
 *
 * The header used to end with the student's name as plain text — the one thing
 * on screen that looked like it should do something and did not. Behind it sat
 * a real gap: four fields were asked once during setup and then locked
 * forever. There was no way to change your own name, the age band that goes
 * into the model's prompt, the shape tasks open in, or the free-text line about
 * yourself.
 *
 * That last one mattered most. A student could write something personal at
 * setup and had no way to take it back, in a product whose whole argument is
 * that the data belongs to them. The privacy page promised control the
 * interface did not offer.
 *
 * Order here is by what somebody actually reaches for: where they are going,
 * then the one irreversible thing a guest needs, then the settings, then the
 * way out. Editing saves as you go — there is no Save button to forget.
 */

const BANDS: { key: "elementary" | "middle" | "high"; label: Key }[] = [
  { key: "elementary", label: "setup.band.elementary" },
  { key: "middle", label: "setup.band.middle" },
  { key: "high", label: "setup.band.high" },
];

const FORMATS: { key: Format; label: Key }[] = [
  { key: "skeleton", label: "fmt.skeleton" },
  { key: "dialogue", label: "fmt.dialogue" },
  { key: "map", label: "fmt.map" },
  { key: "comic", label: "fmt.comic" },
  { key: "audio", label: "fmt.audio" },
];

const PAGES: { to: string; label: Key }[] = [
  { to: "/work", label: "nav.work" },
  { to: "/profile", label: "nav.profile" },
  { to: "/privacy", label: "nav.privacy" },
];

export function AccountMenu() {
  const { student, patch, signOut } = useStudent();
  const navigate = useNavigate();
  const t = useT();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [copied, setCopied] = useState(false);

  const wrap = useRef<HTMLDivElement>(null);

  // Reset the drafts each time it opens, so a half-typed edit that was
  // abandoned does not reappear later looking like it was saved.
  useEffect(() => {
    if (!open || !student) return;
    setName(student.alias);
    setAbout(student.identifiesAs ?? "");
    setCopied(false);
  }, [open, student?.alias, student?.identifiesAs]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!student) return null;

  const saveName = () => {
    const next = name.trim().slice(0, 40);
    if (next && next !== student.alias) patch({ alias: next });
    else setName(student.alias);
  };

  const saveAbout = () => {
    const next = about.trim().slice(0, 200);
    if (next !== (student.identifiesAs ?? "")) patch({ identifiesAs: next || null });
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(student.id);
      setCopied(true);
    } catch {
      // Clipboard blocked. The id is on the privacy page in full, so send them
      // there rather than leaving a button that did nothing.
      setOpen(false);
      navigate("/privacy");
    }
  };

  return (
    <div className="relative" ref={wrap}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("account.open")}
        className="flex items-center gap-2 rounded-card border border-line bg-surface
                   py-1 pl-1 pr-1.5 sm:pr-2.5 transition-colors duration-200 ease-calm
                   hover:border-muted hover:bg-raised"
      >
        <Mark alias={student.alias} />
        <span className="hidden sm:inline text-sm text-ink max-w-[7rem] truncate">
          {student.alias}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-[min(21rem,calc(100vw-1.5rem))]
                     card rise floating overflow-hidden"
        >
          <header className="flex items-center gap-3 px-4 py-3.5 bg-raised/50 border-b border-line">
            <Mark alias={student.alias} size="lg" />
            <div className="min-w-0">
              <p className="text-sm text-ink leading-tight truncate">{student.alias}</p>
              <p className="text-[0.6875rem] text-faint leading-tight pt-0.5">
                {isGuest() ? t("account.guest") : t("account.local")}
              </p>
            </div>
          </header>

          <div className="max-h-[min(30rem,70vh)] overflow-y-auto">
            {/* Where you are going. The current page is marked rather than
                hidden, so the menu always shows the whole map. */}
            <nav className="p-2 border-b border-line">
              {PAGES.map((page) => (
                <NavLink
                  key={page.to}
                  to={page.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-[0.4rem] px-2.5 py-2 text-sm
                     transition-colors duration-150 ${
                       isActive
                         ? "bg-raised text-ink"
                         : "text-muted hover:bg-raised hover:text-ink"
                     }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {t(page.label)}
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-lit" aria-hidden />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/*
              The account id, one press away.

              For a guest this is the only route back to their work from any
              other browser, and it is the single most consequential thing in
              this menu — so it is above the settings rather than below them.
            */}
            <div className="p-3 border-b border-line space-y-1.5">
              <button
                onClick={copyId}
                className="w-full text-left rounded-[0.4rem] px-2.5 py-2 text-sm text-muted
                           hover:bg-raised hover:text-ink transition-colors duration-150"
              >
                {copied ? t("account.copied") : t("account.copyId")}
              </button>
              {copied && (
                <p className="text-[0.6875rem] text-faint reading px-2.5">
                  {t("account.copiedNote")}
                </p>
              )}
            </div>

            <Section label={t("account.name")}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                maxLength={40}
                className="field !py-1.5 !text-sm"
                aria-label={t("account.name")}
              />
            </Section>

            <Section label={t("account.startFormat")}>
              <div className="grid grid-cols-5 gap-1">
                {FORMATS.map((f) => {
                  const active = student.defaultFormat === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => patch({ defaultFormat: f.key })}
                      aria-pressed={active}
                      title={t(f.label)}
                      className={`grid place-items-center rounded-[0.4rem] border py-1.5
                        transition-colors duration-150 ${
                          active
                            ? "bg-ink text-surface border-ink"
                            : "border-line text-muted hover:text-ink hover:bg-raised"
                        }`}
                    >
                      <FormatGlyph format={f.key} />
                      <span className="sr-only">{t(f.label)}</span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section label={t("account.band")}>
              <div className="flex flex-wrap gap-1.5">
                {BANDS.map((band) => (
                  <button
                    key={band.key}
                    onClick={() => patch({ ageBand: band.key })}
                    aria-pressed={student.ageBand === band.key}
                    className={`px-2.5 py-1 text-xs rounded-[0.4rem] border transition-colors ${
                      student.ageBand === band.key
                        ? "bg-ink text-surface border-ink"
                        : "border-line text-muted hover:text-ink"
                    }`}
                  >
                    {t(band.label)}
                  </button>
                ))}
              </div>
            </Section>

            {/*
              The one field that had no way back out. Somebody can write
              something personal here at setup; until now nothing in the
              interface could remove it, while the privacy page promised the
              data was theirs. The clear button is the point of this block.
            */}
            <Section label={t("account.about")}>
              <input
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                onBlur={saveAbout}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                maxLength={200}
                placeholder={t("account.aboutPlaceholder")}
                className="field !py-1.5 !text-sm"
                aria-label={t("account.about")}
              />
              <div className="flex items-center justify-between gap-3 pt-1.5">
                <p className="text-[0.6875rem] text-faint reading">{t("account.aboutNote")}</p>
                {student.identifiesAs && (
                  <button
                    className="btn-bare !text-[0.6875rem] shrink-0"
                    onClick={() => {
                      setAbout("");
                      patch({ identifiesAs: null });
                    }}
                  >
                    {t("account.clear")}
                  </button>
                )}
              </div>
            </Section>

            <div className="p-3">
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                  navigate("/");
                }}
                className="w-full text-left rounded-[0.4rem] px-2.5 py-2 text-sm text-muted
                           hover:bg-raised hover:text-ink transition-colors duration-150"
              >
                {t("account.signOut")}
              </button>
              <p className="text-[0.6875rem] text-faint reading px-2.5 pt-1.5">
                {t("account.signOutNote")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The first letter of whatever they called themselves.
 *
 * Not a photograph and not a generated identicon — this product asks for a
 * name and nothing else, and the mark should not imply it knows more than
 * that.
 */
function Mark({ alias, size = "sm" }: { alias: string; size?: "sm" | "lg" }) {
  const letter = alias.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className={`grid place-items-center rounded-[0.35rem] bg-pine text-surface font-display
                  shrink-0 ${size === "lg" ? "h-9 w-9 text-base" : "h-6 w-6 text-xs"}`}
    >
      {letter}
    </span>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-3 border-b border-line space-y-1.5">
      <p className="eyebrow px-0.5">{label}</p>
      {children}
    </div>
  );
}
