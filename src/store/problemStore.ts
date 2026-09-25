import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { problemRepo, solutionRepo, mistakeRepo, activityRepo } from '../db/repositories';
import type {
  Confidence,
  Mistake,
  MistakeType,
  Problem,
  ProblemStatus,
  ProgrammingLanguage,
  Solution,
  SolutionLabel,
} from '../types';
import { nowISO, todayStr } from '../lib/dateUtils';
import { computeNextReview } from '../lib/spacedRepetition';

interface ProblemState {
  problems: Problem[];
  solutions: Record<string, Solution[]>; // keyed by problemId
  mistakes: Record<string, Mistake[]>;   // keyed by problemId
  loaded: boolean;

  loadAll: () => Promise<void>;
  loadProblem: (id: string) => Promise<void>;

  // Problems
  addProblem: (data: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Problem>;
  updateProblem: (id: string, partial: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  setStatus: (id: string, status: ProblemStatus) => Promise<void>;
  setConfidence: (id: string, confidence: Confidence) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
  toggleNeedsRevision: (id: string) => Promise<void>;

  // Solutions
  addSolution: (problemId: string, label: SolutionLabel, language: ProgrammingLanguage) => Promise<Solution>;
  updateSolution: (id: string, partial: Partial<Solution>) => Promise<void>;
  deleteSolution: (id: string, problemId: string) => Promise<void>;
  duplicateSolution: (id: string) => Promise<Solution | null>;

  // Mistakes (problem-scoped)
  addMistake: (problemId: string, type: MistakeType, description: string, fix: string) => Promise<Mistake>;
  updateMistake: (id: string, problemId: string, partial: Partial<Mistake>) => Promise<void>;
  deleteMistake: (id: string, problemId: string) => Promise<void>;
  loadMistakesForProblem: (problemId: string) => Promise<void>;

  // Helpers
  getProblemsForTopic: (topicId: string) => Problem[];
  getProblemsForSubject: (subjectId: string) => Problem[];
  getDueForReview: () => Problem[];
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: [],
  solutions: {},
  mistakes: {},
  loaded: false,

  loadAll: async () => {
    try {
      const problems = await problemRepo.getAll();
      set({ problems, loaded: true });
    } catch (err) {
      console.error('Failed to load problems', err);
    }
  },

  loadProblem: async (id) => {
    try {
      const [solutions, mistakes] = await Promise.all([
        solutionRepo.getByProblem(id),
        mistakeRepo.getByItem(id),
      ]);
      set(state => ({
        solutions: { ...state.solutions, [id]: solutions },
        mistakes: { ...state.mistakes, [id]: mistakes },
      }));
    } catch (err) {
      console.error('Failed to load problem details', err);
    }
  },

  addProblem: async (data) => {
    const problem: Problem = { ...data, id: uuidv4(), createdAt: nowISO(), updatedAt: nowISO() };
    await problemRepo.upsert(problem);
    set(state => ({ problems: [...state.problems, problem] }));
    return problem;
  },

  updateProblem: async (id, partial) => {
    const problems = get().problems.map(p =>
      p.id === id ? { ...p, ...partial, updatedAt: nowISO() } : p
    );
    const updated = problems.find(p => p.id === id)!;
    await problemRepo.upsert(updated);
    set({ problems });
  },

  deleteProblem: async (id) => {
    await problemRepo.delete(id);
    set(state => {
      const { [id]: _s, ...solutions } = state.solutions;
      const { [id]: _m, ...mistakes } = state.mistakes;
      return { problems: state.problems.filter(p => p.id !== id), solutions, mistakes };
    });
  },

  setStatus: async (id, status) => {
    await get().updateProblem(id, {
      status,
      lastRevisedAt: status === 'solved' || status === 'needs_revision' ? nowISO() : undefined,
    });
    await activityRepo.log({
      id: uuidv4(),
      date: todayStr(),
      type: status === 'solved' ? 'problem_solved' : 'problem_attempted',
      problemId: id,
    });
  },

  setConfidence: async (id, confidence) => {
    const problem = get().problems.find(p => p.id === id);
    if (!problem) return;
    const nextReviewAt = computeNextReview(confidence, true, problem.nextReviewAt);
    await get().updateProblem(id, { confidence, nextReviewAt });
  },

  toggleImportant: async (id) => {
    const problem = get().problems.find(p => p.id === id);
    if (!problem) return;
    await get().updateProblem(id, { important: !problem.important });
  },

  toggleNeedsRevision: async (id) => {
    const problem = get().problems.find(p => p.id === id);
    if (!problem) return;
    const status = problem.status === 'needs_revision' ? 'solved' : 'needs_revision';
    await get().setStatus(id, status);
  },

  // ── Solutions ────────────────────────────────────────────────

  addSolution: async (problemId, label, language) => {
    const existing = get().solutions[problemId] ?? [];
    const solution: Solution = {
      id: uuidv4(), problemId, label, language, code: '',
      timeComplexity: '', spaceComplexity: '', explanation: '',
      isFinal: existing.length === 0, order: existing.length,
      createdAt: nowISO(), updatedAt: nowISO(),
    };
    await solutionRepo.upsert(solution);
    set(state => ({
      solutions: { ...state.solutions, [problemId]: [...(state.solutions[problemId] ?? []), solution] },
    }));
    return solution;
  },

  updateSolution: async (id, partial) => {
    let updated: Solution | null = null;
    const solutions: Record<string, Solution[]> = {};
    for (const [pid, list] of Object.entries(get().solutions)) {
      solutions[pid] = list.map(s => {
        if (s.id === id) { updated = { ...s, ...partial, updatedAt: nowISO() }; return updated; }
        return s;
      });
    }
    if (updated) { await solutionRepo.upsert(updated); set({ solutions }); }
  },

  deleteSolution: async (id, problemId) => {
    await solutionRepo.delete(id);
    set(state => ({
      solutions: { ...state.solutions, [problemId]: (state.solutions[problemId] ?? []).filter(s => s.id !== id) },
    }));
  },

  duplicateSolution: async (id) => {
    let original: Solution | undefined;
    for (const list of Object.values(get().solutions)) {
      original = list.find(s => s.id === id);
      if (original) break;
    }
    if (!original) return null;
    const existing = get().solutions[original.problemId] ?? [];
    const copy: Solution = {
      ...original, id: uuidv4(), label: `${original.label} (copy)`,
      isFinal: false, order: existing.length, createdAt: nowISO(), updatedAt: nowISO(),
    };
    await solutionRepo.upsert(copy);
    set(state => ({
      solutions: { ...state.solutions, [copy.problemId]: [...(state.solutions[copy.problemId] ?? []), copy] },
    }));
    return copy;
  },

  // ── Mistakes ─────────────────────────────────────────────────

  addMistake: async (problemId, type, description, fix) => {
    const mistake: Mistake = {
      id: uuidv4(),
      itemType: 'problem',
      itemId: problemId,
      problemId,          // keep legacy field
      type, description, fix,
      createdAt: nowISO(),
    };
    await mistakeRepo.upsert(mistake);
    set(state => ({
      mistakes: { ...state.mistakes, [problemId]: [...(state.mistakes[problemId] ?? []), mistake] },
    }));
    return mistake;
  },

  updateMistake: async (id, problemId, partial) => {
    const mistakes = { ...get().mistakes };
    mistakes[problemId] = (mistakes[problemId] ?? []).map(m =>
      m.id === id ? { ...m, ...partial } : m
    );
    const updated = mistakes[problemId].find(m => m.id === id)!;
    await mistakeRepo.upsert(updated);
    set({ mistakes });
  },

  deleteMistake: async (id, problemId) => {
    await mistakeRepo.delete(id);
    set(state => ({
      mistakes: { ...state.mistakes, [problemId]: (state.mistakes[problemId] ?? []).filter(m => m.id !== id) },
    }));
  },

  loadMistakesForProblem: async (problemId) => {
    const mistakes = await mistakeRepo.getByItem(problemId);
    set(state => ({ mistakes: { ...state.mistakes, [problemId]: mistakes } }));
  },

  // ── Helpers ──────────────────────────────────────────────────

  getProblemsForTopic: (topicId) => get().problems.filter(p => p.topicId === topicId),
  getProblemsForSubject: (subjectId) => get().problems.filter(p => p.subjectId === subjectId),
  getDueForReview: () => {
    const now = new Date().toISOString();
    return get().problems.filter(p => !!p.nextReviewAt && p.nextReviewAt <= now);
  },
}));
