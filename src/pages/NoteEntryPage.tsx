import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Star, Plus, X, AlertTriangle } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { useRoadmapStore } from '../store/roadmapStore';
import NotesEditor from '../components/problem/NotesEditor';
import MistakeLog from '../components/problem/MistakeLog';
import ConfidenceSelector from '../components/problem/ConfidenceSelector';
import NoteStatusSelect from '../components/problem/NoteStatusSelect';
import EmptyState from '../components/common/EmptyState';
import type { Confidence, NoteStatus } from '../types';

export default function NoteEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, mistakes, loadNote, updateNote, setNoteStatus, setNoteConfidence, toggleNoteImportant, addMistake, deleteMistake } = useNoteStore();
  const { subjects, topics } = useRoadmapStore();

  const [newPoint, setNewPoint] = useState('');
  const [addingPoint, setAddingPoint] = useState(false);

  const note = notes.find(n => n.id === id);

  useEffect(() => {
    if (id) loadNote(id);
  }, [id, loadNote]);

  const subject = note ? subjects.find(s => s.id === note.subjectId) : undefined;
  const topic   = note ? topics.find(t => t.id === note.topicId)     : undefined;

  const handleUpdateDebounced = useCallback((field: string, value: string) => {
    if (!id) return;
    updateNote(id, { [field]: value } as Parameters<typeof updateNote>[1]);
  }, [id, updateNote]);

  const addImportantPoint = () => {
    if (!note || !newPoint.trim()) return;
    updateNote(note.id, { importantPoints: [...note.importantPoints, newPoint.trim()] });
    setNewPoint('');
    setAddingPoint(false);
  };

  const removeImportantPoint = (idx: number) => {
    if (!note) return;
    updateNote(note.id, { importantPoints: note.importantPoints.filter((_, i) => i !== idx) });
  };

  if (!note) {
    return (
      <EmptyState
        icon="🔍"
        title="Note not found"
        description="It may have been deleted."
        action={<button onClick={() => navigate('/')} className="btn-primary">Go to Dashboard</button>}
      />
    );
  }

  const noteMistakes = mistakes[note.id] ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
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
              <Link to={`/subject/${note.subjectId}/topic/${topic.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                📝 {topic.name}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-gray-700 dark:text-gray-300">{note.title}</span>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-3 mb-3">
          <input
            value={note.title}
            onChange={e => updateNote(note.id, { title: e.target.value })}
            className="flex-1 text-lg font-semibold bg-transparent text-gray-900 dark:text-gray-100 border-none outline-none focus:ring-0 placeholder-gray-400"
            placeholder="Note title..."
            aria-label="Note title"
          />
          <button
            onClick={() => toggleNoteImportant(note.id)}
            aria-label={note.important ? 'Unmark important' : 'Mark important'}
            title={note.important ? 'Remove from important' : 'Mark as important'}
            className={`p-1 rounded ${note.important ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'}`}
          >
            <Star size={18} className={note.important ? 'fill-yellow-500' : ''} />
          </button>
        </div>

        {/* Important Points */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">Key Points:</span>
          {note.importantPoints.map((pt, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {pt}
              <button onClick={() => removeImportantPoint(i)} aria-label={`Remove point: ${pt}`} className="hover:text-amber-900 dark:hover:text-amber-200 ml-0.5">×</button>
            </span>
          ))}
          {addingPoint ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={newPoint}
                onChange={e => setNewPoint(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addImportantPoint(); if (e.key === 'Escape') setAddingPoint(false); }}
                placeholder="Key point..."
                className="text-xs px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none w-36"
                aria-label="New key point"
              />
              <button onClick={addImportantPoint} className="text-xs text-amber-600">Add</button>
              <button onClick={() => setAddingPoint(false)}><X size={12} className="text-gray-400" /></button>
            </div>
          ) : (
            <button
              onClick={() => setAddingPoint(true)}
              className="text-xs text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5"
              aria-label="Add key point"
            >
              <Plus size={11} /> add point
            </button>
          )}
        </div>

        {/* Footer bar */}
        <div className="flex flex-wrap items-center gap-4">
          <NoteStatusSelect
            value={note.status}
            onChange={(s: NoteStatus) => setNoteStatus(note.id, s)}
          />
          <ConfidenceSelector
            value={note.confidence}
            onChange={(c: Confidence) => setNoteConfidence(note.id, c)}
          />
        </div>
      </div>

      {/* Two-pane: main content + mistakes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: main notebook pane — takes 60% */}
        <div className="flex-[3] flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Content tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            {[
              { key: 'content', label: 'Notes' },
              { key: 'questions', label: 'Interview Questions' },
            ].map(tab => (
              <ContentTabButton key={tab.key} tabKey={tab.key} label={tab.label} />
            ))}
          </div>
          <ContentPane
            note={note}
            onContentChange={v => handleUpdateDebounced('content', v)}
            onQuestionsChange={v => handleUpdateDebounced('commonQuestions', v)}
          />
        </div>

        {/* Right: mistakes pane — 40% */}
        <div className="flex-[2] flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            <button className="px-4 py-2.5 text-sm font-medium border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400">
              Mistakes ({noteMistakes.length})
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <MistakeLog
              itemId={note.id}
              itemType="note"
              mistakes={noteMistakes}
              onAdd={async (type, desc, fix) => { await addMistake(note.id, type, desc, fix); }}
              onDelete={(id) => deleteMistake(id, note.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function ContentTabButton({ tabKey, label }: { tabKey: string; label: string }) {
  // We use local state at parent level — this is just a display stub
  // The actual switching is handled by ContentPane below via simple conditional
  void tabKey;
  return (
    <span className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 select-none">
      {label}
    </span>
  );
}

interface ContentPaneProps {
  note: import('../types').NoteEntry;
  onContentChange: (v: string) => void;
  onQuestionsChange: (v: string) => void;
}

function ContentPane({ note, onContentChange, onQuestionsChange }: ContentPaneProps) {
  const [active, setActive] = useState<'content' | 'questions'>('content');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Real tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0 -mt-px">
        {([
          { key: 'content',   label: '📓 Notes' },
          { key: 'questions', label: '🎤 Interview Q&A' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              active === tab.key
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {active === 'content' ? (
          <NotesEditor
            value={note.content}
            onChange={onContentChange}
            placeholder="Write your notes in Markdown. Cover key concepts, definitions, examples..."
            label="Notes"
          />
        ) : (
          <div className="flex flex-col h-full">
            {note.importantPoints.length > 0 && (
              <div className="mx-3 mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Remember these</span>
                </div>
                <ul className="space-y-1">
                  {note.importantPoints.map((pt, i) => (
                    <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <NotesEditor
              value={note.commonQuestions}
              onChange={onQuestionsChange}
              placeholder={'## Common Interview Questions\n\n**Q: What is normalization?**\nA: ...'}
              label="Interview Questions"
            />
          </div>
        )}
      </div>
    </div>
  );
}
