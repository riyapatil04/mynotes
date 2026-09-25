import type { Difficulty, ProblemStatus } from '../../types';
import { DIFFICULTY_COLORS, STATUS_LABELS } from '../../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[difficulty]} ${className}`}>
      {difficulty}
    </span>
  );
}

interface StatusBadgeProps {
  status: ProblemStatus;
  className?: string;
}

const STATUS_BG: Record<ProblemStatus, string> = {
  not_started:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  attempted:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  couldnt_solve:  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  solved:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  needs_revision: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BG[status]} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

interface PatternChipProps {
  label: string;
  onRemove?: () => void;
}

export function PatternChip({ label, onRemove }: PatternChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-indigo-900 dark:hover:text-indigo-200 ml-0.5" aria-label={`Remove ${label}`}>×</button>
      )}
    </span>
  );
}
