import { db } from './dexie';
import type {
  ActivityLog,
  Flashcard,
  Mistake,
  NoteEntry,
  Problem,
  Settings,
  Solution,
  Subject,
  Topic,
} from '../types';

// ─── Subjects ────────────────────────────────────────────────────

export const subjectRepo = {
  async getAll(): Promise<Subject[]> {
    return db.subjects.orderBy('order').toArray();
  },
  async getById(id: string): Promise<Subject | undefined> {
    return db.subjects.get(id);
  },
  async upsert(subject: Subject): Promise<void> {
    await db.subjects.put(subject);
  },
  async delete(id: string): Promise<void> {
    const tables = [db.subjects, db.topics, db.problems, db.noteEntries, db.solutions, db.mistakes] as const;
    await db.transaction('rw', tables, async () => {
      const topics = await db.topics.where('subjectId').equals(id).toArray();
      for (const t of topics) {
        const problems = await db.problems.where('topicId').equals(t.id).toArray();
        for (const p of problems) {
          await db.solutions.where('problemId').equals(p.id).delete();
          await db.mistakes.where('itemId').equals(p.id).delete();
        }
        await db.problems.where('topicId').equals(t.id).delete();
        const notes = await db.noteEntries.where('topicId').equals(t.id).toArray();
        for (const n of notes) {
          await db.mistakes.where('itemId').equals(n.id).delete();
        }
        await db.noteEntries.where('topicId').equals(t.id).delete();
      }
      await db.topics.where('subjectId').equals(id).delete();
      await db.subjects.delete(id);
    });
  },
};

// ─── Topics ──────────────────────────────────────────────────────

export const topicRepo = {
  async getBySubject(subjectId: string): Promise<Topic[]> {
    return db.topics.where('subjectId').equals(subjectId).sortBy('order');
  },
  async getById(id: string): Promise<Topic | undefined> {
    return db.topics.get(id);
  },
  async upsert(topic: Topic): Promise<void> {
    await db.topics.put(topic);
  },
  async delete(id: string): Promise<void> {
    await db.transaction(
      'rw',
      db.topics, db.problems, db.noteEntries, db.solutions, db.mistakes,
      async () => {
        const problems = await db.problems.where('topicId').equals(id).toArray();
        for (const p of problems) {
          await db.solutions.where('problemId').equals(p.id).delete();
          await db.mistakes.where('itemId').equals(p.id).delete();
        }
        await db.problems.where('topicId').equals(id).delete();

        const notes = await db.noteEntries.where('topicId').equals(id).toArray();
        for (const n of notes) {
          await db.mistakes.where('itemId').equals(n.id).delete();
        }
        await db.noteEntries.where('topicId').equals(id).delete();
        await db.topics.delete(id);
      }
    );
  },
};

// ─── Problems ────────────────────────────────────────────────────

export const problemRepo = {
  async getAll(): Promise<Problem[]> {
    return db.problems.toArray();
  },
  async getByTopic(topicId: string): Promise<Problem[]> {
    return db.problems.where('topicId').equals(topicId).toArray();
  },
  async getBySubject(subjectId: string): Promise<Problem[]> {
    return db.problems.where('subjectId').equals(subjectId).toArray();
  },
  async getById(id: string): Promise<Problem | undefined> {
    return db.problems.get(id);
  },
  async upsert(problem: Problem): Promise<void> {
    await db.problems.put(problem);
  },
  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.problems, db.solutions, db.mistakes, async () => {
      await db.solutions.where('problemId').equals(id).delete();
      await db.mistakes.where('itemId').equals(id).delete();
      await db.problems.delete(id);
    });
  },
  async getDueForReview(): Promise<Problem[]> {
    const now = new Date().toISOString();
    return db.problems
      .filter(p => !!p.nextReviewAt && p.nextReviewAt <= now)
      .toArray();
  },
};

// ─── NoteEntries ─────────────────────────────────────────────────

export const noteEntryRepo = {
  async getAll(): Promise<NoteEntry[]> {
    return db.noteEntries.toArray();
  },
  async getByTopic(topicId: string): Promise<NoteEntry[]> {
    return db.noteEntries.where('topicId').equals(topicId).toArray();
  },
  async getBySubject(subjectId: string): Promise<NoteEntry[]> {
    return db.noteEntries.where('subjectId').equals(subjectId).toArray();
  },
  async getById(id: string): Promise<NoteEntry | undefined> {
    return db.noteEntries.get(id);
  },
  async upsert(entry: NoteEntry): Promise<void> {
    await db.noteEntries.put(entry);
  },
  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.noteEntries, db.mistakes, async () => {
      await db.mistakes.where('itemId').equals(id).delete();
      await db.noteEntries.delete(id);
    });
  },
  async getDueForReview(): Promise<NoteEntry[]> {
    const now = new Date().toISOString();
    return db.noteEntries
      .filter(n => !!n.nextReviewAt && n.nextReviewAt <= now)
      .toArray();
  },
};

// ─── Solutions ───────────────────────────────────────────────────

export const solutionRepo = {
  async getByProblem(problemId: string): Promise<Solution[]> {
    return db.solutions.where('problemId').equals(problemId).sortBy('order');
  },
  async getById(id: string): Promise<Solution | undefined> {
    return db.solutions.get(id);
  },
  async upsert(solution: Solution): Promise<void> {
    await db.solutions.put(solution);
  },
  async delete(id: string): Promise<void> {
    await db.solutions.delete(id);
  },
};

// ─── Mistakes (polymorphic) ───────────────────────────────────────

export const mistakeRepo = {
  async getAll(): Promise<Mistake[]> {
    return db.mistakes.orderBy('createdAt').reverse().toArray();
  },
  /** Get mistakes for a problem OR note entry by itemId */
  async getByItem(itemId: string): Promise<Mistake[]> {
    return db.mistakes.where('itemId').equals(itemId).toArray();
  },
  /** Legacy compat — same as getByItem but named for problem context */
  async getByProblem(problemId: string): Promise<Mistake[]> {
    return db.mistakes.where('itemId').equals(problemId).toArray();
  },
  async upsert(mistake: Mistake): Promise<void> {
    await db.mistakes.put(mistake);
  },
  async delete(id: string): Promise<void> {
    await db.mistakes.delete(id);
  },
};

// ─── Flashcards ──────────────────────────────────────────────────

export const flashcardRepo = {
  async getAll(): Promise<Flashcard[]> {
    return db.flashcards.toArray();
  },
  async getBySubject(subjectId: string): Promise<Flashcard[]> {
    return db.flashcards.where('subjectId').equals(subjectId).toArray();
  },
  async getDueForReview(): Promise<Flashcard[]> {
    const now = new Date().toISOString();
    return db.flashcards
      .filter(f => !f.nextReviewAt || f.nextReviewAt <= now)
      .toArray();
  },
  async upsert(card: Flashcard): Promise<void> {
    await db.flashcards.put(card);
  },
  async delete(id: string): Promise<void> {
    await db.flashcards.delete(id);
  },
};

// ─── Settings ────────────────────────────────────────────────────

export const settingsRepo = {
  async get(): Promise<Settings> {
    const s = await db.settings.get(1);
    return s ?? { id: 1, theme: 'system', dailyGoal: 5 };
  },
  async upsert(settings: Settings): Promise<void> {
    await db.settings.put(settings);
  },
};

// ─── Activity Logs ───────────────────────────────────────────────

export const activityRepo = {
  async getAll(): Promise<ActivityLog[]> {
    return db.activityLogs.orderBy('date').toArray();
  },
  async log(entry: ActivityLog): Promise<void> {
    await db.activityLogs.put(entry);
  },
};

// ─── Full Export / Import ────────────────────────────────────────

export async function exportAllData() {
  const [
    subjects, topics, problems, noteEntries, solutions,
    mistakes, flashcards, settings, activityLogs,
  ] = await Promise.all([
    db.subjects.toArray(),
    db.topics.toArray(),
    db.problems.toArray(),
    db.noteEntries.toArray(),
    db.solutions.toArray(),
    db.mistakes.toArray(),
    db.flashcards.toArray(),
    db.settings.toArray(),
    db.activityLogs.toArray(),
  ]);
  return { subjects, topics, problems, noteEntries, solutions, mistakes, flashcards, settings, activityLogs };
}

export async function importAllData(data: Awaited<ReturnType<typeof exportAllData>>) {
  const tables = [db.subjects, db.topics, db.problems, db.noteEntries, db.solutions, db.mistakes] as const;
  await db.transaction('rw', tables, async () => {
    await Promise.all([
      db.subjects.clear(), db.topics.clear(), db.problems.clear(),
      db.noteEntries.clear(), db.solutions.clear(), db.mistakes.clear(),
    ]);
    await Promise.all([
      db.subjects.bulkPut(data.subjects),
      db.topics.bulkPut(data.topics),
      db.problems.bulkPut(data.problems),
      db.noteEntries.bulkPut(data.noteEntries ?? []),
      db.solutions.bulkPut(data.solutions),
      db.mistakes.bulkPut(data.mistakes),
    ]);
  });
  await db.transaction('rw', db.flashcards, db.settings, db.activityLogs, async () => {
    await Promise.all([
      db.flashcards.clear(), db.settings.clear(), db.activityLogs.clear(),
    ]);
    await Promise.all([
      db.flashcards.bulkPut(data.flashcards),
      db.settings.bulkPut(data.settings),
      db.activityLogs.bulkPut(data.activityLogs),
    ]);
  });
}
