import { useState, useEffect, useCallback } from 'react';
import { Eye, Pencil } from 'lucide-react';
import MarkdownView from '../common/MarkdownView';

interface NotesEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export default function NotesEditor({
  value,
  onChange,
  placeholder = 'Write notes in Markdown...',
  label,
}: NotesEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [local, setLocal] = useState(value);

  // Sync if parent changes (e.g. switching problem)
  useEffect(() => { setLocal(value); }, [value]);

  // Debounced save
  useEffect(() => {
    const t = setTimeout(() => { if (local !== value) onChange(local); }, 500);
    return () => clearTimeout(t);
  }, [local, onChange, value]);

  const handleChange = useCallback((v: string) => setLocal(v), []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100 dark:border-gray-800">
        {label && <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setMode('edit')}
            className={`p-1.5 rounded text-xs flex items-center gap-1 ${mode === 'edit' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            aria-label="Edit mode"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`p-1.5 rounded text-xs flex items-center gap-1 ${mode === 'preview' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            aria-label="Preview mode"
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {mode === 'edit' ? (
          <textarea
            value={local}
            onChange={e => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[200px] p-3 text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none"
            aria-label={label ?? 'Notes editor'}
          />
        ) : (
          <div className="p-3">
            <MarkdownView content={local} />
          </div>
        )}
      </div>
    </div>
  );
}
