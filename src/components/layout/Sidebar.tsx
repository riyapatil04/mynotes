import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, Plus, Pencil, Trash2,
  LayoutDashboard, AlertTriangle, Layers, BookOpen,
  Code2, FileText,
} from 'lucide-react';
import { useRoadmapStore } from '../../store/roadmapStore';
import { useProblemStore } from '../../store/problemStore';
import { useNoteStore } from '../../store/noteStore';
import { useUIStore } from '../../store/uiStore';
import type { Subject, Topic, TopicType } from '../../types';
import { TOPIC_TYPE_LABELS } from '../../types';
import Modal from '../common/Modal';

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const { subjects, topics, addSubject, updateSubject, deleteSubject, addTopic, updateTopic, deleteTopic } = useRoadmapStore();
  const { getProblemsForTopic } = useProblemStore();
  const { getNotesForTopic } = useNoteStore();
  const { expandedSubjects, toggleSubjectExpanded } = useUIStore();

  const [addSubjectOpen, setAddSubjectOpen]         = useState(false);
  const [editSubject, setEditSubject]               = useState<Subject | null>(null);
  const [addTopicForSubject, setAddTopicForSubject] = useState<string | null>(null);
  const [editTopic, setEditTopic]                   = useState<Topic | null>(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectIcon, setNewSubjectIcon] = useState('📚');
  const [newTopicName, setNewTopicName]     = useState('');
  const [newTopicType, setNewTopicType]     = useState<TopicType>('code');

  if (!sidebarOpen) return null;

  // ── handlers ───────────────────────────────────────────────────

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    await addSubject(newSubjectName.trim(), newSubjectIcon, '#6366f1');
    setNewSubjectName(''); setNewSubjectIcon('📚'); setAddSubjectOpen(false);
  };

  const handleEditSubject = async () => {
    if (!editSubject?.name.trim()) return;
    await updateSubject(editSubject.id, { name: editSubject.name, icon: editSubject.icon });
    setEditSubject(null);
  };

  const handleAddTopic = async () => {
    if (!addTopicForSubject || !newTopicName.trim()) return;
    await addTopic(addTopicForSubject, newTopicName.trim(), newTopicType);
    setNewTopicName(''); setNewTopicType('code'); setAddTopicForSubject(null);
  };

  const handleEditTopic = async () => {
    if (!editTopic?.name.trim()) return;
    await updateTopic(editTopic.id, { name: editTopic.name });
    setEditTopic(null);
  };

  return (
    <>
      <aside className="w-72 shrink-0 h-full flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">

        {/* Top nav links */}
        <nav className="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          {[
            { to: '/',           icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
            { to: '/mistakes',   icon: <AlertTriangle  size={16} />, label: 'Mistakes' },
            { to: '/patterns',   icon: <Layers         size={16} />, label: 'Patterns' },
            { to: '/flashcards', icon: <BookOpen       size={16} />, label: 'Flashcards' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Roadmap header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Roadmap
          </span>
          <button
            onClick={() => setAddSubjectOpen(true)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            aria-label="Add subject" title="Add subject"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Subject tree */}
        <div className="flex-1 px-2 pb-4">
          {subjects.map(subject => {
            const subjectTopics = topics
              .filter(t => t.subjectId === subject.id)
              .sort((a, b) => a.order - b.order);
            const isExpanded = expandedSubjects.has(subject.id);

            return (
              <div key={subject.id} className="mb-1">
                {/* Subject row */}
                <div className="group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <button
                    onClick={() => toggleSubjectExpanded(subject.id)}
                    className="flex-1 flex items-center gap-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{subject.icon}</span>
                    <span className="truncate">{subject.name}</span>
                  </button>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); setAddTopicForSubject(subject.id); setNewTopicName(''); setNewTopicType('code'); }}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                      aria-label={`Add topic to ${subject.name}`} title="Add topic"
                    ><Plus size={12} /></button>
                    <button
                      onClick={e => { e.stopPropagation(); setEditSubject(subject); }}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                      aria-label={`Edit ${subject.name}`} title="Edit"
                    ><Pencil size={12} /></button>
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm(`Delete "${subject.name}" and all its data?`)) deleteTopic === deleteTopic && deleteSubject(subject.id); }}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-red-400"
                      aria-label={`Delete ${subject.name}`} title="Delete"
                    ><Trash2 size={12} /></button>
                  </div>
                </div>

                {/* Topics */}
                {isExpanded && (
                  <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
                    {subjectTopics.map(topic => {
                      const isCode  = topic.type === 'code';
                      const items   = isCode ? getProblemsForTopic(topic.id) : getNotesForTopic(topic.id);
                      const done    = isCode
                        ? getProblemsForTopic(topic.id).filter(p => p.status === 'solved').length
                        : getNotesForTopic(topic.id).filter(n => n.status === 'confident').length;

                      return (
                        <div key={topic.id} className="group/topic">
                          {/* Topic link */}
                          <div className="flex items-center">
                            <Link
                              to={`/subject/${subject.id}/topic/${topic.id}`}
                              className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                            >
                              {isCode
                                ? <Code2  size={12} className="text-indigo-400 shrink-0" />
                                : <FileText size={12} className="text-amber-400 shrink-0" />
                              }
                              <span className="flex-1 truncate">{topic.name}</span>
                              {items.length > 0 && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                  {done}/{items.length}
                                </span>
                              )}
                            </Link>
                            <div className="hidden group-hover/topic:flex items-center pr-1">
                              <button
                                onClick={() => setEditTopic(topic)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                                aria-label={`Edit topic ${topic.name}`} title="Edit topic"
                              ><Pencil size={11} /></button>
                              <button
                                onClick={() => { if (confirm(`Delete topic "${topic.name}"?`)) deleteTopic(topic.id); }}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-red-400"
                                aria-label={`Delete topic ${topic.name}`} title="Delete topic"
                              ><Trash2 size={11} /></button>
                            </div>
                          </div>

                          {/* Items under topic */}
                          <div className="ml-4 border-l border-gray-100 dark:border-gray-800 pl-2">
                            {isCode
                              ? getProblemsForTopic(topic.id).map(problem => (
                                  <Link
                                    key={problem.id}
                                    to={`/problem/${problem.id}`}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-xs text-gray-600 dark:text-gray-400"
                                  >
                                    <ProblemDot status={problem.status} />
                                    <span className="truncate">{problem.title}</span>
                                  </Link>
                                ))
                              : getNotesForTopic(topic.id).map(note => (
                                  <Link
                                    key={note.id}
                                    to={`/note/${note.id}`}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-xs text-gray-600 dark:text-gray-400"
                                  >
                                    <NoteDot status={note.status} />
                                    <span className="truncate">{note.title}</span>
                                  </Link>
                                ))
                            }
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => { setAddTopicForSubject(subject.id); setNewTopicName(''); setNewTopicType('code'); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                    >
                      <Plus size={12} /> Add topic
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Modals ─────────────────────────────────────────────── */}

      <Modal open={addSubjectOpen} onClose={() => setAddSubjectOpen(false)} title="Add Subject">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newSubjectIcon} onChange={e => setNewSubjectIcon(e.target.value)} className="w-14 text-center input-base" maxLength={2} placeholder="Icon" />
            <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} className="flex-1 input-base" placeholder="Subject name" autoFocus onKeyDown={e => e.key === 'Enter' && handleAddSubject()} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddSubjectOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAddSubject} className="btn-primary">Add</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editSubject} onClose={() => setEditSubject(null)} title="Edit Subject">
        {editSubject && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={editSubject.icon} onChange={e => setEditSubject({ ...editSubject, icon: e.target.value })} className="w-14 text-center input-base" maxLength={2} />
              <input value={editSubject.name} onChange={e => setEditSubject({ ...editSubject, name: e.target.value })} className="flex-1 input-base" autoFocus onKeyDown={e => e.key === 'Enter' && handleEditSubject()} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditSubject(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleEditSubject} className="btn-primary">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Topic — requires choosing type */}
      <Modal open={!!addTopicForSubject} onClose={() => setAddTopicForSubject(null)} title="Add Topic">
        <div className="space-y-4">
          <input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} className="w-full input-base" placeholder="Topic name" autoFocus onKeyDown={e => e.key === 'Enter' && handleAddTopic()} aria-label="Topic name" />
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Topic Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(['code', 'notes'] as TopicType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setNewTopicType(t)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    newTopicType === t
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                  aria-label={`Topic type: ${TOPIC_TYPE_LABELS[t]}`}
                >
                  {t === 'code' ? <Code2 size={14} /> : <FileText size={14} />}
                  {TOPIC_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {newTopicType === 'code'
                ? 'Problems with Monaco editor, solutions, complexity analysis.'
                : 'Theory notes with Markdown editor, key points, interview Q&A.'}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddTopicForSubject(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleAddTopic} className="btn-primary" disabled={!newTopicName.trim()}>Add</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editTopic} onClose={() => setEditTopic(null)} title="Edit Topic">
        {editTopic && (
          <div className="space-y-3">
            <input value={editTopic.name} onChange={e => setEditTopic({ ...editTopic, name: e.target.value })} className="w-full input-base" autoFocus onKeyDown={e => e.key === 'Enter' && handleEditTopic()} aria-label="Topic name" />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Type: <strong>{TOPIC_TYPE_LABELS[editTopic.type]}</strong> (cannot be changed after creation)
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTopic(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleEditTopic} className="btn-primary">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function ProblemDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_started: '⬜', attempted: '🟡', couldnt_solve: '🔴', solved: '🟢', needs_revision: '🔵',
  };
  return <span className="text-xs shrink-0">{map[status] ?? '⬜'}</span>;
}

function NoteDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_started: '⬜', learning: '🟡', revised: '🔵', confident: '🟢',
  };
  return <span className="text-xs shrink-0">{map[status] ?? '⬜'}</span>;
}
