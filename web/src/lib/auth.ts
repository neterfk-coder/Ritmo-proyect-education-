/**
 * The account layer.
 *
 * NOT CONNECTED TO ANYTHING YET. `stubAuth` below simulates the round trips so
 * the screens can be designed and tested, and it deliberately persists nothing
 * — no account, and above all no password, is written to memory, to
 * localStorage, or anywhere else. A prototype that stashes credentials
 * somewhere convenient is how credentials end up somewhere permanent.
 *
 * To connect it: implement `AuthService` against the real endpoints and swap
 * the export at the bottom. Every screen talks to this interface and nothing
 * else, so no component needs to change.
 *
 *   POST /api/auth/register        { alias, email, password }  -> Account
 *   POST /api/auth/signin          { email, password }         -> Account
 *   POST /api/auth/forgot          { email }                   -> 204 always
 *   POST /api/auth/reset           { token, password }         -> 204
 *
 * Three things the real implementation has to get right, none of which the
 * stub can teach you:
 *   · Hash with argon2id or bcrypt at a sane cost. Never store the password.
 *   · /forgot must answer identically whether or not the address exists, or
 *     it becomes a way to find out who has an account here.
 *   · Reset tokens: single use, short lived, compared in constant time.
 */

export interface Account {
  id: string;
  alias: string;
  email: string;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<Account>;
  register(input: { alias: string; email: string; password: string }): Promise<Account>;
  requestReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
}

export class AuthError extends Error {
  field?: "email" | "password" | "alias" | "confirm";
  constructor(message: string, field?: AuthError["field"]) {
    super(message);
    this.field = field;
  }
}

/* ---------- validation ---------- */

// Deliberately permissive. Address validation that rejects real addresses is a
// far more common failure than one that lets a typo through, and the typo gets
// caught by the mail never arriving.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function checkEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "An address is needed to get back in.";
  if (!EMAIL.test(email)) return "That does not look like an address.";
  return null;
}

export function checkAlias(value: string): string | null {
  const alias = value.trim();
  if (!alias) return "Any name will do. It is only shown to you.";
  if (alias.length > 40) return "A little shorter.";
  return null;
}

export const MIN_PASSWORD = 10;

export function checkPassword(value: string): string | null {
  if (!value) return "A password is needed.";
  if (value.length < MIN_PASSWORD) return `At least ${MIN_PASSWORD} characters.`;
  if (COMMON.has(value.toLowerCase())) return "That one is guessed early. Try something else.";
  return null;
}

// The short list of passwords that are tried first in every credential-stuffing
// run. Rejecting them costs nothing and removes the worst outcomes.
const COMMON = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890",
  "qwertyuiop", "letmein123", "iloveyou1", "welcome123", "admin12345",
]);

/* ---------- strength ---------- */

export interface Strength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hint: string;
}

/**
 * A rough, honest strength estimate: length carries most of it, variety adds
 * some, and obvious shapes take it away. It is guidance, not a gate — the gate
 * is `checkPassword`.
 */
export function strengthOf(value: string): Strength {
  if (!value) return { score: 0, label: "", hint: "" };

  const classes =
    Number(/[a-z]/.test(value)) +
    Number(/[A-Z]/.test(value)) +
    Number(/[0-9]/.test(value)) +
    Number(/[^A-Za-z0-9]/.test(value));

  let points = Math.min(4, Math.floor(value.length / 5)) + Math.max(0, classes - 1);

  if (/^(.)\1+$/.test(value)) points = 0;                 // aaaaaaaaaa
  if (/^(012|123|234|345|456|567|678|789|abc|qwe)/i.test(value)) points -= 2;
  if (COMMON.has(value.toLowerCase())) points = 0;

  const score = Math.max(0, Math.min(4, points)) as Strength["score"];

  return {
    score,
    label: ["Guessed at once", "Weak", "Passable", "Good", "Strong"][score],
    hint:
      score >= 3
        ? "Length is what makes this hard to break, and you have it."
        : value.length < MIN_PASSWORD
          ? `${MIN_PASSWORD - value.length} more character${MIN_PASSWORD - value.length === 1 ? "" : "s"}.`
          : "Longer beats stranger. Three unrelated words is stronger than one word with symbols.",
  };
}

/* ---------- the stub ---------- */

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Stands in for the server. Answers the shape the real endpoints will answer,
 * with enough delay that loading states are real rather than theoretical.
 */
export const stubAuth: AuthService = {
  async signIn(email, password) {
    await pause(700);
    const bad = checkEmail(email);
    if (bad) throw new AuthError(bad, "email");
    if (!password) throw new AuthError("A password is needed.", "password");

    // A real sign-in fails here for a wrong password. This one cannot know, so
    // it says so rather than pretending the credentials were checked.
    return { id: "stub", alias: email.split("@")[0], email: email.trim() };
  },

  async register({ alias, email, password }) {
    await pause(900);
    for (const [problem, field] of [
      [checkAlias(alias), "alias"],
      [checkEmail(email), "email"],
      [checkPassword(password), "password"],
    ] as const) {
      if (problem) throw new AuthError(problem, field);
    }
    return { id: "stub", alias: alias.trim(), email: email.trim() };
  },

  async requestReset(email) {
    await pause(800);
    const bad = checkEmail(email);
    if (bad) throw new AuthError(bad, "email");
    // Note the absence of a "no account with that address" branch. That is the
    // point, and the real one must keep it.
  },

  async resetPassword(token, password) {
    await pause(800);
    if (!token) throw new AuthError("That link is missing its token.");
    const bad = checkPassword(password);
    if (bad) throw new AuthError(bad, "password");
  },
};

export const auth: AuthService = stubAuth;

/** True while the screens are running against the stub rather than a server. */
export const AUTH_IS_STUB = auth === stubAuth;
