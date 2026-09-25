import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import ProblemHeader from '../components/problem/ProblemHeader';
import SolutionTabs from '../components/problem/SolutionTabs';
import MistakeLog from '../components/problem/MistakeLog';
import NotesEditor from '../components/problem/NotesEditor';
import EmptyState from '../components/common/EmptyState';

type LeftTab = 'problem' | 'notes' | 'explain';
type RightTab = 'solutions' | 'mistakes';

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    problems, solutions, mistakes,
    loadProblem, updateProblem,
    addMistake, deleteMistake,
  } = useProblemStore();
  const [leftTab, setLeftTab] = useState<LeftTab>('notes');
  const [rightTab, setRightTab] = useState<RightTab>('solutions');

  const problem = problems.find(p => p.id === id);

  useEffect(() => {
    if (id) loadProblem(id);
  }, [id, loadProblem]);

  if (!problem) {
    return (
      <EmptyState
        icon="🔍"
        title="Problem not found"
        description="It may have been deleted."
        action={<button onClick={() => navigate('/')} className="btn-primary">Go to Dashboard</button>}
      />
    );
  }

  const problemSolutions = solutions[problem.id] ?? [];
  const problemMistakes  = mistakes[problem.id]  ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ProblemHeader problem={problem} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            {([
              { key: 'problem', label: 'Problem' },
              { key: 'notes',   label: 'Notes' },
              { key: 'explain', label: 'Explain It' },
            ] as { key: LeftTab; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setLeftTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  leftTab === tab.key
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {leftTab === 'problem' && (
              <div className="h-full overflow-auto p-4">
                <NotesEditor
                  value={problem.description}
                  onChange={val => updateProblem(problem.id, { description: val })}
                  placeholder="Paste or write the problem statement here... (Markdown supported)"
                  label="Problem Statement"
                />
              </div>
            )}
            {leftTab === 'notes' && (
              <NotesEditor
                value={problem.notes}
                onChange={val => updateProblem(problem.id, { notes: val })}
                placeholder="Write your notes, key observations, approach... (Markdown)"
                label="Personal Notes"
              />
            )}
            {leftTab === 'explain' && (
              <NotesEditor
                value={problem.explainIt}
                onChange={val => updateProblem(problem.id, { explainIt: val })}
                placeholder="How would you explain this to an interviewer in 30 seconds? (Markdown)"
                label="Explain It (30s pitch)"
              />
            )}
          </div>
        </div>

        {/* Right pane */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            {([
              { key: 'solutions', label: `Solutions (${problemSolutions.length})` },
              { key: 'mistakes',  label: `Mistakes (${problemMistakes.length})` },
            ] as { key: RightTab; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setRightTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  rightTab === tab.key
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {rightTab === 'solutions' && (
              <SolutionTabs problemId={problem.id} solutions={problemSolutions} />
            )}
            {rightTab === 'mistakes' && (
              <MistakeLog
                itemId={problem.id}
                itemType="problem"
                mistakes={problemMistakes}
                onAdd={async (type, desc, fix) => { await addMistake(problem.id, type, desc, fix); }}
                onDelete={(mid) => deleteMistake(mid, problem.id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
