import Dexie, { type Table } from 'dexie';
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

export class PlacementPrepDB extends Dexie {
  subjects!: Table<Subject>;
  topics!: Table<Topic>;
  problems!: Table<Problem>;
  noteEntries!: Table<NoteEntry>;
  solutions!: Table<Solution>;
  mistakes!: Table<Mistake>;
  flashcards!: Table<Flashcard>;
  settings!: Table<Settings>;
  activityLogs!: Table<ActivityLog>;

  constructor() {
    super('PlacementPrepDB');

    // ── v1: original schema ────────────────────────────────────────
    this.version(1).stores({
      subjects: 'id, order',
      topics: 'id, subjectId, order',
      problems: 'id, subjectId, topicId, status, difficulty, confidence, nextReviewAt',
      solutions: 'id, problemId, order',
      mistakes: 'id, problemId, type, createdAt',
      flashcards: 'id, subjectId, topicId, nextReviewAt',
      settings: 'id',
      activityLogs: 'id, date, type, problemId',
    });

    // ── v2: add noteEntries table; add topic.type; migrate Mistake to polymorphic ─
    this.version(2)
      .stores({
        subjects: 'id, order',
        // topics now has a 'type' field indexed
        topics: 'id, subjectId, order, type',
        problems: 'id, subjectId, topicId, status, difficulty, confidence, nextReviewAt',
        // new table for theory/notes topics
        noteEntries: 'id, subjectId, topicId, status, confidence, nextReviewAt',
        solutions: 'id, problemId, order',
        // mistakes now indexed by itemId + itemType (polymorphic) and legacy problemId
        mistakes: 'id, itemId, itemType, problemId, type, createdAt',
        flashcards: 'id, subjectId, topicId, nextReviewAt',
        settings: 'id',
        activityLogs: 'id, date, type, problemId',
      })
      .upgrade(async tx => {
        // 1. Give every existing topic type: 'code' (safe default)
        await tx
          .table('topics')
          .toCollection()
          .modify((topic: Record<string, unknown>) => {
            if (!topic['type']) topic['type'] = 'code';
          });

        // 2. Migrate Mistake rows: add itemType + itemId from legacy problemId
        await tx
          .table('mistakes')
          .toCollection()
          .modify((mistake: Record<string, unknown>) => {
            if (!mistake['itemType']) {
              mistake['itemType'] = 'problem';
              mistake['itemId'] = mistake['problemId'];
            }
          });
      });
  }
}

export const db = new PlacementPrepDB();
