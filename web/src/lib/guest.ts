import { api } from "./api";
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
export const GUEST_DIRECTIVES = [
  "Never tell me how many steps are left.",
  "Give me one thing at a time, even if it is slower.",
];

const GUEST_INTERVENTIONS = ["shrink", "readAloud", "pause"];

export async function createGuest(): Promise<Student> {
  const student = await api.createStudent({
    alias: "Guest",
    ageBand: "middle",
    identifiesAs: null,
    defaultFormat: "skeleton",
    interventionKeys: GUEST_INTERVENTIONS,
    directives: GUEST_DIRECTIVES,
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

  if (/datasource|DATABASE_URL|must start with the protocol/i.test(message)) {
    return "This copy has no database attached yet, so accounts cannot be created on it. Everything works when you run Ritmo yourself — two commands, no key.";
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "The app could not reach its own server. If you are running this locally, check that npm run dev is still going.";
  }
  return message || "That did not go through.";
}
