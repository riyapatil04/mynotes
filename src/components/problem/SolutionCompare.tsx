import type { Solution } from '../../types';
import { LANGUAGE_LABELS } from '../../types';
import { Star } from 'lucide-react';

interface SolutionCompareProps {
  solutions: Solution[];
}

export default function SolutionCompare({ solutions }: SolutionCompareProps) {
  const show = solutions.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Complexity Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Approach</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Language</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Time</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Space</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Final?</th>
            </tr>
          </thead>
          <tbody>
            {show.map(s => (
              <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{s.label}</td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{LANGUAGE_LABELS[s.language]}</td>
                <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">{s.timeComplexity || '—'}</td>
                <td className="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300">{s.spaceComplexity || '—'}</td>
                <td className="px-3 py-2">
                  {s.isFinal && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Code side-by-side */}
      <div className={`grid gap-3 ${show.length === 2 ? 'grid-cols-2' : show.length >= 3 ? 'grid-cols-3' : 'grid-cols-1'}`}>
        {show.map(s => (
          <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.label}</span>
              <span className="text-xs text-gray-400">{LANGUAGE_LABELS[s.language]}</span>
            </div>
            <pre className="p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-64 bg-white dark:bg-gray-900 whitespace-pre-wrap">
              {s.code || '// No code yet'}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
