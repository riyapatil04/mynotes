import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Code2, FileText } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useProblemStore } from '../../store/problemStore';
import { useNoteStore } from '../../store/noteStore';
import { useRoadmapStore } from '../../store/roadmapStore';
import { DifficultyBadge, StatusBadge } from '../common/Badge';
import { NOTE_STATUS_COLORS, NOTE_STATUS_LABELS } from '../../types';

type SearchResult =
  | { kind: 'problem'; id: string; title: string; subjectId: string; topicId: string; difficulty: import('../../types').Difficulty; status: import('../../types').ProblemStatus }
  | { kind: 'note';    id: string; title: string; subjectId: string; topicId: string; status: import('../../types').NoteStatus; confidence: number };

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { problems } = useProblemStore();
  const { notes } = useNoteStore();
  const { subjects, topics } = useRoadmapStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery('');
  }, [setCommandPaletteOpen]);

  const q = query.trim().toLowerCase();

  const filteredProblems: SearchResult[] = (q
    ? problems.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q) ||
        p.patterns.some(pat => pat.toLowerCase().includes(q))
      )
    : problems
  ).slice(0, 8).map(p => ({
    kind: 'problem' as const,
    id: p.id, title: p.title,
    subjectId: p.subjectId, topicId: p.topicId,
    difficulty: p.difficulty, status: p.status,
  }));

  const filteredNotes: SearchResult[] = (q
    ? notes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.importantPoints.some(pt => pt.toLowerCase().includes(q))
      )
    : notes
  ).slice(0, 4).map(n => ({
    kind: 'note' as const,
    id: n.id, title: n.title,
    subjectId: n.subjectId, topicId: n.topicId,
    status: n.status, confidence: n.confidence,
  }));

  const results: SearchResult[] = [...filteredProblems, ...filteredNotes].slice(0, 12);

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? '';
  const getTopicName   = (id: string) => topics.find(t => t.id === id)?.name   ?? '';

  const handleSelect = (r: SearchResult) => {
    navigate(r.kind === 'problem' ? `/problem/${r.id}` : `/note/${r.id}`);
    close();
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={close} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search problems, notes, patterns..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none"
          />
          <button onClick={close} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={16} /></button>
        </div>

        {/* Results */}
        <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-gray-400">No results found.</li>
          )}
          {results.map(r => (
            <li key={`${r.kind}-${r.id}`}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                onClick={() => handleSelect(r)}
              >
                {/* Type icon */}
                {r.kind === 'problem'
                  ? <Code2  size={14} className="text-indigo-400 shrink-0" />
                  : <FileText size={14} className="text-amber-400 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{r.title}</span>
                    {r.kind === 'problem' && <DifficultyBadge difficulty={r.difficulty} />}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>{getSubjectName(r.subjectId)}</span>
                    <span>›</span>
                    <span>{getTopicName(r.topicId)}</span>
                  </div>
                </div>
                {r.kind === 'problem'
                  ? <StatusBadge status={r.status} />
                  : <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${NOTE_STATUS_COLORS[r.status]}`}>
                      {NOTE_STATUS_LABELS[r.status]}
                    </span>
                }
              </button>
            </li>
          ))}
        </ul>

        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex gap-4">
          <span><kbd className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">↵</kbd> open</span>
          <span><kbd className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">Esc</kbd> close</span>
          <span className="ml-auto flex items-center gap-2">
            <Code2 size={10} /> Problems &nbsp;
            <FileText size={10} /> Notes
          </span>
        </div>
      </div>
    </div>
  );
}
