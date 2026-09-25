import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { subjectRepo, topicRepo } from '../db/repositories';
import type { Subject, Topic, TopicType } from '../types';
import { nowISO } from '../lib/dateUtils';

interface RoadmapState {
  subjects: Subject[];
  topics: Topic[];
  loaded: boolean;

  load: () => Promise<void>;

  // Subjects
  addSubject: (name: string, icon: string, color: string) => Promise<Subject>;
  updateSubject: (id: string, partial: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  reorderSubjects: (subjects: Subject[]) => Promise<void>;

  // Topics — now requires TopicType
  addTopic: (subjectId: string, name: string, type: TopicType) => Promise<Topic>;
  updateTopic: (id: string, partial: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  reorderTopics: (topics: Topic[]) => Promise<void>;

  // Helpers
  getTopicsForSubject: (subjectId: string) => Topic[];
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  subjects: [],
  topics: [],
  loaded: false,

  load: async () => {
    try {
      const subjects = await subjectRepo.getAll();
      const topicsArrays = await Promise.all(
        subjects.map(s => topicRepo.getBySubject(s.id))
      );
      const topics = topicsArrays.flat();
      set({ subjects, topics, loaded: true });
    } catch (err) {
      console.error('Failed to load roadmap', err);
    }
  },

  // ── Subjects ──────────────────────────────────────────────────

  addSubject: async (name, icon, color) => {
    const subjects = get().subjects;
    const subject: Subject = {
      id: uuidv4(),
      name,
      icon,
      color,
      order: subjects.length,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await subjectRepo.upsert(subject);
    set({ subjects: [...subjects, subject] });
    return subject;
  },

  updateSubject: async (id, partial) => {
    const subjects = get().subjects.map(s =>
      s.id === id ? { ...s, ...partial, updatedAt: nowISO() } : s
    );
    const updated = subjects.find(s => s.id === id)!;
    await subjectRepo.upsert(updated);
    set({ subjects });
  },

  deleteSubject: async (id) => {
    await subjectRepo.delete(id);
    set({
      subjects: get().subjects.filter(s => s.id !== id),
      topics: get().topics.filter(t => t.subjectId !== id),
    });
  },

  reorderSubjects: async (subjects) => {
    const reordered = subjects.map((s, i) => ({ ...s, order: i }));
    await Promise.all(reordered.map(s => subjectRepo.upsert(s)));
    set({ subjects: reordered });
  },

  // ── Topics ────────────────────────────────────────────────────

  addTopic: async (subjectId, name, type) => {
    const existing = get().topics.filter(t => t.subjectId === subjectId);
    const topic: Topic = {
      id: uuidv4(),
      subjectId,
      name,
      type,
      order: existing.length,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await topicRepo.upsert(topic);
    set({ topics: [...get().topics, topic] });
    return topic;
  },

  updateTopic: async (id, partial) => {
    const topics = get().topics.map(t =>
      t.id === id ? { ...t, ...partial, updatedAt: nowISO() } : t
    );
    const updated = topics.find(t => t.id === id)!;
    await topicRepo.upsert(updated);
    set({ topics });
  },

  deleteTopic: async (id) => {
    await topicRepo.delete(id);
    set({ topics: get().topics.filter(t => t.id !== id) });
  },

  reorderTopics: async (topics) => {
    const reordered = topics.map((t, i) => ({ ...t, order: i }));
    await Promise.all(reordered.map(t => topicRepo.upsert(t)));
    set(state => ({
      topics: state.topics
        .filter(t => !reordered.find(r => r.id === t.id))
        .concat(reordered),
    }));
  },

  getTopicsForSubject: (subjectId) => {
    return get().topics
      .filter(t => t.subjectId === subjectId)
      .sort((a, b) => a.order - b.order);
  },
}));
