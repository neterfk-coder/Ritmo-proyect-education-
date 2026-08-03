import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../lib/api";
import type { Student, Theme, Tint } from "../lib/types";

/**
 * The account id is the only thing kept in the browser. Everything else lives
 * in the database on the student's own machine.
 */
const KEY = "ritmo.studentId";

interface Ctx {
  student: Student | null;
  loading: boolean;
  aiMode: string;
  signIn: (id: string) => Promise<void>;
  signOut: () => void;
  setStudent: (s: Student) => void;
  patch: (patch: Partial<Student>) => Promise<void>;
  erase: () => Promise<void>;
}

const StudentContext = createContext<Ctx | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState("mock");

  useEffect(() => {
    api.health().then((h) => setAiMode(h.aiMode)).catch(() => setAiMode("offline"));
  }, []);

  useEffect(() => {
    const id = localStorage.getItem(KEY);
    if (!id) return setLoading(false);
    api
      .getStudent(id)
      .then(setStudent)
      .catch(() => localStorage.removeItem(KEY))
      .finally(() => setLoading(false));
  }, []);

  // The interface obeys the student, not the other way round.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = (student?.readingTheme as Theme) ?? "calm";
    root.dataset.tint = (student?.readingTint as Tint) ?? "none";
    root.style.setProperty("--reading-leading", String(student?.lineHeight ?? 1.7));
    root.style.setProperty("--reading-tracking", `${student?.letterSpacing ?? 0}em`);
  }, [student?.readingTheme, student?.readingTint, student?.lineHeight, student?.letterSpacing]);

  const signIn = useCallback(async (id: string) => {
    const next = await api.getStudent(id);
    localStorage.setItem(KEY, next.id);
    setStudent(next);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    setStudent(null);
  }, []);

  const patch = useCallback(
    async (changes: Partial<Student>) => {
      if (!student) return;
      const previous = student;
      setStudent({ ...student, ...changes }); // optimistic: settings must feel instant
      try {
        setStudent(await api.updateStudent(student.id, changes));
      } catch {
        // Put the control back where it was rather than leaving the screen
        // showing a setting that did not save.
        setStudent(previous);
      }
    },
    [student]
  );

  const erase = useCallback(async () => {
    if (!student) return;
    await api.deleteStudent(student.id);
    localStorage.removeItem(KEY);
    setStudent(null);
  }, [student]);

  const value = useMemo(
    () => ({
      student,
      loading,
      aiMode,
      signIn,
      signOut,
      patch,
      erase,
      setStudent: (s: Student) => {
        localStorage.setItem(KEY, s.id);
        setStudent(s);
      },
    }),
    [student, loading, aiMode, signIn, signOut, patch, erase]
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used inside StudentProvider");
  return ctx;
}
