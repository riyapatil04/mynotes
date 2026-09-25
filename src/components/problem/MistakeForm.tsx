import { useState } from 'react';
import type { MistakeType } from '../../types';
import { MISTAKE_TYPE_LABELS } from '../../types';

interface MistakeFormProps {
  onSubmit: (type: MistakeType, description: string, fix: string) => void;
  onCancel: () => void;
}

export default function MistakeForm({ onSubmit, onCancel }: MistakeFormProps) {
  const [type, setType] = useState<MistakeType>('edge_case');
  const [description, setDescription] = useState('');
  const [fix, setFix] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) return;
    onSubmit(type, description.trim(), fix.trim());
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mistake Type
        </label>
        <select
          value={type}
          onChange={e => setType(e.target.value as MistakeType)}
          className="w-full input-base"
          aria-label="Mistake type"
        >
          {(Object.keys(MISTAKE_TYPE_LABELS) as MistakeType[]).map(t => (
            <option key={t} value={t}>{MISTAKE_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          What went wrong?
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe the mistake... (markdown supported)"
          className="w-full input-base font-mono text-sm resize-none"
          aria-label="Mistake description"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fix / What to remember next time
        </label>
        <textarea
          value={fix}
          onChange={e => setFix(e.target.value)}
          rows={3}
          placeholder="What should you do differently?... (markdown supported)"
          className="w-full input-base font-mono text-sm resize-none"
          aria-label="Mistake fix"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={handleSubmit} className="btn-primary" disabled={!description.trim()}>
          Log Mistake
        </button>
      </div>
    </div>
  );
}
