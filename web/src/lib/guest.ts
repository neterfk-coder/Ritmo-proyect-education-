import { api } from "./api";
import { currentLang, translate } from "./i18n";
import type { Lang } from "./i18n";
import type { Student } from "./types";

/**
 * Getting in without an account.
 *
 * A guest is not a lesser account — it is the same student row with the setup
 * questions skipped and sensible answers filled in. Everything works: tasks,
 * formats, friction, the profile, the export. What a guest does not have is a
 * way back in from another browser, which is the one thing the strip in the
 * shell keeps offering to fix.
 *
 * This matters more here than in most products. The people this is for are the
 * people most likely to bounce off a sign-up form before they have seen whether
 * the thing is worth signing up for, and asking a student in a task-initiation
 * hole to first complete a five-question setup is the same failure the product
 * exists to solve.
 */

const FLAG = "ritmo.guest";

/**
 * The rules a guest starts with.
 *
 * Kept to two, both from the suggested list, both safe defaults rather than
 * guesses about this person. They are editable from "How I work" the moment
 * anyone wants to, and the strip says so.
 */
export const guestDirectives = (lang: Lang = currentLang()) => [
  translate(lang, "rule.1"),
  translate(lang, "rule.4"),
];

const GUEST_INTERVENTIONS = ["shrink", "readAloud", "pause"];

/**
 * @param name what the student wants to be called. Optional on purpose — it is
 *   the only question asked before letting somebody in, and a required field
 *   would make it a form again.
 */
export async function createGuest(name?: string): Promise<Student> {
  const alias = (name ?? "").trim().slice(0, 40);
  const lang = currentLang();

  const student = await api.createStudent({
    // The rules are written in the language the student chose them in, and
    // they stay that way: they become the student's own sentences the moment
    // the account exists, and rewriting somebody's words when they flip a
    // toggle is not translation, it is losing their edits.
    alias: alias || translate(lang, "guest.defaultAlias"),
    ageBand: "middle",
    identifiesAs: null,
    defaultFormat: "skeleton",
    interventionKeys: GUEST_INTERVENTIONS,
    directives: guestDirectives(lang),
  });
  localStorage.setItem(FLAG, "1");
  return student;
}

export const isGuest = () => localStorage.getItem(FLAG) === "1";

/** Called when the student has been shown how to get back to this account. */
export const clearGuestFlag = () => localStorage.removeItem(FLAG);

/**
 * Turns the API's failure into something a person can act on.
 *
 * The hosted copy has no database attached yet, and Prisma's own message for
 * that is four lines of datasource validation. Nobody should meet that.
 */
export function explainCreateFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lang = currentLang();

  if (/datasource|DATABASE_URL|must start with the protocol/i.test(message)) {
    return translate(lang, "guest.noDatabase");
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return translate(lang, "guest.noServer");
  }
  return message || translate(lang, "auth.err.generic");
}
