import type {
  FrictionReading, Format, Insight, LearningProfile, MicroStep, Rendering, Student, Task,
} from "./types";

import { currentLang, translate } from "./i18n";

const BASE = "/api";

/**
 * Every request carries the language on screen.
 *
 * A custom header rather than `Accept-Language`, which browsers forbid `fetch`
 * from setting. The server needs this because a good half of what a student
 * reads is written there and not here: the steps a task is cut into, the
 * guide's answers, the observations on the profile, and the page they hand to
 * a teacher.
 */
async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const lang = currentLang();
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-ritmo-lang": lang,
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? translate(lang, "api.silent"));
  return body as T;
}

export const api = {
  health: () =>
    call<{
      ok: boolean;
      aiMode: string;
      model: string | null;
      companion?: string;
      hosted?: boolean;
    }>("/health"),

  createStudent: (payload: Record<string, unknown>) =>
    call<Student>("/students", { method: "POST", body: JSON.stringify(payload) }),

  getStudent: (id: string) => call<Student>(`/students/${id}`),

  updateStudent: (id: string, patch: Partial<Student>) =>
    call<Student>(`/students/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  saveDirectives: (id: string, directives: string[]) =>
    call<LearningProfile>(`/students/${id}/directives`, {
      method: "PUT",
      body: JSON.stringify({ directives }),
    }),

  setIntervention: (id: string, key: string, enabled: boolean) =>
    call(`/students/${id}/interventions/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),

  deleteStudent: (id: string) => call<void>(`/students/${id}`, { method: "DELETE" }),

  createTask: (studentId: string, rawText: string) =>
    call<Task>("/tasks", { method: "POST", body: JSON.stringify({ studentId, rawText }) }),

  getTask: (id: string) => call<Task>(`/tasks/${id}`),

  listTasks: (studentId: string) => call<Task[]>(`/tasks?studentId=${studentId}`),

  render: (taskId: string, format: Format) =>
    call<Rendering>(`/tasks/${taskId}/render`, {
      method: "POST",
      body: JSON.stringify({ format }),
    }),

  /** Written on the server only when this is called. See tasks.js. */
  solveTask: (taskId: string) =>
    call<{ kind: "worked" | "method" | "unavailable"; body: string; cached: boolean }>(
      `/tasks/${taskId}/solution`,
      { method: "POST" }
    ),

  /** Key points, a summary, and one way to remember it. Written on request. */
  studyTask: (taskId: string) =>
    call<{
      summary?: string;
      points?: string[];
      remember?: string;
      unavailable?: string;
      cached: boolean;
    }>(`/tasks/${taskId}/study`, { method: "POST" }),

  shrinkStep: (stepId: string) =>
    call<{ id: string; text: string }>(`/tasks/steps/${stepId}/shrink`, { method: "POST" }),

  setStepStatus: (stepId: string, status: MicroStep["status"]) =>
    call<MicroStep[]>(`/tasks/steps/${stepId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  startSession: (studentId: string, taskId: string) =>
    call<{ id: string }>("/sessions", {
      method: "POST",
      body: JSON.stringify({ studentId, taskId }),
    }),

  reportFriction: (sessionId: string, payload: Record<string, unknown>) =>
    call<FrictionReading>(`/sessions/${sessionId}/friction`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /** A reading rate for one format. Does not close the session. */
  recordReadingSample: (sessionId: string, format: Format, wpm: number) =>
    call(`/sessions/${sessionId}/sample`, {
      method: "POST",
      body: JSON.stringify({ format, wpm }),
    }),

  chooseIntervention: (eventId: string, key: string | null) =>
    call(`/sessions/friction/${eventId}/choose`, {
      method: "POST",
      body: JSON.stringify({ key }),
    }),

  endSession: (sessionId: string, payload: Record<string, unknown>) =>
    call(`/sessions/${sessionId}/end`, { method: "POST", body: JSON.stringify(payload) }),

  getProfile: (studentId: string) =>
    call<{
      profile: LearningProfile | null;
      insights: Insight[];
      stats: { sessions: number; finished: number };
    }>(`/profile/${studentId}`),

  dismissInsight: (id: string) =>
    call(`/profile/insights/${id}/dismiss`, { method: "POST" }),

  askCompanion: (question: string, studentId?: string) =>
    call<{ text: string; source: string; topic?: string | null }>("/companion/ask", {
      method: "POST",
      body: JSON.stringify({ question, studentId }),
    }),

  exportProfile: (studentId: string, audience: string) =>
    call<{ id: string; body: string; createdAt: string }>(`/profile/${studentId}/export`, {
      method: "POST",
      body: JSON.stringify({ audience }),
    }),
};
