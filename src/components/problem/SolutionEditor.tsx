import { useState, useCallback, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSettingsStore } from '../../store/settingsStore';
import { useProblemStore } from '../../store/problemStore';
import type { ProgrammingLanguage, Solution } from '../../types';
import { LANGUAGE_LABELS } from '../../types';
import NotesEditor from './NotesEditor';

interface SolutionEditorProps {
  solution: Solution;
}

const LANGUAGES: ProgrammingLanguage[] = [
  'java', 'python', 'sql', 'cpp', 'javascript', 'typescript',
  'c', 'csharp', 'go', 'rust', 'kotlin', 'scala', 'plaintext',
];

// Map our language IDs to Monaco language IDs
const MONACO_LANG: Record<ProgrammingLanguage, string> = {
  java: 'java',
  python: 'python',
  sql: 'sql',
  cpp: 'cpp',
  javascript: 'javascript',
  typescript: 'typescript',
  c: 'c',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  kotlin: 'kotlin',
  scala: 'scala',
  plaintext: 'plaintext',
};

export default function SolutionEditor({ solution }: SolutionEditorProps) {
  const { settings } = useSettingsStore();
  const { updateSolution } = useProblemStore();
  const [saved, setSaved] = useState(true);
  const [localCode, setLocalCode] = useState(solution.code);
  const [tab, setTab] = useState<'code' | 'explanation'>('code');

  // Sync when solution changes (e.g. switching tabs)
  useEffect(() => { setLocalCode(solution.code); }, [solution.id, solution.code]);

  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Debounced code save
  useEffect(() => {
    setSaved(false);
    const t = setTimeout(async () => {
      await updateSolution(solution.id, { code: localCode });
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [localCode, solution.id, updateSolution]);

  const handleUpdate = useCallback((field: Partial<Solution>) => {
    updateSolution(solution.id, field);
  }, [solution.id, updateSolution]);

  return (
    <div className="flex flex-col h-full">
      {/* Solution metadata bar */}
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        {/* Language */}
        <select
          value={solution.language}
          onChange={e => handleUpdate({ language: e.target.value as ProgrammingLanguage })}
          className="text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1"
          aria-label="Programming language"
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>
          ))}
        </select>

        {/* Time complexity */}
        <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          Time:
          <input
            value={solution.timeComplexity}
            onChange={e => handleUpdate({ timeComplexity: e.target.value })}
            placeholder="O(n)"
            className="w-20 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs"
            aria-label="Time complexity"
          />
        </label>

        {/* Space complexity */}
        <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          Space:
          <input
            value={solution.spaceComplexity}
            onChange={e => handleUpdate({ spaceComplexity: e.target.value })}
            placeholder="O(1)"
            className="w-20 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs"
            aria-label="Space complexity"
          />
        </label>

        {/* Final toggle */}
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={solution.isFinal}
            onChange={e => handleUpdate({ isFinal: e.target.checked })}
            className="rounded"
          />
          Interview solution
        </label>

        {/* Saved indicator */}
        <span className={`text-xs ${saved ? 'text-green-500' : 'text-gray-400'}`}>
          {saved ? '✓ Saved' : 'Saving...'}
        </span>
      </div>

      {/* Tabs: Code | Explanation */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        {(['code', 'explanation'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'code' ? (
          <MonacoEditor
            height="100%"
            language={MONACO_LANG[solution.language]}
            value={localCode}
            theme={isDark ? 'vs-dark' : 'vs'}
            onChange={v => setLocalCode(v ?? '')}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              padding: { top: 8 },
              automaticLayout: true,
            }}
          />
        ) : (
          <NotesEditor
            value={solution.explanation}
            onChange={val => handleUpdate({ explanation: val })}
            placeholder="Explain your approach... (Markdown supported)"
            label="Solution Explanation"
          />
        )}
      </div>
    </div>
  );
}
