import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import { DifficultyBadge, StatusBadge } from '../components/common/Badge';

export default function PatternsPage() {
  const { problems } = useProblemStore();

  const patternGroups = useMemo(() => {
    const groups: Record<string, typeof problems> = {};
    for (const p of problems) {
      for (const pat of p.patterns) {
        if (!groups[pat]) groups[pat] = [];
        groups[pat].push(p);
      }
    }
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [problems]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        🧩 Pattern Library
      </h1>

      {patternGroups.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">No patterns yet. Add patterns to your problems.</p>
      )}

      <div className="space-y-6">
        {patternGroups.map(([pattern, probs]) => {
          const avgConf = probs.reduce((s, p) => s + p.confidence, 0) / probs.length;
          const solved = probs.filter(p => p.status === 'solved').length;

          return (
            <section key={pattern}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{pattern}</h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {probs.length} problems · {solved} solved · avg confidence {avgConf.toFixed(1)}
                </span>
              </div>
              <div className="space-y-2">
                {probs.map(p => (
                  <Link
                    key={p.id}
                    to={`/problem/${p.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{p.title}</span>
                    <DifficultyBadge difficulty={p.difficulty} />
                    <StatusBadge status={p.status} />
                    <span className="text-xs text-gray-400">conf: {p.confidence}/5</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
