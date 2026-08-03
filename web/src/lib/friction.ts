/**
 * Client-side friction tracker.
 *
 * Everything measured here stays in this closure. What leaves the browser is
 * five numbers between 0 and 1, once every fifteen seconds. There is no
 * keystroke log, no content, no screenshot, no camera, no microphone.
 *
 * The five signals, and why each one:
 *   dwell        — time on one block far past the student's own reading rate
 *   deleteBurst  — type, delete, type, delete: the shape of not being able to start
 *   idle         — no input at all while the window is focused: staring
 *   tabAway      — window lost focus and stayed lost
 *   reread       — scrolled back over material already passed, repeatedly
 */

export interface Signals {
  dwell: number;
  deleteBurst: number;
  idle: number;
  tabAway: number;
  reread: number;
}

const WINDOW_MS = 15000;

export class FrictionTracker {
  private lastInput = Date.now();
  private openedAt = Date.now();
  private firstActionMs: number | null = null;
  private deletes = 0;
  private keys = 0;
  private blurStart: number | null = null;
  private blurMs = 0;
  private activeMs = 0;
  private blockEnteredAt = Date.now();
  private currentBlock = 0;
  private visitedBlocks = new Set<number>();
  private rereads = 0;
  private expectedBlockMs = 12000;
  private detach: (() => void) | null = null;

  /** @param expectedBlockMs this student's own predicted time per block */
  constructor(expectedBlockMs?: number) {
    if (expectedBlockMs) this.expectedBlockMs = expectedBlockMs;
  }

  /**
   * Dwell only means anything relative to how fast this person reads. Left at
   * the default, a slow reader on a dense paragraph saturates the signal and
   * gets interrupted for reading normally — which is the opposite of the point.
   */
  setExpectedBlockMs(ms: number) {
    if (Number.isFinite(ms) && ms > 0) this.expectedBlockMs = ms;
  }

  attach() {
    const onKey = (e: KeyboardEvent) => {
      this.markAction();
      this.keys += 1;
      if (e.key === "Backspace" || e.key === "Delete") this.deletes += 1;
    };
    const onPointer = () => this.markAction();
    const onBlur = () => { this.blurStart = Date.now(); };
    const onFocus = () => {
      if (this.blurStart) this.blurMs += Date.now() - this.blurStart;
      this.blurStart = null;
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    this.detach = () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
    return this.detach;
  }

  dispose() { this.detach?.(); }

  /** Called by the reader when the visible block changes. */
  enterBlock(index: number) {
    if (index === this.currentBlock) return;
    if (index < this.currentBlock && this.visitedBlocks.has(index)) this.rereads += 1;
    this.visitedBlocks.add(index);
    this.currentBlock = index;
    this.blockEnteredAt = Date.now();
  }

  markAction() {
    const now = Date.now();
    if (this.firstActionMs === null) this.firstActionMs = now - this.openedAt;
    if (now - this.lastInput < 30000) this.activeMs += now - this.lastInput;
    this.lastInput = now;
  }

  get firstAction() { return this.firstActionMs; }
  get activeSeconds() { return Math.round(this.activeMs / 1000); }

  /** Reads the window, normalises to 0..1, and resets the counters. */
  sample(): Signals {
    const now = Date.now();
    const idleMs = now - this.lastInput;
    const onBlockMs = now - this.blockEnteredAt;
    const blurNow = this.blurStart ? now - this.blurStart : 0;

    const signals: Signals = {
      dwell: clamp(onBlockMs / (this.expectedBlockMs * 3)),
      deleteBurst: this.keys > 8 ? clamp((this.deletes / this.keys - 0.15) / 0.45) : 0,
      idle: clamp((idleMs - 20000) / 60000),
      tabAway: clamp((this.blurMs + blurNow) / WINDOW_MS),
      reread: clamp(this.rereads / 4),
    };

    this.deletes = 0;
    this.keys = 0;
    this.blurMs = 0;
    this.rereads = 0;
    return signals;
  }

  static interval = WINDOW_MS;
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Rough reading rate for a block of text, used to build the profile. */
export function wordsPerMinute(words: number, ms: number) {
  if (ms < 4000 || words < 20) return null;
  return Math.round((words / (ms / 60000)) * 10) / 10;
}

/**
 * How long one block of this text should take this student, from their own
 * measured rate. Falls back to a deliberately generous rate so an unmeasured
 * student is under-interrupted rather than over-interrupted.
 */
export function expectedBlockMs(words: number, blocks: number, wpm?: number | null) {
  const perBlock = blocks > 0 ? words / blocks : words;
  const rate = wpm && wpm > 20 ? wpm : 90;
  return Math.max(6000, (perBlock / rate) * 60000);
}
