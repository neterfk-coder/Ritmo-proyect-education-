/**
 * Friction detection without a camera.
 *
 * The obvious way to detect a disengaged student is webcam gaze tracking. Our
 * testers rejected it in the first session and were unambiguous about why:
 * being watched while struggling is the thing that makes struggling worse.
 *
 * So we infer from interaction shape instead. Five signals, all derived on the
 * client from events the browser already generates, all discarded after
 * scoring. What reaches this function is already anonymous; what leaves it is
 * one number and one signal name.
 */

export const SIGNALS = {
  // Sitting on the same block far longer than this student's own reading rate
  // would predict. Not slowness — stalling.
  dwell: { weight: 0.3, label: "stuck on one place" },
  // Type, delete, type, delete. The shape of not being able to start a sentence.
  deleteBurst: { weight: 0.25, label: "writing and unwriting" },
  // No input at all, window still focused. Staring.
  idle: { weight: 0.2, label: "nothing moving" },
  // Window lost focus and stayed lost.
  tabAway: { weight: 0.15, label: "gone elsewhere" },
  // Scrolled back to material already passed, repeatedly.
  reread: { weight: 0.1, label: "going back over it" },
};

/**
 * @param {object} signals values 0..1, one per key in SIGNALS
 * @param {number} threshold the student's own tuned threshold
 */
export function scoreFriction(signals = {}, threshold = 0.62) {
  let score = 0;
  let topSignal = "dwell";
  let topContribution = -1;

  for (const [key, config] of Object.entries(SIGNALS)) {
    const raw = clamp(Number(signals[key]) || 0);
    const contribution = raw * config.weight;
    score += contribution;
    if (contribution > topContribution) {
      topContribution = contribution;
      topSignal = key;
    }
  }

  return {
    score: Number(score.toFixed(3)),
    topSignal,
    crossed: score >= threshold,
    label: SIGNALS[topSignal].label,
  };
}

/**
 * Nudges the threshold based on whether offering help actually helped.
 * If we interrupt and the student ignores it, we were wrong to interrupt.
 */
export function tuneThreshold(current, events) {
  const offered = events.filter((e) => e.offered);
  if (offered.length < 4) return current;

  const takeRate = offered.filter((e) => e.chosenKey).length / offered.length;
  if (takeRate < 0.3) return clamp(current + 0.05, 0.35, 0.9); // interrupt less
  if (takeRate > 0.75) return clamp(current - 0.03, 0.35, 0.9); // interrupt sooner
  return current;
}

const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
