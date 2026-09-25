// ─── Core Hierarchy ───────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// "code" topics contain Problems (with Monaco editor, solutions, complexity)
// "notes" topics contain NoteEntries (markdown notebook, no code editor)
export type TopicType = 'code' | 'notes';

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  type: TopicType;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemStatus =
  | 'not_started'
  | 'attempted'
  | 'couldnt_solve'
  | 'solved'
  | 'needs_revision';

export type NoteStatus = 'not_started' | 'learning' | 'revised' | 'confident';

export type Confidence = 1 | 2 | 3 | 4 | 5;

// ─── Problem (code topics) ────────────────────────────────────────

export interface Problem {
  id: string;
  subjectId: string;
  topicId: string;
  title: string;
  description: string; // markdown
  difficulty: Difficulty;
  patterns: string[];
  companies: string[];
  sourceUrl?: string;
  status: ProblemStatus;
  confidence: Confidence;
  important: boolean;
  notes: string; // markdown
  explainIt: string; // markdown
  attempts: number;
  timeSpentSeconds: number;
  lastRevisedAt?: string;
  nextReviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── NoteEntry (notes topics) ────────────────────────────────────

export interface NoteEntry {
  id: string;
  subjectId: string;
  topicId: string;
  title: string;
  content: string;            // markdown — the main field
  importantPoints: string[];  // quick bullet list of must-remember facts
  commonQuestions: string;    // markdown — "questions interviewers ask on this"
  status: NoteStatus;
  confidence: Confidence;
  important: boolean;
  lastRevisedAt?: string;
  nextReviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Solution ─────────────────────────────────────────────────────

export type SolutionLabel =
  | 'Brute Force'
  | 'Better'
  | 'Optimal'
  | 'Alternative'
  | string;

export type ProgrammingLanguage =
  | 'java'
  | 'python'
  | 'sql'
  | 'cpp'
  | 'javascript'
  | 'typescript'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'kotlin'
  | 'scala'
  | 'plaintext';

export interface Solution {
  id: string;
  problemId: string;
  label: SolutionLabel;
  language: ProgrammingLanguage;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string; // markdown
  isFinal: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Mistake (polymorphic — works for both Problems and NoteEntries) ──

export type MistakeType =
  | 'didnt_know_pattern'
  | 'edge_case'
  | 'off_by_one'
  | 'wrong_complexity'
  | 'syntax_error'
  | 'misread_question'
  | 'logic_error'
  | 'forgot_concept'
  | 'other';

export type MistakeItemType = 'problem' | 'note';

export interface Mistake {
  id: string;
  // Polymorphic reference — itemType tells you which table itemId points to
  itemType: MistakeItemType;
  itemId: string;
  // Legacy field kept for backward-compat with v1 data; equals itemId when itemType='problem'
  problemId: string;
  type: MistakeType;
  description: string; // markdown
  fix: string;         // markdown
  createdAt: string;
}

// ─── Flashcard ────────────────────────────────────────────────────

export interface Flashcard {
  id: string;
  subjectId: string;
  topicId: string;
  question: string;
  answer: string;
  confidence: Confidence;
  nextReviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Settings ─────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  id: 1; // singleton
  theme: Theme;
  placementDate?: string;
  dailyGoal: number;
  lastExportAt?: string;
}

// ─── Activity Log ─────────────────────────────────────────────────

export type ActivityType =
  | 'problem_solved'
  | 'problem_attempted'
  | 'revision_done'
  | 'note_revised'
  | 'flashcard_reviewed';

export interface ActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  type: ActivityType;
  problemId?: string;
  noteId?: string;
}

// ─── UI Label Maps ────────────────────────────────────────────────

export const STATUS_LABELS: Record<ProblemStatus, string> = {
  not_started: 'Not Started',
  attempted: 'Attempted',
  couldnt_solve: "Couldn't Solve",
  solved: 'Solved',
  needs_revision: 'Needs Revision',
};

export const NOTE_STATUS_LABELS: Record<NoteStatus, string> = {
  not_started: 'Not Started',
  learning: 'Learning',
  revised: 'Revised',
  confident: 'Confident',
};

export const NOTE_STATUS_COLORS: Record<NoteStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  learning:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  revised:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  confident:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export const STATUS_COLORS: Record<ProblemStatus, string> = {
  not_started: 'text-gray-400',
  attempted: 'text-yellow-500',
  couldnt_solve: 'text-red-500',
  solved: 'text-green-500',
  needs_revision: 'text-blue-500',
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  1: "Don't understand",
  2: 'Understand solution',
  3: 'Can solve with hints',
  4: 'Can solve independently',
  5: 'Can explain in interview',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  Medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  Hard: 'text-red-500 bg-red-50 dark:bg-red-900/20',
};

export const MISTAKE_TYPE_LABELS: Record<MistakeType, string> = {
  didnt_know_pattern: "Didn't Know Pattern",
  edge_case: 'Edge Case',
  off_by_one: 'Off By One',
  wrong_complexity: 'Wrong Complexity',
  syntax_error: 'Syntax Error',
  misread_question: 'Misread Question',
  logic_error: 'Logic Error',
  forgot_concept: 'Forgot Concept',
  other: 'Other',
};

export const LANGUAGE_LABELS: Record<ProgrammingLanguage, string> = {
  java: 'Java',
  python: 'Python',
  sql: 'SQL',
  cpp: 'C++',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  c: 'C',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  kotlin: 'Kotlin',
  scala: 'Scala',
  plaintext: 'Plain Text',
};

export const TOPIC_TYPE_LABELS: Record<TopicType, string> = {
  code: 'Code Problems',
  notes: 'Theory / Notes',
};
