import type { NoteStatus } from '../../types';
import { NOTE_STATUS_LABELS } from '../../types';

interface NoteStatusSelectProps {
  value: NoteStatus;
  onChange: (s: NoteStatus) => void;
}

const STATUS_ICONS: Record<NoteStatus, string> = {
  not_started: '⬜',
  learning:    '🟡',
  revised:     '🔵',
  confident:   '🟢',
};

export default function NoteStatusSelect({ value, onChange }: NoteStatusSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Status:</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as NoteStatus)}
        className="text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Note status"
      >
        {(Object.keys(NOTE_STATUS_LABELS) as NoteStatus[]).map(s => (
          <option key={s} value={s}>
            {STATUS_ICONS[s]} {NOTE_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
