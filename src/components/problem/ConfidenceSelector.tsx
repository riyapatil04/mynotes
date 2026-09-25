import type { Confidence } from '../../types';
import { CONFIDENCE_LABELS } from '../../types';

interface ConfidenceSelectorProps {
  value: Confidence;
  onChange: (c: Confidence) => void;
}

const COLORS: Record<Confidence, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-blue-500',
  5: 'bg-green-500',
};

export default function ConfidenceSelector({ value, onChange }: ConfidenceSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Confidence:</span>
      <div className="flex gap-1">
        {([1, 2, 3, 4, 5] as Confidence[]).map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={CONFIDENCE_LABELS[c]}
            aria-label={`Set confidence to ${c}: ${CONFIDENCE_LABELS[c]}`}
            className={`w-6 h-6 rounded-full text-xs font-bold text-white transition-all ${
              value === c ? `${COLORS[c]} ring-2 ring-offset-1 ring-current scale-110` : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
        {CONFIDENCE_LABELS[value]}
      </span>
    </div>
  );
}
