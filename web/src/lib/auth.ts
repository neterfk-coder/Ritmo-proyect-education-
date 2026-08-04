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

import type { Key } from "./i18n";

export interface Account {
  id: string;
  alias: string;
  email: string;
}

/**
 * A problem, named rather than worded.
 *
 * The checks below return one of these instead of a sentence. This file has no
 * React in it and no notion of which language is on screen, and a validator
 * that hard-codes English is a validator that has to be rewritten to add a
 * second one. The screen translates at the point of display.
 */
export interface Problem {
  key: Key;
  vars?: Record<string, string | number>;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<Account>;
  register(input: { alias: string; email: string; password: string }): Promise<Account>;
  requestReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
}

export class AuthError extends Error {
  field?: "email" | "password" | "alias" | "confirm";
  /** Set when the failure is one the dictionary has wording for. */
  problem?: Problem;
  constructor(problem: Problem, field?: AuthError["field"]) {
    super(problem.key);
    this.problem = problem;
    this.field = field;
  }
}

/* ---------- validation ---------- */

// Deliberately permissive. Address validation that rejects real addresses is a
// far more common failure than one that lets a typo through, and the typo gets
// caught by the mail never arriving.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function checkEmail(value: string): Problem | null {
  const email = value.trim();
  if (!email) return { key: "auth.err.emailEmpty" };
  if (!EMAIL.test(email)) return { key: "auth.err.emailShape" };
  return null;
}

export function checkAlias(value: string): Problem | null {
  const alias = value.trim();
  if (!alias) return { key: "auth.err.aliasEmpty" };
  if (alias.length > 40) return { key: "auth.err.aliasLong" };
  return null;
}

export const MIN_PASSWORD = 10;

export function checkPassword(value: string): Problem | null {
  if (!value) return { key: "auth.err.passwordEmpty" };
  if (value.length < MIN_PASSWORD) {
    return { key: "auth.err.passwordShort", vars: { n: MIN_PASSWORD } };
  }
  if (COMMON.has(value.toLowerCase())) return { key: "auth.err.passwordCommon" };
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
  /** Empty until something has been typed. */
  label: Key | null;
  hint: Problem | null;
}

const STRENGTH_LABELS: Key[] = [
  "auth.strength.0",
  "auth.strength.1",
  "auth.strength.2",
  "auth.strength.3",
  "auth.strength.4",
];

/**
 * A rough, honest strength estimate: length carries most of it, variety adds
 * some, and obvious shapes take it away. It is guidance, not a gate — the gate
 * is `checkPassword`.
 */
export function strengthOf(value: string): Strength {
  if (!value) return { score: 0, label: null, hint: null };

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
  const missing = MIN_PASSWORD - value.length;

  return {
    score,
    label: STRENGTH_LABELS[score],
    hint:
      score >= 3
        ? { key: "auth.strength.hint.fine" }
        : missing > 0
          ? missing === 1
            ? { key: "auth.strength.hint.oneMore" }
            : { key: "auth.strength.hint.more", vars: { n: missing } }
          : { key: "auth.strength.hint.longer" },
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
    if (!password) throw new AuthError({ key: "auth.err.passwordEmpty" }, "password");

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
    if (!token) throw new AuthError({ key: "auth.err.noToken" });
    const bad = checkPassword(password);
    if (bad) throw new AuthError(bad, "password");
  },
};

export const auth: AuthService = stubAuth;

/** True while the screens are running against the stub rather than a server. */
export const AUTH_IS_STUB = auth === stubAuth;
