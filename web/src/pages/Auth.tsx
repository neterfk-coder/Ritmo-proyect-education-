import { useEffect, useId, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Owl } from "../components/Owl";
import { LangToggle } from "../components/LangToggle";
import { useStudent } from "../state/StudentContext";
import { createGuest, explainCreateFailure } from "../lib/guest";
import { useDocumentTitle } from "../lib/title";
import { useT } from "../lib/i18n";
import type { Key, T } from "../lib/i18n";
import {
  AUTH_IS_STUB, AuthError, auth, checkAlias, checkEmail, checkPassword, strengthOf,
} from "../lib/auth";
import type { Problem } from "../lib/auth";

type Mode = "signin" | "register" | "forgot" | "reset";

const DEPTH: Record<Mode, number> = { signin: 0, register: 1, forgot: 2, reset: 3 };

const COPY: Record<Mode, { eyebrow: Key; title: Key; blurb: Key; submit: Key }> = {
  signin: {
    eyebrow: "auth.signin.eyebrow",
    title: "auth.signin.title",
    blurb: "auth.signin.blurb",
    submit: "auth.signin.submit",
  },
  register: {
    eyebrow: "auth.register.eyebrow",
    title: "auth.register.title",
    blurb: "auth.register.blurb",
    submit: "auth.register.submit",
  },
  forgot: {
    eyebrow: "auth.forgot.eyebrow",
    title: "auth.forgot.title",
    blurb: "auth.forgot.blurb",
    submit: "auth.forgot.submit",
  },
  reset: {
    eyebrow: "auth.reset.eyebrow",
    title: "auth.reset.title",
    blurb: "auth.reset.blurb",
    submit: "auth.reset.submit",
  },
};

const TITLES: Record<Mode, Key> = {
  signin: "auth.title.signin",
  register: "auth.title.register",
  forgot: "auth.title.forgot",
  reset: "auth.title.reset",
};

export function Auth({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setStudent } = useStudent();
  const t = useT();

  useDocumentTitle(t(TITLES[mode]));

  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // Problems are kept as keys and worded at the point of display, so switching
  // language with an error already on screen translates the error too.
  const [errors, setErrors] = useState<Record<string, Problem | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  // Arriving from the landing page's "go straight in" lands on the one
  // optional question rather than on the sign-in form with the guest button
  // somewhere below it. Pressing a button that says "no account" and then
  // being shown a password field is the kind of small betrayal that costs
  // more trust than it saves clicks.
  const [askingName, setAskingName] = useState(() => params.get("guest") === "1");
  const [guestName, setGuestName] = useState("");
  const [done, setDone] = useState<null | "sent" | "in" | "reset">(null);

  // Which way the panel should come in from.
  const previous = useRef<Mode>(mode);
  const direction = DEPTH[mode] >= DEPTH[previous.current] ? "auth-forward" : "auth-back";
  useEffect(() => { previous.current = mode; }, [mode]);

  // A fresh screen is a fresh form. Carrying a half-typed password across a
  // mode switch is the kind of surprise that loses trust in a login box.
  useEffect(() => {
    setErrors({});
    setFormError(null);
    setDone(null);
    setPassword("");
    setConfirm("");
  }, [mode]);

  const strength = strengthOf(password);
  const needsStrength = mode === "register" || mode === "reset";

  const validate = () => {
    const next: Record<string, Problem | null> = {};
    if (mode === "register") next.alias = checkAlias(alias);
    if (mode !== "reset") next.email = checkEmail(email);
    if (mode !== "forgot") next.password = checkPassword(password);
    if (needsStrength && confirm !== password) next.confirm = { key: "auth.err.mismatch" };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      if (mode === "signin") {
        await auth.signIn(email, password);
        setDone("in");
      } else if (mode === "register") {
        await auth.register({ alias, email, password });
        setDone("in");
      } else if (mode === "forgot") {
        await auth.requestReset(email);
        setDone("sent");
      } else {
        await auth.resetPassword(params.get("token") ?? "", password);
        setDone("reset");
      }
    } catch (err) {
      if (err instanceof AuthError && err.field && err.problem) {
        setErrors((prev) => ({ ...prev, [err.field as string]: err.problem as Problem }));
      } else if (err instanceof AuthError && err.problem) {
        setFormError(t(err.problem.key, err.problem.vars));
      } else {
        setFormError(err instanceof Error ? err.message : t("auth.err.generic"));
      }
    } finally {
      setBusy(false);
    }
  };

  /**
   * Straight in. This is a real account with the setup questions answered for
   * you, not a demo sandbox — it just skips the part that stops people who
   * came here because starting things is the hard bit.
   *
   * One question is asked first, and it is optional: what to call you. Leaving
   * it empty has to work as well as filling it in, or it is a form again.
   */
  const enterAsGuest = async () => {
    setFormError(null);
    setGuestBusy(true);
    try {
      setStudent(await createGuest(guestName));
      navigate("/work", { replace: true });
    } catch (err) {
      setFormError(explainCreateFailure(err));
      setGuestBusy(false);
    }
  };

  const copy = COPY[mode];

  return (
    <div className="min-h-screen grid place-items-center px-6 py-16">
      <div className="w-full max-w-[26rem] space-y-8">
        <header className="flex items-center gap-3">
          <Owl size={40} />
          <div>
            <p className="font-display text-2xl leading-none tracking-tight">Ritmo</p>
            <p className="text-[0.6875rem] text-faint leading-tight pt-1">{t("auth.tagline")}</p>
          </div>
          {/*
            The front door needs its own switch: there is no header out here,
            and this is the first screen anybody sees. Landing on a sign-in box
            in a language you do not read, with the control to change it three
            screens deep, is where a bilingual product actually loses people.
          */}
          <LangToggle className="ml-auto" />
        </header>

        <div key={mode + (done ?? "") + (askingName ? "-name" : "")} className={askingName ? "auth-forward" : direction}>
          {askingName ? (
            <GuestName
              t={t}
              value={guestName}
              onChange={setGuestName}
              busy={guestBusy}
              error={formError}
              onEnter={enterAsGuest}
              onBack={() => {
                setAskingName(false);
                setFormError(null);
              }}
            />
          ) : done ? (
            <Finished
              t={t}
              state={done}
              email={email}
              onContinue={() => navigate("/setup")}
              onBackToSignIn={() => navigate("/signin")}
            />
          ) : (
            <form onSubmit={submit} noValidate className="panel p-6 sm:p-7 space-y-6">
              <span className="panel-legend">{t(copy.eyebrow)}</span>

              <div className="space-y-2 pt-1">
                <h1 className="font-display text-[1.6rem] leading-[1.25] tracking-tight">
                  {t(copy.title)}
                </h1>
                <p className="text-sm text-muted reading">{t(copy.blurb)}</p>
              </div>

              <div className="space-y-4">
                {mode === "register" && (
                  <Field
                    t={t}
                    label={t("auth.field.alias")}
                    value={alias}
                    onChange={setAlias}
                    error={errors.alias}
                    autoComplete="nickname"
                    hint={t("auth.field.aliasHint")}
                    onBlur={() => setErrors((p) => ({ ...p, alias: checkAlias(alias) }))}
                  />
                )}

                {mode !== "reset" && (
                  <Field
                    t={t}
                    label={t("auth.field.email")}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    autoComplete="email"
                    onBlur={() => setErrors((p) => ({ ...p, email: checkEmail(email) }))}
                  />
                )}

                {mode !== "forgot" && (
                  <Field
                    t={t}
                    label={mode === "signin" ? t("auth.field.password") : t("auth.field.newPassword")}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                )}

                {needsStrength && password && <Meter t={t} strength={strength} />}

                {needsStrength && (
                  <Field
                    t={t}
                    label={t("auth.field.confirm")}
                    type="password"
                    value={confirm}
                    onChange={setConfirm}
                    error={errors.confirm}
                    autoComplete="new-password"
                  />
                )}
              </div>

              {formError && (
                <p className="nudge text-sm text-muted border-l-2 border-line pl-3">{formError}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className={`btn-primary w-full relative overflow-hidden ${busy ? "sweep" : ""}`}
              >
                {busy ? t("auth.working") : t(copy.submit)}
              </button>

              <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
                {mode !== "signin" && (
                  <button type="button" className="btn-bare" onClick={() => navigate("/signin")}>
                    {t("auth.haveAccount")}
                  </button>
                )}
                {mode === "signin" && (
                  <>
                    <button type="button" className="btn-bare" onClick={() => navigate("/register")}>
                      {t("auth.setOneUp")}
                    </button>
                    <button type="button" className="btn-bare" onClick={() => navigate("/forgot")}>
                      {t("auth.forgotLink")}
                    </button>
                  </>
                )}
              </nav>

              {/*
                Guest is not the small grey escape hatch at the bottom. Somebody
                who came here stuck on starting a task should not have to get
                through a sign-up form first — that is the same wall the product
                exists to remove, rebuilt at the front door.
              */}
              <div className="border-t border-line pt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setAskingName(true);
                  }}
                  disabled={busy}
                  className="btn-quiet w-full"
                >
                  {t("auth.guestButton")}
                </button>
                <p className="text-xs text-faint reading">{t("auth.guestBlurb")}</p>
                <button type="button" className="btn-bare !text-xs" onClick={() => navigate("/setup")}>
                  {t("auth.setupFirst")}
                </button>
              </div>
            </form>
          )}
        </div>

        {AUTH_IS_STUB && (
          <p className="text-xs text-faint reading border-l-2 border-line pl-3">
            {t("auth.stubNote")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

/**
 * The only thing asked before letting a guest in, and it is optional.
 *
 * Both buttons are real: "Go in" works with the box empty, and skipping is not
 * hidden behind small grey text. A single optional question is the most that
 * can be asked of somebody who pressed a button that promised no account.
 */
function GuestName({
  t, value, onChange, busy, error, onEnter, onBack,
}: {
  t: T;
  value: string;
  onChange: (v: string) => void;
  busy: boolean;
  error: string | null;
  onEnter: () => void;
  onBack: () => void;
}) {
  const id = useId();
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => { field.current?.focus(); }, []);

  return (
    <form
      className="panel p-6 sm:p-7 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy) onEnter();
      }}
    >
      <span className="panel-legend">{t("auth.guest.legend")}</span>

      <div className="space-y-2 pt-1">
        <h1 className="font-display text-[1.6rem] leading-[1.25] tracking-tight">
          {t("auth.guest.title")}
        </h1>
        <p className="text-sm text-muted reading">{t("auth.guest.blurb")}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={id} className="sr-only">
          {t("auth.guest.title")}
        </label>
        <input
          id={id}
          ref={field}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={40}
          autoComplete="nickname"
          placeholder={t("auth.guest.placeholder")}
          className="field"
        />
      </div>

      {error && (
        <p className="nudge text-sm text-muted reading border-l-2 border-line pl-3">{error}</p>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={busy}
          className={`btn-primary w-full relative overflow-hidden ${busy ? "sweep" : ""}`}
        >
          {busy
            ? t("auth.guest.opening")
            : value.trim()
              ? t("auth.guest.enterAs", { name: value.trim() })
              : t("auth.guest.enterPlain")}
        </button>
        <button type="button" className="btn-bare !text-xs" onClick={onBack} disabled={busy}>
          {t("auth.guest.back")}
        </button>
      </div>
    </form>
  );
}

function Field({
  t, label, value, onChange, error, type = "text", autoComplete, hint, onBlur,
}: {
  t: T;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: Problem | null;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  hint?: string;
  onBlur?: () => void;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="eyebrow">
          {label}
        </label>
        {isPassword && value && (
          <button
            type="button"
            className="btn-bare !text-[0.6875rem]"
            onClick={() => setRevealed((v) => !v)}
            aria-pressed={revealed}
          >
            {revealed ? t("auth.hide") : t("auth.show")}
          </button>
        )}
      </div>

      <input
        id={id}
        type={isPassword && revealed ? "text" : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`field ${error ? "nudge border-muted" : ""}`}
      />

      {error ? (
        <p id={`${id}-error`} className="text-xs text-muted reading">
          {t(error.key, error.vars)}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-faint reading">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Four segments rather than a percentage. A number invites you to optimise it;
 * segments say "further along is better" and leave it there.
 */
function Meter({ t, strength }: { t: T; strength: ReturnType<typeof strengthOf> }) {
  const width = `${(strength.score / 4) * 100}%`;
  const colour =
    strength.score <= 1 ? "rgb(var(--c-faint))"
      : strength.score === 2 ? "rgb(var(--c-lit))"
        : "rgb(var(--c-pine))";

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="h-1 rounded-full bg-line overflow-hidden">
        <div className="meter-fill h-1 rounded-full" style={{ width, background: colour }} />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs text-muted">{strength.label ? t(strength.label) : ""}</p>
      </div>
      <p className="text-xs text-faint reading">
        {strength.hint ? t(strength.hint.key, strength.hint.vars) : ""}
      </p>
    </div>
  );
}

function Finished({
  t, state, email, onContinue, onBackToSignIn,
}: {
  t: T;
  state: "sent" | "in" | "reset";
  email: string;
  onContinue: () => void;
  onBackToSignIn: () => void;
}) {
  const copy = {
    sent: {
      legend: t("auth.done.sent.legend"),
      title: t("auth.done.sent.title"),
      body: t("auth.done.sent.body", { email: email || t("auth.done.sent.thatAddress") }),
      action: null,
    },
    in: {
      legend: t("auth.done.in.legend"),
      title: t("auth.done.in.title"),
      body: t("auth.done.in.body"),
      action: t("auth.done.in.action"),
    },
    reset: {
      legend: t("auth.done.reset.legend"),
      title: t("auth.done.reset.title"),
      body: t("auth.done.reset.body"),
      action: null,
    },
  }[state];

  return (
    <div className="panel p-6 sm:p-8 space-y-5">
      <span className="panel-legend">{copy.legend}</span>

      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="mt-1">
        <circle cx="17" cy="17" r="15.5" fill="none" stroke="rgb(var(--c-line))" strokeWidth="1.5" />
        <path
          d="M10.5 17.5 L15 22 L23.5 12"
          className="draw-check"
          fill="none"
          stroke="rgb(var(--c-pine))"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="space-y-2">
        <h1 className="font-display text-[1.5rem] leading-snug tracking-tight">{copy.title}</h1>
        <p className="text-sm text-muted reading">{copy.body}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {copy.action ? (
          <button className="btn-primary" onClick={onContinue}>
            {copy.action}
          </button>
        ) : (
          <button className="btn-quiet" onClick={onBackToSignIn}>
            {t("auth.backToSignIn")}
          </button>
        )}
      </div>
    </div>
  );
}
