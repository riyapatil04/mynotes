import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { noteEntryRepo, mistakeRepo, activityRepo } from '../db/repositories';
import type {
  Confidence,
  Mistake,
  MistakeType,
  NoteEntry,
  NoteStatus,
} from '../types';
import { nowISO, todayStr } from '../lib/dateUtils';
import { computeNextReview } from '../lib/spacedRepetition';

interface NoteState {
  notes: NoteEntry[];
  mistakes: Record<string, Mistake[]>; // keyed by noteId
  loaded: boolean;

  loadAll: () => Promise<void>;
  loadNote: (id: string) => Promise<void>;

  // CRUD
  addNote: (data: Omit<NoteEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<NoteEntry>;
  updateNote: (id: string, partial: Partial<NoteEntry>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Status / confidence
  setNoteStatus: (id: string, status: NoteStatus) => Promise<void>;
  setNoteConfidence: (id: string, confidence: Confidence) => Promise<void>;
  toggleNoteImportant: (id: string) => Promise<void>;

  // Mistakes
  addMistake: (noteId: string, type: MistakeType, description: string, fix: string) => Promise<Mistake>;
  deleteMistake: (id: string, noteId: string) => Promise<void>;

  // Helpers
  getNotesForTopic: (topicId: string) => NoteEntry[];
  getNotesForSubject: (subjectId: string) => NoteEntry[];
  getDueForReview: () => NoteEntry[];
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  mistakes: {},
  loaded: false,

  loadAll: async () => {
    try {
      const notes = await noteEntryRepo.getAll();
      set({ notes, loaded: true });
    } catch (err) {
      console.error('Failed to load notes', err);
    }
  },

  loadNote: async (id) => {
    try {
      const mistakes = await mistakeRepo.getByItem(id);
      set(state => ({
        mistakes: { ...state.mistakes, [id]: mistakes },
      }));
    } catch (err) {
      console.error('Failed to load note details', err);
    }
  },

  addNote: async (data) => {
    const note: NoteEntry = {
      ...data,
      id: uuidv4(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await noteEntryRepo.upsert(note);
    set(state => ({ notes: [...state.notes, note] }));
    return note;
  },

  updateNote: async (id, partial) => {
    const notes = get().notes.map(n =>
      n.id === id ? { ...n, ...partial, updatedAt: nowISO() } : n
    );
    const updated = notes.find(n => n.id === id)!;
    await noteEntryRepo.upsert(updated);
    set({ notes });
  },

  deleteNote: async (id) => {
    await noteEntryRepo.delete(id);
    set(state => {
      const { [id]: _m, ...mistakes } = state.mistakes;
      return {
        notes: state.notes.filter(n => n.id !== id),
        mistakes,
      };
    });
  },

  setNoteStatus: async (id, status) => {
    await get().updateNote(id, {
      status,
      lastRevisedAt: status === 'revised' || status === 'confident' ? nowISO() : undefined,
    });
    await activityRepo.log({
      id: uuidv4(),
      date: todayStr(),
      type: 'note_revised',
      noteId: id,
    });
  },

  setNoteConfidence: async (id, confidence) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) return;
    const nextReviewAt = computeNextReview(confidence, true, note.nextReviewAt);
    await get().updateNote(id, { confidence, nextReviewAt });
  },

  toggleNoteImportant: async (id) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) return;
    await get().updateNote(id, { important: !note.important });
  },

  addMistake: async (noteId, type, description, fix) => {
    const mistake: Mistake = {
      id: uuidv4(),
      itemType: 'note',
      itemId: noteId,
      problemId: noteId, // keep legacy field consistent
      type,
      description,
      fix,
      createdAt: nowISO(),
    };
    await mistakeRepo.upsert(mistake);
    set(state => ({
      mistakes: {
        ...state.mistakes,
        [noteId]: [...(state.mistakes[noteId] ?? []), mistake],
      },
    }));
    return mistake;
  },

  deleteMistake: async (id, noteId) => {
    await mistakeRepo.delete(id);
    set(state => ({
      mistakes: {
        ...state.mistakes,
        [noteId]: (state.mistakes[noteId] ?? []).filter(m => m.id !== id),
      },
    }));
  },

  getNotesForTopic: (topicId) =>
    get().notes.filter(n => n.topicId === topicId),

  getNotesForSubject: (subjectId) =>
    get().notes.filter(n => n.subjectId === subjectId),

  getDueForReview: () => {
    const now = new Date().toISOString();
    return get().notes.filter(n => !!n.nextReviewAt && n.nextReviewAt <= now);
  },
}));
