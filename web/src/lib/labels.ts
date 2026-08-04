import type { Key, T } from "./i18n";
import type { Format } from "./types";

/**
 * Things the server names by key and the browser has to word.
 *
 * The database stores an English label for each intervention, written when the
 * account was created. Translating that stored sentence would mean rewriting
 * rows every time somebody flips the toggle. Translating the *key* instead
 * costs nothing and works in both directions — including for an account set up
 * in English and later read in Spanish, which is the normal case in a bilingual
 * household.
 *
 * The stored label is still the fallback. If a key ever appears that this table
 * has not heard of, the student sees the server's English rather than a blank.
 */
const INTERVENTIONS: Record<string, Key> = {
  shrink: "iv.shrink",
  readAloud: "iv.readAloud",
  // Withdrawn from offer (it was never wired to anything), kept here so an
  // old account that still holds the row renders words rather than a raw key.
  speakInstead: "iv.speakInstead",
  pause: "iv.pause",
  reframe: "iv.reframe",
  skip: "iv.skip",
};

export function interventionLabel(t: T, key: string, fallback: string): string {
  const entry = INTERVENTIONS[key];
  return entry ? t(entry) : fallback;
}

/** The five friction signals, named by the one that contributed most. */
const SIGNALS: Record<string, Key> = {
  dwell: "sig.dwell",
  deleteBurst: "sig.deleteBurst",
  idle: "sig.idle",
  tabAway: "sig.tabAway",
  reread: "sig.reread",
};

export function signalLabel(t: T, key: string | undefined, fallback: string): string {
  const entry = key ? SIGNALS[key] : undefined;
  return entry ? t(entry) : fallback;
}

/** Format names, for the sentences on the profile that mention one. */
const FORMATS: Record<Format, Key> = {
  skeleton: "fmt.skeleton",
  dialogue: "fmt.dialogue",
  map: "fmt.map",
  comic: "fmt.comic",
  audio: "fmt.audio",
};

export function formatName(t: T, format: string): string {
  const entry = FORMATS[format as Format];
  return entry ? t(entry).toLowerCase() : format;
}
