import { useEffect, useId, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Owl } from "../components/Owl";
import { useStudent } from "../state/StudentContext";
import { createGuest, explainCreateFailure } from "../lib/guest";
import {
  AUTH_IS_STUB, AuthError, auth, checkAlias, checkEmail, checkPassword, strengthOf,
} from "../lib/auth";

type Mode = "signin" | "register" | "forgot" | "reset";

const DEPTH: Record<Mode, number> = { signin: 0, register: 1, forgot: 2, reset: 3 };

const COPY: Record<Mode, { eyebrow: string; title: string; blurb: string; submit: string }> = {
  signin: {
    eyebrow: "Welcome back",
    title: "Pick up where you left off.",
    blurb: "Your rules, your tasks and everything the sessions have shown are waiting.",
    submit: "Open my account",
  },
  register: {
    eyebrow: "New here",
    title: "Set up an account.",
    blurb: "One name, one address, one password. Nothing else is asked for, and nothing else is stored.",
    submit: "Create it",
  },
  forgot: {
    eyebrow: "Locked out",
    title: "Send me a way back in.",
    blurb: "Put in the address you used. If there is an account on it, a link goes out that works once.",
    submit: "Send the link",
  },
  reset: {
    eyebrow: "Almost there",
    title: "Choose a new password.",
    blurb: "This link stops working the moment you use it.",
    submit: "Save it and sign in",
  },
};

export function Auth({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setStudent } = useStudent();

  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
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
    const next: Record<string, string | null> = {};
    if (mode === "register") next.alias = checkAlias(alias);
    if (mode !== "reset") next.email = checkEmail(email);
    if (mode !== "forgot") next.password = checkPassword(password);
    if (needsStrength && confirm !== password) next.confirm = "These two do not match.";
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
      if (err instanceof AuthError && err.field) {
        setErrors((prev) => ({ ...prev, [err.field as string]: err.message }));
      } else {
        setFormError(err instanceof Error ? err.message : "That did not go through.");
      }
    } finally {
      setBusy(false);
    }
  };

  /**
   * Straight in. This is a real account with the setup questions answered for
   * you, not a demo sandbox — it just skips the part that stops people who
   * came here because starting things is the hard bit.
   */
  const enterAsGuest = async () => {
    setFormError(null);
    setGuestBusy(true);
    try {
      setStudent(await createGuest());
      navigate("/work");
    } catch (err) {
      setFormError(explainCreateFailure(err));
    } finally {
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
            <p className="text-[0.6875rem] text-faint leading-tight pt-1">One step, lit</p>
          </div>
        </header>

        <div key={mode + (done ?? "")} className={direction}>
          {done ? (
            <Finished
              state={done}
              email={email}
              onContinue={() => navigate("/setup")}
              onBackToSignIn={() => navigate("/signin")}
            />
          ) : (
            <form onSubmit={submit} noValidate className="panel p-6 sm:p-7 space-y-6">
              <span className="panel-legend">{copy.eyebrow}</span>

              <div className="space-y-2 pt-1">
                <h1 className="font-display text-[1.6rem] leading-[1.25] tracking-tight">
                  {copy.title}
                </h1>
                <p className="text-sm text-muted reading">{copy.blurb}</p>
              </div>

              <div className="space-y-4">
                {mode === "register" && (
                  <Field
                    label="What should this call you?"
                    value={alias}
                    onChange={setAlias}
                    error={errors.alias}
                    autoComplete="nickname"
                    hint="Any name. It is only ever shown to you."
                    onBlur={() => setErrors((p) => ({ ...p, alias: checkAlias(alias) }))}
                  />
                )}

                {mode !== "reset" && (
                  <Field
                    label="Email"
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
                    label={mode === "signin" ? "Password" : "New password"}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                )}

                {needsStrength && password && <Meter strength={strength} />}

                {needsStrength && (
                  <Field
                    label="Type it once more"
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
                {busy ? "Working…" : copy.submit}
              </button>

              <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
                {mode !== "signin" && (
                  <button type="button" className="btn-bare" onClick={() => navigate("/signin")}>
                    I already have an account
                  </button>
                )}
                {mode === "signin" && (
                  <>
                    <button type="button" className="btn-bare" onClick={() => navigate("/register")}>
                      Set one up
                    </button>
                    <button type="button" className="btn-bare" onClick={() => navigate("/forgot")}>
                      I forgot my password
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
                  onClick={enterAsGuest}
                  disabled={guestBusy || busy}
                  className={`btn-quiet w-full relative overflow-hidden ${guestBusy ? "sweep" : ""}`}
                >
                  {guestBusy ? "Opening…" : "Go straight in, no account"}
                </button>
                <p className="text-xs text-faint reading">
                  Everything works: tasks, formats, the profile, the page for your teacher. It
                  lives in this browser, and you can pick up an account later without losing it.
                </p>
                <button type="button" className="btn-bare !text-xs" onClick={() => navigate("/setup")}>
                  Or answer the setup questions first
                </button>
              </div>
            </form>
          )}
        </div>

        {AUTH_IS_STUB && (
          <p className="text-xs text-faint reading border-l-2 border-line pl-3">
            These screens are not connected to a database yet. Nothing you type here is saved
            anywhere — not the address, and not the password. Use “Skip” to reach the working app.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function Field({
  label, value, onChange, error, type = "text", autoComplete, hint, onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
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
            {revealed ? "hide" : "show"}
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
          {error}
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
function Meter({ strength }: { strength: ReturnType<typeof strengthOf> }) {
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
        <p className="text-xs text-muted">{strength.label}</p>
      </div>
      <p className="text-xs text-faint reading">{strength.hint}</p>
    </div>
  );
}

function Finished({
  state, email, onContinue, onBackToSignIn,
}: {
  state: "sent" | "in" | "reset";
  email: string;
  onContinue: () => void;
  onBackToSignIn: () => void;
}) {
  const copy = {
    sent: {
      legend: "Sent",
      title: "Check your email.",
      body: `If there is an account on ${email || "that address"}, a link is on its way. It works once and then stops. We do not say whether the address is registered — that would tell anyone who asked.`,
      action: null,
    },
    in: {
      legend: "Ready",
      title: "That is the account part done.",
      body: "The account layer is not wired to a server yet, so nothing was saved. The app itself works — carry on and set up how it should talk to you.",
      action: "Set up how it talks to me",
    },
    reset: {
      legend: "Changed",
      title: "Your password is set.",
      body: "The link you used has stopped working. Sign in with the new one.",
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
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}
