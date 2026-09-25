import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mistakeRepo } from '../db/repositories';
import type { Mistake, MistakeType } from '../types';
import { MISTAKE_TYPE_LABELS } from '../types';
import { useProblemStore } from '../store/problemStore';
import { useNoteStore } from '../store/noteStore';
import { useRoadmapStore } from '../store/roadmapStore';
import MarkdownView from '../components/common/MarkdownView';
import { formatDate } from '../lib/dateUtils';

export default function MistakesPage() {
  const [mistakes, setMistakes]       = useState<Mistake[]>([]);
  const [filterType, setFilterType]   = useState<MistakeType | 'all'>('all');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const { problems }                  = useProblemStore();
  const { notes }                     = useNoteStore();
  const { subjects, topics }          = useRoadmapStore();

  useEffect(() => {
    mistakeRepo.getAll().then(setMistakes).catch(console.error);
  }, []);

  const filtered = mistakes.filter(m => filterType === 'all' || m.type === filterType);

  const getItemInfo = (mistake: Mistake) => {
    if (mistake.itemType === 'note') {
      const n = notes.find(x => x.id === mistake.itemId);
      if (!n) return { title: 'Unknown Note', subject: '', topic: '', href: '#', badge: '📝' };
      const s = subjects.find(x => x.id === n.subjectId);
      const t = topics.find(x => x.id === n.topicId);
      return { title: n.title, subject: s?.name ?? '', topic: t?.name ?? '', href: `/note/${n.id}`, badge: '📝' };
    }
    // problem (default + legacy)
    const p = problems.find(x => x.id === (mistake.itemId || mistake.problemId));
    if (!p) return { title: 'Unknown Problem', subject: '', topic: '', href: '#', badge: '</>' };
    const s = subjects.find(x => x.id === p.subjectId);
    const t = topics.find(x => x.id === p.topicId);
    return { title: p.title, subject: s?.name ?? '', topic: t?.name ?? '', href: `/problem/${p.id}`, badge: '</>' };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        ⚠️ All Mistakes ({mistakes.length})
      </h1>

      <div className="flex gap-3 mb-6">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as MistakeType | 'all')}
          className="input-base text-sm"
          aria-label="Filter by mistake type"
        >
          <option value="all">All Types</option>
          {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map(t => (
            <option key={t} value={t}>{MISTAKE_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">No mistakes found.</p>
        )}
        {filtered.map(m => {
          const { title, subject, topic, href, badge } = getItemInfo(m);
          return (
            <div key={m.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
              >
                <span className="text-xs text-gray-400 shrink-0">{badge}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                  {MISTAKE_TYPE_LABELS[m.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{subject} › {topic}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(m.createdAt)}</span>
                <Link
                  to={href}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                  onClick={e => e.stopPropagation()}
                >
                  Open →
                </Link>
              </div>
              {expandedId === m.id && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">What went wrong</p>
                    <MarkdownView content={m.description} />
                  </div>
                  {m.fix && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Fix / Remember</p>
                      <MarkdownView content={m.fix} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
