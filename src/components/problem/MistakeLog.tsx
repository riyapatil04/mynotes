import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { Mistake, MistakeItemType, MistakeType } from '../../types';
import { MISTAKE_TYPE_LABELS } from '../../types';
import MistakeForm from './MistakeForm';
import MarkdownView from '../common/MarkdownView';
import { formatDate } from '../../lib/dateUtils';

interface MistakeLogProps {
  /** The id of the item (problemId OR noteId) */
  itemId: string;
  itemType: MistakeItemType;
  mistakes: Mistake[];
  onAdd: (type: MistakeType, description: string, fix: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function MistakeLog({ mistakes, onAdd, onDelete }: MistakeLogProps) {
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Watch-out banner */}
      {mistakes.length > 0 && (
        <details className="mx-3 mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-amber-800 dark:text-amber-300 select-none">
            <AlertTriangle size={14} />
            Watch out for: ({mistakes.length} previous mistake{mistakes.length !== 1 ? 's' : ''})
          </summary>
          <div className="px-3 pb-3 space-y-2">
            {mistakes.map(m => (
              <div key={m.id} className="text-xs text-amber-700 dark:text-amber-400">
                <span className="font-semibold">{MISTAKE_TYPE_LABELS[m.type]}:</span>{' '}
                {m.fix || m.description}
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="flex items-center justify-between px-3 py-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mistakes ({mistakes.length})
        </span>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-xs btn-primary"
          aria-label="Log a mistake"
        >
          <Plus size={12} /> Log Mistake
        </button>
      </div>

      {adding && (
        <div className="mx-3 mb-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <MistakeForm
            onSubmit={async (type, desc, fix) => {
              await onAdd(type, desc, fix);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="flex-1 px-3 space-y-2 overflow-auto pb-4">
        {mistakes.length === 0 && !adding && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            No mistakes logged yet. That's either great or suspicious. 😄
          </p>
        )}
        {mistakes.map(m => (
          <div key={m.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer"
              onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
            >
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                {MISTAKE_TYPE_LABELS[m.type]}
              </span>
              <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{m.description}</span>
              <span className="text-xs text-gray-400">{formatDate(m.createdAt)}</span>
              {expandedId === m.id
                ? <ChevronUp size={14} className="text-gray-400" />
                : <ChevronDown size={14} className="text-gray-400" />}
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (confirm('Delete this mistake?')) onDelete(m.id);
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-400"
                aria-label="Delete mistake"
              >
                <Trash2 size={12} />
              </button>
            </div>
            {expandedId === m.id && (
              <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-2 space-y-2">
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
        ))}
      </div>
    </div>
  );
}
