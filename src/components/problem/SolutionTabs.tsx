import { useState } from 'react';
import { Plus, Trash2, Copy, Star, BarChart2 } from 'lucide-react';
import type { Solution, SolutionLabel, ProgrammingLanguage } from '../../types';
import { useProblemStore } from '../../store/problemStore';
import SolutionEditor from './SolutionEditor';
import SolutionCompare from './SolutionCompare';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';

interface SolutionTabsProps {
  problemId: string;
  solutions: Solution[];
}

const PRESET_LABELS: SolutionLabel[] = ['Brute Force', 'Better', 'Optimal', 'Alternative'];

export default function SolutionTabs({ problemId, solutions }: SolutionTabsProps) {
  const { addSolution, deleteSolution, duplicateSolution, updateSolution } = useProblemStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [newLabel, setNewLabel] = useState<SolutionLabel>('Brute Force');
  const [customLabel, setCustomLabel] = useState('');
  const [newLang, setNewLang] = useState<ProgrammingLanguage>('java');

  const sorted = [...solutions].sort((a, b) => a.order - b.order);
  const active = sorted[Math.min(activeIdx, sorted.length - 1)];

  const handleAdd = async () => {
    const label = newLabel === 'Alternative' && customLabel.trim() ? customLabel.trim() : newLabel;
    await addSolution(problemId, label, newLang);
    setActiveIdx(sorted.length); // switch to new tab
    setShowAdd(false);
    setCustomLabel('');
  };

  const handleDelete = async (sol: Solution) => {
    if (!confirm(`Delete solution "${sol.label}"?`)) return;
    await deleteSolution(sol.id, problemId);
    setActiveIdx(Math.max(0, activeIdx - 1));
  };

  const handleDuplicate = async (id: string) => {
    await duplicateSolution(id);
    setActiveIdx(sorted.length);
  };

  const handleMarkFinal = async (id: string) => {
    // unmark all, then mark this one
    await Promise.all(sorted.map(s => updateSolution(s.id, { isFinal: s.id === id })));
  };

  if (sorted.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <EmptyState
          icon="💡"
          title="No solutions yet"
          description="Add your first solution — start with Brute Force."
          action={
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              + Add Solution
            </button>
          }
        />
        <AddModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          newLabel={newLabel}
          setNewLabel={setNewLabel}
          customLabel={customLabel}
          setCustomLabel={setCustomLabel}
          newLang={newLang}
          setNewLang={setNewLang}
          onAdd={handleAdd}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto shrink-0">
        {sorted.map((sol, i) => (
          <div key={sol.id} className="flex items-center shrink-0">
            <button
              onClick={() => setActiveIdx(i)}
              className={`group flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                i === Math.min(activeIdx, sorted.length - 1)
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {sol.isFinal && <Star size={10} className="text-yellow-500 fill-yellow-500" />}
              {sol.label}
            </button>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto px-2 shrink-0">
          {sorted.length >= 2 && (
            <button
              onClick={() => setShowCompare(true)}
              title="Compare solutions"
              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              aria-label="Compare solutions"
            >
              <BarChart2 size={14} />
            </button>
          )}
          {active && (
            <>
              <button
                onClick={() => handleDuplicate(active.id)}
                title="Duplicate solution"
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                aria-label="Duplicate solution"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => handleMarkFinal(active.id)}
                title="Mark as interview solution"
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${active.isFinal ? 'text-yellow-500' : 'text-gray-400'}`}
                aria-label="Mark as final interview solution"
              >
                <Star size={14} className={active.isFinal ? 'fill-yellow-500' : ''} />
              </button>
              <button
                onClick={() => handleDelete(active)}
                title="Delete solution"
                className="p-1.5 text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                aria-label="Delete solution"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
            title="Add solution"
            aria-label="Add solution"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {active && <SolutionEditor key={active.id} solution={active} />}
      </div>

      {/* Modals */}
      <AddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        newLabel={newLabel}
        setNewLabel={setNewLabel}
        customLabel={customLabel}
        setCustomLabel={setCustomLabel}
        newLang={newLang}
        setNewLang={setNewLang}
        onAdd={handleAdd}
      />

      <Modal open={showCompare} onClose={() => setShowCompare(false)} title="Compare Solutions" size="xl">
        <SolutionCompare solutions={sorted} />
      </Modal>
    </div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────

interface AddModalProps {
  open: boolean;
  onClose: () => void;
  newLabel: SolutionLabel;
  setNewLabel: (l: SolutionLabel) => void;
  customLabel: string;
  setCustomLabel: (s: string) => void;
  newLang: ProgrammingLanguage;
  setNewLang: (l: ProgrammingLanguage) => void;
  onAdd: () => void;
}

function AddModal({ open, onClose, newLabel, setNewLabel, customLabel, setCustomLabel, newLang, setNewLang, onAdd }: AddModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Add Solution">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
          <select value={newLabel} onChange={e => setNewLabel(e.target.value as SolutionLabel)} className="w-full input-base" aria-label="Solution label">
            {PRESET_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
            <option value="custom">Custom...</option>
          </select>
          {(newLabel === 'Alternative' || newLabel === 'custom') && (
            <input
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
              placeholder="Custom label"
              className="mt-2 w-full input-base"
              aria-label="Custom solution label"
            />
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
          <select value={newLang} onChange={e => setNewLang(e.target.value as ProgrammingLanguage)} className="w-full input-base" aria-label="Programming language">
            {(['java','python','sql','cpp','javascript','typescript','c','csharp','go','rust','kotlin','scala','plaintext'] as ProgrammingLanguage[]).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onAdd} className="btn-primary">Add</button>
        </div>
      </div>
    </Modal>
  );
}
