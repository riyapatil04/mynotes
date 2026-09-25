import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout';
import Dashboard from './pages/Dashboard';
import ProblemPage from './pages/ProblemPage';
import SubjectPage from './pages/SubjectPage';
import MistakesPage from './pages/MistakesPage';
import PatternsPage from './pages/PatternsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import NoteEntryPage from './pages/NoteEntryPage';
import SettingsPage from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'problem/:id', element: <ProblemPage /> },
      { path: 'note/:id', element: <NoteEntryPage /> },
      { path: 'subject/:subjectId', element: <SubjectPage /> },
      { path: 'subject/:subjectId/topic/:topicId', element: <SubjectPage /> },
      { path: 'mistakes', element: <MistakesPage /> },
      { path: 'patterns', element: <PatternsPage /> },
      { path: 'flashcards', element: <FlashcardsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
