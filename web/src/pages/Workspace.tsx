import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useStudent } from "../state/StudentContext";
import { FrictionTracker, expectedBlockMs, wordsPerMinute } from "../lib/friction";
import { ContractCard } from "../components/ContractCard";
import { StepLantern } from "../components/StepLantern";
import { FormatSwitcher } from "../components/FormatSwitcher";
import { ReaderPane } from "../components/ReaderPane";
import { InterventionSheet } from "../components/InterventionSheet";
import { TaskIntake } from "../components/TaskIntake";
import type { FrictionReading, Format, MicroStep, Task } from "../lib/types";

const FORMAT_ORDER: Format[] = ["skeleton", "dialogue", "map", "comic", "audio"];
const PAUSE_MS = 120000;

export function Workspace() {
  const { student } = useStudent();
  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<MicroStep[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>(student?.defaultFormat ?? "skeleton");
  const [body, setBody] = useState<string | null>(null);
  const [friction, setFriction] = useState<FrictionReading | null>(null);
  const [pausedUntil, setPausedUntil] = useState<number | null>(null);
  const [speakRequest, setSpeakRequest] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tracker = useRef<FrictionTracker | null>(null);
  const readStartedAt = useRef<number>(0);
  const wordCount = useRef<number>(0);

  // Mirrors of state that the friction loop and the unmount cleanup have to
  // read without re-subscribing every time one of them changes.
  const sessionRef = useRef<string | null>(null);
  const formatRef = useRef<Format>(format);
  const pausedRef = useRef<number | null>(null);
  const closedRef = useRef(false);

  sessionRef.current = sessionId;
  formatRef.current = format;
  pausedRef.current = pausedUntil;

  /* ---------- friction loop ---------- */

  useEffect(() => {
    if (!sessionId || !student) return;

    const instance = new FrictionTracker();
    tracker.current = instance;
    const detach = instance.attach();

    const timer = window.setInterval(async () => {
      // While the student is on a deliberate break, sitting still is not
      // friction. Drain the counters so the break does not register as idle
      // the moment they come back.
      if (pausedRef.current && Date.now() < pausedRef.current) {
        instance.sample();
        return;
      }
      try {
        const reading = await api.reportFriction(sessionId, {
          signals: instance.sample(),
          activeSeconds: instance.activeSeconds,
          firstActionMs: instance.firstAction ?? undefined,
        });
        // Never stack two sheets. One interruption is a nudge; two is nagging.
        if (reading.offer) setFriction((current) => current ?? reading);
      } catch {
        /* a dropped tick is not worth telling the student about */
      }
    }, FrictionTracker.interval);

    return () => {
      window.clearInterval(timer);
      detach();
      instance.dispose();
      tracker.current = null;
    };
  }, [sessionId, student]);

  // Close the session cleanly if the tab goes away mid-task.
  useEffect(() => {
    if (!sessionId) return;
    const onLeave = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      navigator.sendBeacon?.(
        `/api/sessions/${sessionId}/end`,
        new Blob(
          [JSON.stringify({ outcome: "paused", activeSeconds: tracker.current?.activeSeconds ?? 0 })],
          { type: "application/json" }
        )
      );
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [sessionId]);

  // Navigating to another page inside the app unmounts this without touching
  // the session. Left alone it would stay open for ever and never reach the
  // profile, so close it as paused on the way out.
  useEffect(() => {
    return () => {
      const id = sessionRef.current;
      if (!id || closedRef.current) return;
      closedRef.current = true;
      api
        .endSession(id, { outcome: "paused", activeSeconds: tracker.current?.activeSeconds ?? 0 })
        .catch(() => {});
    };
  }, []);

  // Come back on our own when the break is over, so the student does not have
  // to remember they are paused.
  useEffect(() => {
    if (!pausedUntil) return;
    const timer = window.setTimeout(() => setPausedUntil(null), Math.max(0, pausedUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [pausedUntil]);

  /* ---------- actions ---------- */

  const start = async (rawText: string) => {
    if (!student) return;
    setBusy(true);
    setError(null);
    try {
      const created = await api.createTask(student.id, rawText);
      const session = await api.startSession(student.id, created.id);
      closedRef.current = false;
      setTask(created);
      setSteps(created.decomposition?.steps ?? []);
      setSessionId(session.id);
      sessionRef.current = session.id;
      await loadFormat(created.id, student.defaultFormat);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * Switching shape is a question, not a departure. It records the rate for
   * the format being left and leaves the session open — closing it here used
   * to mark a student as finished while they were still working, and fed the
   * profile a half-finished session on every flip.
   */
  const loadFormat = useCallback(async (taskId: string, next: Format) => {
    setBusy(true);
    try {
      const leaving = formatRef.current;
      if (readStartedAt.current && sessionRef.current) {
        const wpm = wordsPerMinute(wordCount.current, Date.now() - readStartedAt.current);
        if (wpm) await api.recordReadingSample(sessionRef.current, leaving, wpm).catch(() => {});
      }
      const rendering = await api.render(taskId, next);
      setBody(rendering.body);
      setFormat(next);
      formatRef.current = next;
      readStartedAt.current = Date.now();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  const advance = async (stepId: string, status: "done" | "skipped") => {
    setBusy(true);
    tracker.current?.markAction();
    try {
      setSteps(await api.setStepStatus(stepId, status));
    } finally {
      setBusy(false);
    }
  };

  const shrink = async (stepId: string) => {
    setBusy(true);
    try {
      const smaller = await api.shrinkStep(stepId);
      setSteps((prev) => prev.map((s) => (s.id === smaller.id ? { ...s, ...smaller } : s)));
    } finally {
      setBusy(false);
    }
  };

  const respondToFriction = async (key: string | null) => {
    if (!friction) return;
    const current = friction;
    setFriction(null);
    if (current.eventId) await api.chooseIntervention(current.eventId, key).catch(() => {});

    const active = steps.find((s) => s.status === "active");
    if (key === "shrink" && active) await shrink(active.id);
    if (key === "skip" && active) await advance(active.id, "skipped");
    if (key === "reframe" && task) {
      const next = FORMAT_ORDER[(FORMAT_ORDER.indexOf(format) + 1) % FORMAT_ORDER.length];
      await loadFormat(task.id, next);
    }
    if (key === "readAloud") setSpeakRequest((n) => n + 1);
    if (key === "pause") setPausedUntil(Date.now() + PAUSE_MS);
  };

  const closeSession = async (outcome: "finished" | "paused") => {
    const id = sessionRef.current;
    if (id && !closedRef.current) {
      closedRef.current = true;
      await api
        .endSession(id, {
          outcome,
          formatUsed: formatRef.current,
          activeSeconds: tracker.current?.activeSeconds ?? 0,
          stepsCompleted: steps.filter((s) => s.status === "done").length,
        })
        .catch(() => {});
    }
    sessionRef.current = null;
    setSessionId(null);
    setTask(null);
    setSteps([]);
    setBody(null);
    setFriction(null);
    setPausedUntil(null);
    setError(null);
    readStartedAt.current = 0;
  };

  /* ---------- reader callbacks ---------- */

  // Stable identities: the reader rebuilds its intersection observer whenever
  // these change, and inline arrows change on every render.
  const onBlockChange = useCallback((i: number) => tracker.current?.enterBlock(i), []);

  const readingRate = student?.profile?.readingRateWpm ?? null;
  const onFirstPaint = useCallback(
    (words: number, blocks: number) => {
      wordCount.current = words;
      readStartedAt.current = Date.now();
      // Recalibrate dwell for the shape now on screen: six comic panels and a
      // page of dialogue are not the same amount of reading.
      tracker.current?.setExpectedBlockMs(expectedBlockMs(words, blocks, readingRate));
    },
    [readingRate]
  );

  /* ---------- render ---------- */

  if (!student) return null;

  if (!task) {
    return (
      <div className="mx-auto max-w-reading px-6 py-16 sm:py-24 space-y-10">
        <header className="space-y-4 rise">
          <p className="eyebrow">Nothing open</p>
          <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight">
            What are you supposed to be doing?
          </h1>
          <p className="text-muted reading">
            Paste it in as it was given to you. The first thing back will be one action small enough
            to do without deciding anything.
          </p>
        </header>
        {error && <p className="text-sm text-muted">{error}</p>}
        <TaskIntake onSubmit={start} busy={busy} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-6 py-12 space-y-12">
      <header className="space-y-2 rise">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="eyebrow">{task.subject ?? "Task"}</p>
          {task.decomposition && (
            <>
              <span aria-hidden className="text-faint text-xs">·</span>
              <p className="font-mono text-[0.6875rem] text-faint">
                about {task.decomposition.estimatedMinutes} min in total
              </p>
            </>
          )}
        </div>
        <h1 className="font-display text-3xl sm:text-[2.25rem] leading-tight tracking-tight">
          {task.title}
        </h1>
      </header>

      {pausedUntil ? (
        <PauseCard until={pausedUntil} onReturn={() => setPausedUntil(null)} />
      ) : (
        <StepLantern
          steps={steps}
          showCount={student.showStepCount}
          busy={busy}
          onDone={(id) => advance(id, "done")}
          onSkip={(id) => advance(id, "skipped")}
          onShrink={shrink}
        />
      )}

      {task.decomposition && <ContractCard d={task.decomposition} />}

      <div className="space-y-6 border-t border-line pt-10">
        <FormatSwitcher
          value={format}
          busy={busy}
          fastest={student.profile?.fastestFormat ?? null}
          onChange={(next) => loadFormat(task.id, next)}
        />
        {body && (
          <ReaderPane
            body={body}
            onBlockChange={onBlockChange}
            onFirstPaint={onFirstPaint}
            speakRequest={speakRequest}
          />
        )}
      </div>

      {error && <p className="text-sm text-muted">{error}</p>}

      <div className="border-t border-line pt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button className="btn-quiet" onClick={() => closeSession("finished")}>
          I am finished with this
        </button>
        <button className="btn-bare" onClick={() => closeSession("paused")}>
          Put it away without finishing
        </button>
        <p className="ml-auto text-xs text-faint reading max-w-xs">
          Putting it away is not the same as failing it. Either button keeps what you did.
        </p>
      </div>

      {friction && (
        <InterventionSheet
          reading={friction}
          onChoose={respondToFriction}
          onDismiss={() => respondToFriction(null)}
        />
      )}
    </div>
  );
}

/**
 * A break is a step, not an absence. It says how long is left and offers the
 * way back, so coming back is not another decision to make.
 */
function PauseCard({ until, onReturn }: { until: number; onReturn: () => void }) {
  const [left, setLeft] = useState(() => Math.max(0, until - Date.now()));

  useEffect(() => {
    const timer = window.setInterval(() => setLeft(Math.max(0, until - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [until]);

  const seconds = Math.ceil(left / 1000);
  return (
    <div className="card p-6 sm:p-7 space-y-4">
      <p className="eyebrow">Away from it</p>
      <p className="font-display text-[1.6rem] leading-[1.35]">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} left.
      </p>
      <p className="text-sm text-muted reading">
        Nothing is being measured while this is up. The step is where you left it.
      </p>
      <button className="btn-quiet" onClick={onReturn}>
        Back to it now
      </button>
    </div>
  );
}
