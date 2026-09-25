import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useSettingsStore } from './store/settingsStore';
import { useRoadmapStore } from './store/roadmapStore';
import { useProblemStore } from './store/problemStore';
import { useNoteStore } from './store/noteStore';
import { db } from './db/dexie';
import { subjectRepo } from './db/repositories';
import {
  SEED_SUBJECTS,
  SEED_TOPICS,
  SEED_PROBLEMS,
  buildSeedFlashcards,
  buildSeedNoteEntries,
} from './lib/seedData';

export default function App() {
  const { load: loadSettings } = useSettingsStore();
  const { load: loadRoadmap } = useRoadmapStore();
  const { loadAll: loadProblems } = useProblemStore();
  const { loadAll: loadNotes } = useNoteStore();

  useEffect(() => {
    async function init() {
      try {
        const existingSubjects = await subjectRepo.getAll();
        if (existingSubjects.length === 0) {
          await db.subjects.bulkPut(SEED_SUBJECTS);
          await db.topics.bulkPut(SEED_TOPICS);
          await db.problems.bulkPut(SEED_PROBLEMS);
          await db.noteEntries.bulkPut(buildSeedNoteEntries());
          await db.flashcards.bulkPut(buildSeedFlashcards());
        }
        await loadSettings();
        await loadRoadmap();
        await loadProblems();
        await loadNotes();
      } catch (err) {
        console.error('App init failed', err);
      }
    }
    void init();
  }, [loadSettings, loadRoadmap, loadProblems, loadNotes]);

  return <RouterProvider router={router} />;
}
