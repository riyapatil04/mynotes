import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Star, ChevronRight, Plus, X } from 'lucide-react';
import type { Problem } from '../../types';
import { useProblemStore } from '../../store/problemStore';
import { useRoadmapStore } from '../../store/roadmapStore';
import { DifficultyBadge } from '../common/Badge';
import { PatternChip } from '../common/Badge';
import Timer from './Timer';
import ConfidenceSelector from './ConfidenceSelector';
import StatusSelect from './StatusSelect';
import type { Confidence, ProblemStatus } from '../../types';

interface ProblemHeaderProps {
  problem: Problem;
}

export default function ProblemHeader({ problem }: ProblemHeaderProps) {
  const { updateProblem, setStatus, setConfidence, toggleImportant } = useProblemStore();
  const { subjects, topics } = useRoadmapStore();
  const [newPattern, setNewPattern] = useState('');
  const [addingPattern, setAddingPattern] = useState(false);

  const subject = subjects.find(s => s.id === problem.subjectId);
  const topic = topics.find(t => t.id === problem.topicId);

  const handleTimerStop = (total: number) => {
    updateProblem(problem.id, { timeSpentSeconds: total });
  };

  const addPattern = () => {
    if (!newPattern.trim()) return;
    updateProblem(problem.id, { patterns: [...problem.patterns, newPattern.trim()] });
    setNewPattern('');
    setAddingPattern(false);
  };

  const removePattern = (p: string) => {
    updateProblem(problem.id, { patterns: problem.patterns.filter(x => x !== p) });
  };

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Dashboard</Link>
        <ChevronRight size={12} />
        {subject && (
          <>
            <Link to={`/subject/${subject.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
              {subject.icon} {subject.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        {topic && (
          <>
            <Link to={`/subject/${problem.subjectId}/topic/${topic.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
              {topic.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-gray-700 dark:text-gray-300">{problem.title}</span>
      </div>

      {/* Title row */}
      <div className="flex items-start gap-3 mb-3">
        <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {problem.title}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <DifficultyBadge difficulty={problem.difficulty} />
          <button
            onClick={() => toggleImportant(problem.id)}
            aria-label={problem.important ? 'Unmark important' : 'Mark important'}
            title={problem.important ? 'Remove from important' : 'Mark as important'}
            className={`p-1 rounded ${problem.important ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'}`}
          >
            <Star size={18} className={problem.important ? 'fill-yellow-500' : ''} />
          </button>
          {problem.sourceUrl && (
            <a
              href={problem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              aria-label="Open source link"
              title="Open source"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Patterns */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {problem.patterns.map(p => (
          <PatternChip key={p} label={p} onRemove={() => removePattern(p)} />
        ))}
        {addingPattern ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={newPattern}
              onChange={e => setNewPattern(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addPattern(); if (e.key === 'Escape') setAddingPattern(false); }}
              placeholder="Pattern name"
              className="text-xs px-2 py-0.5 rounded-full border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none w-32"
              aria-label="New pattern name"
            />
            <button onClick={addPattern} className="text-xs text-indigo-600">Add</button>
            <button onClick={() => setAddingPattern(false)}><X size={12} className="text-gray-400" /></button>
          </div>
        ) : (
          <button
            onClick={() => setAddingPattern(true)}
            className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5"
            aria-label="Add pattern"
          >
            <Plus size={11} /> tag
          </button>
        )}
      </div>

      {/* Footer bar */}
      <div className="flex flex-wrap items-center gap-4">
        <StatusSelect
          value={problem.status}
          onChange={(s: ProblemStatus) => setStatus(problem.id, s)}
        />
        <ConfidenceSelector
          value={problem.confidence}
          onChange={(c: Confidence) => setConfidence(problem.id, c)}
        />
        <div className="ml-auto">
          <Timer initialSeconds={problem.timeSpentSeconds} onStop={handleTimerStop} />
        </div>
      </div>
    </div>
  );
}
