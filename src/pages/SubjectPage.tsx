import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Code2, FileText } from 'lucide-react';
import { useRoadmapStore } from '../store/roadmapStore';
import { useProblemStore } from '../store/problemStore';
import { useNoteStore } from '../store/noteStore';
import { DifficultyBadge, StatusBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import type { Difficulty, NoteStatus, ProblemStatus } from '../types';
import { NOTE_STATUS_COLORS, NOTE_STATUS_LABELS } from '../types';

export default function SubjectPage() {
  const { subjectId, topicId } = useParams<{ subjectId: string; topicId?: string }>();
  const { subjects, topics } = useRoadmapStore();
  const { problems, addProblem, deleteProblem } = useProblemStore();
  const { notes, addNote, deleteNote } = useNoteStore();
  const navigate = useNavigate();

  const subject = subjects.find(s => s.id === subjectId);
  const topic   = topics.find(t => t.id === topicId);
  const isNoteTopic = topic?.type === 'notes';

  // ── filtered items ────────────────────────────────────────────
  const filteredProblems = problems.filter(p =>
    p.subjectId === subjectId && (!topicId || p.topicId === topicId)
  );
  const filteredNotes = notes.filter(n =>
    n.subjectId === subjectId && (!topicId || n.topicId === topicId)
  );

  // ── modals & form state ───────────────────────────────────────
  const [showAdd, setShowAdd]             = useState(false);
  const [newTitle, setNewTitle]           = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium');
  const [newTopicId, setNewTopicId]       = useState(topicId ?? '');
  const [filterStatus, setFilterStatus]   = useState<ProblemStatus | NoteStatus | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');

  const subjectTopics = topics
    .filter(t => t.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);

  const selectedTopic = subjectTopics.find(t => t.id === newTopicId);
  const addingNoteTopic = selectedTopic?.type === 'notes';

  // ── handlers ─────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newTitle.trim() || !newTopicId) return;
    const selTopic = subjectTopics.find(t => t.id === newTopicId);
    if (selTopic?.type === 'notes') {
      const n = await addNote({
        subjectId: subjectId!,
        topicId: newTopicId,
        title: newTitle.trim(),
        content: '',
        importantPoints: [],
        commonQuestions: '',
        status: 'not_started',
        confidence: 1,
        important: false,
      });
      setShowAdd(false); setNewTitle('');
      navigate(`/note/${n.id}`);
    } else {
      const p = await addProblem({
        subjectId: subjectId!,
        topicId: newTopicId,
        title: newTitle.trim(),
        description: '',
        difficulty: newDifficulty,
        patterns: [],
        companies: [],
        status: 'not_started',
        confidence: 1,
        important: false,
        notes: '',
        explainIt: '',
        attempts: 0,
        timeSpentSeconds: 0,
      });
      setShowAdd(false); setNewTitle('');
      navigate(`/problem/${p.id}`);
    }
  };

  if (!subject) return <EmptyState icon="🔍" title="Subject not found" />;

  // ── display lists ─────────────────────────────────────────────
  const displayedProblems = isNoteTopic ? [] : filteredProblems.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
    return true;
  });
  const displayedNotes = isNoteTopic ? filteredNotes.filter(n =>
    filterStatus === 'all' || n.status === filterStatus
  ) : [];

  const totalItems = isNoteTopic ? filteredNotes.length : filteredProblems.length;
  const doneItems  = isNoteTopic
    ? filteredNotes.filter(n => n.status === 'confident').length
    : filteredProblems.filter(p => p.status === 'solved').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {subject.icon} {subject.name}{topic ? ` › ${topic.name}` : ''}
            </h1>
            {topic && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                topic.type === 'code'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {topic.type === 'code' ? <Code2 size={11} /> : <FileText size={11} />}
                {topic.type === 'code' ? 'Code' : 'Notes'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalItems} item{totalItems !== 1 ? 's' : ''} · {doneItems} done
          </p>
        </div>
        <button
          onClick={() => { setNewTopicId(topicId ?? subjectTopics[0]?.id ?? ''); setShowAdd(true); }}
          className="btn-primary flex items-center gap-1"
        >
          <Plus size={14} /> {isNoteTopic ? 'Add Note' : 'Add Problem'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as ProblemStatus | NoteStatus | 'all')}
          className="input-base text-sm"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          {isNoteTopic
            ? (['not_started','learning','revised','confident'] as NoteStatus[]).map(s => (
                <option key={s} value={s}>{NOTE_STATUS_LABELS[s]}</option>
              ))
            : (['not_started','attempted','couldnt_solve','solved','needs_revision'] as ProblemStatus[]).map(s => (
                <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
              ))
          }
        </select>
        {!isNoteTopic && (
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value as Difficulty | 'all')}
            className="input-base text-sm"
            aria-label="Filter by difficulty"
          >
            <option value="all">All Difficulties</option>
            {(['Easy','Medium','Hard'] as Difficulty[]).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>

      {/* List */}
      {isNoteTopic ? (
        displayedNotes.length === 0 ? (
          <EmptyState icon="📝" title="No notes yet" description="Add your first theory note."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Note</button>} />
        ) : (
          <div className="space-y-2">
            {displayedNotes.map(n => (
              <div key={n.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group">
                <Link to={`/note/${n.id}`} className="flex-1 flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {n.title}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${NOTE_STATUS_COLORS[n.status]}`}>
                    {NOTE_STATUS_LABELS[n.status]}
                  </span>
                  <span className="text-xs text-gray-400">conf: {n.confidence}/5</span>
                  {n.important && <span title="Important" className="text-yellow-500 text-xs">⭐</span>}
                </Link>
                <button
                  onClick={() => { if (confirm(`Delete "${n.title}"?`)) deleteNote(n.id); }}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        displayedProblems.length === 0 ? (
          <EmptyState icon="📝" title="No problems yet" description="Add your first problem to get started."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Problem</button>} />
        ) : (
          <div className="space-y-2">
            {displayedProblems.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                <Link to={`/problem/${p.id}`} className="flex-1 flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {p.title}
                  </span>
                  <DifficultyBadge difficulty={p.difficulty} />
                  <StatusBadge status={p.status} />
                  {p.important && <span title="Important" className="text-yellow-500 text-xs">⭐</span>}
                </Link>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.sourceUrl && (
                    <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" aria-label="Open source">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteProblem(p.id); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-400" aria-label="Delete problem">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={addingNoteTopic ? 'Add Note' : 'Add Problem'}>
        <div className="space-y-3">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder={addingNoteTopic ? 'Note title' : 'Problem title'}
            className="w-full input-base"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            aria-label="Title"
          />
          <select value={newTopicId} onChange={e => setNewTopicId(e.target.value)} className="w-full input-base" aria-label="Topic">
            <option value="">Select topic...</option>
            {subjectTopics.map(t => (
              <option key={t.id} value={t.id}>
                {t.type === 'code' ? '</>' : '📝'} {t.name}
              </option>
            ))}
          </select>
          {!addingNoteTopic && (
            <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value as Difficulty)} className="w-full input-base" aria-label="Difficulty">
              {(['Easy','Medium','Hard'] as Difficulty[]).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAdd} className="btn-primary" disabled={!newTitle.trim() || !newTopicId}>Add</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
