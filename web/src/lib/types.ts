export type Format = "skeleton" | "dialogue" | "map" | "comic" | "audio";
export type Theme = "calm" | "dark" | "contrast";
export type Tint = "none" | "amber" | "rose" | "mint" | "slate";

export interface Intervention {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface LearningProfile {
  id: string;
  directives: string[];
  fastestFormat: Format | null;
  readingRateWpm: number | null; // median across formats; calibrates dwell
  bestBlockMinutes: number | null; // null until there is something to measure
  medianFirstActionMs: number | null;
  frictionThreshold: number;
  sessionsAnalysed: number;
}

export interface Student {
  id: string;
  alias: string;
  ageBand: "elementary" | "middle" | "high";
  identifiesAs: string | null;
  defaultFormat: Format;
  readingTheme: Theme;
  readingTint: Tint;
  letterSpacing: number;
  lineHeight: number;
  showStepCount: boolean;
  soundOn: boolean;
  companionOn: boolean;
  backdropOn: boolean;
  profile: LearningProfile | null;
  interventions: Intervention[];
}

export interface MicroStep {
  id: string;
  order: number;
  text: string;
  estimatedSeconds: number;
  status: "waiting" | "active" | "done" | "skipped";
}

export interface Decomposition {
  id: string;
  hiddenVerb: string;
  plainAsk: string;
  definitionOfDone: string;
  deliverables: string[];
  trapWarnings: string[];
  estimatedMinutes: number;
  model: string;
  steps: MicroStep[];
}

export interface Task {
  id: string;
  title: string;
  subject: string | null;
  rawText: string;
  createdAt: string;
  decomposition: Decomposition | null;
}

export interface Rendering {
  id: string;
  format: Format;
  body: string;
  wordCount: number;
  cached?: boolean;
}

export interface Insight {
  id: string;
  kind: string;
  statement: string;
  evidence: string;
  confidence: number;
}

export interface FrictionReading {
  eventId: string | null; // null when the score did not cross the threshold
  score: number;
  threshold: number;
  offer: boolean;
  reading: string;
  options: { key: string; label: string }[];
}
