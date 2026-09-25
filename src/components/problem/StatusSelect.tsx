import type { ProblemStatus } from '../../types';
import { STATUS_LABELS } from '../../types';

interface StatusSelectProps {
  value: ProblemStatus;
  onChange: (s: ProblemStatus) => void;
}

const STATUS_ICONS: Record<ProblemStatus, string> = {
  not_started: '⬜',
  attempted: '🟡',
  couldnt_solve: '🔴',
  solved: '🟢',
  needs_revision: '🔵',
};

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Status:</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as ProblemStatus)}
        className="text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Problem status"
      >
        {(Object.keys(STATUS_LABELS) as ProblemStatus[]).map(s => (
          <option key={s} value={s}>
            {STATUS_ICONS[s]} {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
