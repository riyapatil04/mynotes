import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useRoadmapStore } from '../store/roadmapStore';
import { useProblemStore } from '../store/problemStore';
import { useNoteStore } from '../store/noteStore';
import { useSettingsStore } from '../store/settingsStore';
import { computeMistakeStats, computeWeakAreas, computeStreak } from '../lib/analytics';
import { daysUntil } from '../lib/dateUtils';
import { mistakeRepo, activityRepo } from '../db/repositories';
import type { ActivityLog, Mistake } from '../types';
import { DifficultyBadge } from '../components/common/Badge';

const MISTAKE_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899'];

export default function Dashboard() {
  const { subjects, topics } = useRoadmapStore();
  const { problems, getDueForReview: getProblemsDue } = useProblemStore();
  const { notes, getDueForReview: getNotesDue } = useNoteStore();
  const { settings } = useSettingsStore();

  const [allMistakes, setAllMistakes] = useState<Mistake[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    mistakeRepo.getAll().then(setAllMistakes).catch(console.error);
    activityRepo.getAll().then(setActivityLogs).catch(console.error);
  }, []);

  // ── Unified item counts (problems + notes treated equally) ───
  const totalItems  = problems.length + notes.length;
  const doneItems   = problems.filter(p => p.status === 'solved').length
                    + notes.filter(n => n.status === 'confident').length;

  // ── Revision queues ──────────────────────────────────────────
  const dueProblems = getProblemsDue().slice(0, 5);
  const dueNotes    = getNotesDue().slice(0, 5);
  const dueAll      = [...dueProblems, ...dueNotes].slice(0, 10);

  const needsRevisionProblems = problems.filter(p => p.status === 'needs_revision').slice(0, 10);

  // ── Stats ────────────────────────────────────────────────────
  const mistakeStats = useMemo(() => computeMistakeStats(allMistakes, problems), [allMistakes, problems]);
  const weakAreas    = useMemo(() => computeWeakAreas(subjects, topics, problems, allMistakes).slice(0, 5), [subjects, topics, problems, allMistakes]);
  const streak       = useMemo(() => computeStreak(activityLogs.map(a => a.date)), [activityLogs]);

  // ── Placement countdown ──────────────────────────────────────
  const daysLeft   = settings.placementDate ? daysUntil(settings.placementDate) : null;
  const remaining  = totalItems - doneItems;
  const perDay     = daysLeft && daysLeft > 0 ? (remaining / daysLeft).toFixed(1) : null;

  // ── Per-subject progress (problems + notes combined) ─────────
  const subjectProgress = subjects.map(s => {
    const sProblems = problems.filter(p => p.subjectId === s.id);
    const sNotes    = notes.filter(n => n.subjectId === s.id);
    const total     = sProblems.length + sNotes.length;
    const done      = sProblems.filter(p => p.status === 'solved').length
                    + sNotes.filter(n => n.status === 'confident').length;
    return { subject: s, total, done };
  });

  // ── Heatmap ──────────────────────────────────────────────────
  const heatmap = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of activityLogs) counts[a.date] = (counts[a.date] ?? 0) + 1;
    const today = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const s = d.toISOString().slice(0, 10);
      days.push({ date: s, count: counts[s] ?? 0 });
    }
    return days;
  }, [activityLogs]);

  function heatColor(count: number) {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-500';
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto overflow-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Items',    value: totalItems },
          { label: 'Done',           value: doneItems,      color: 'text-green-600 dark:text-green-400' },
          { label: 'Due for Review', value: dueAll.length,  color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Streak',         value: `${streak.current}d`, color: 'text-yellow-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color ?? 'text-gray-900 dark:text-gray-100'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Placement countdown */}
      {daysLeft !== null && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
          <h2 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
            🗓️ {daysLeft > 0 ? `${daysLeft} days to placement` : 'Placement day is here!'}
          </h2>
          {perDay && (
            <p className="text-sm text-indigo-700 dark:text-indigo-400">
              You need to complete ~<strong>{perDay}</strong> items/day to finish all {remaining} remaining items.
            </p>
          )}
        </div>
      )}

      {/* Subject progress */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Subject Progress</h2>
        <div className="space-y-3">
          {subjectProgress.map(({ subject, total, done }) => (
            <Link key={subject.id} to={`/subject/${subject.id}`} className="block">
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {subject.icon} {subject.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{done}/{total}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%', backgroundColor: subject.color }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Review queue + Needs revision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">📅 Due for Review</h2>
          {dueAll.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Nothing due — great job staying on top of it!</p>
          ) : (
            <ul className="space-y-2">
              {dueProblems.map(p => (
                <li key={p.id}>
                  <Link to={`/problem/${p.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-sm">
                    <span className="text-xs text-gray-400">&lt;/&gt;</span>
                    <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">{p.title}</span>
                    <DifficultyBadge difficulty={p.difficulty} />
                  </Link>
                </li>
              ))}
              {dueNotes.map(n => (
                <li key={n.id}>
                  <Link to={`/note/${n.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-gray-900 hover:border-amber-400 transition-colors text-sm">
                    <span className="text-xs text-amber-500">📝</span>
                    <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">{n.title}</span>
                    <span className="text-xs text-gray-400">conf: {n.confidence}/5</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">🔵 Needs Revision</h2>
          {needsRevisionProblems.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No problems marked for revision.</p>
          ) : (
            <ul className="space-y-2">
              {needsRevisionProblems.map(p => (
                <li key={p.id}>
                  <Link to={`/problem/${p.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 hover:border-blue-400 transition-colors text-sm">
                    <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">{p.title}</span>
                    <DifficultyBadge difficulty={p.difficulty} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Heatmap */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Activity Heatmap</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            🔥 Current: <strong>{streak.current}d</strong> | Longest: <strong>{streak.longest}d</strong>
          </span>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap gap-1">
            {heatmap.map(d => (
              <div key={d.date} title={`${d.date}: ${d.count} activities`} className={`w-3 h-3 rounded-sm ${heatColor(d.count)}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Mistake analytics */}
      {allMistakes.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Mistake Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By Type</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mistakeStats.typeDistribution}
                    dataKey="count"
                    nameKey="label"
                    cx="50%" cy="50%"
                    outerRadius={70}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ''} (${(((percent ?? 0)) * 100).toFixed(0)}%)`}
                  >
                    {mistakeStats.typeDistribution.map((_, i) => (
                      <Cell key={i} fill={MISTAKE_COLORS[i % MISTAKE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Items with Mistakes</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mistakeStats.topProblems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 italic">{mistakeStats.insight}</p>
            </div>
          </div>
        </section>
      )}

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">⚠️ Weak Areas</h2>
          <div className="space-y-2">
            {weakAreas.map(w => (
              <Link key={w.topic.id} to={`/subject/${w.subject.id}/topic/${w.topic.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">
                  {w.subject.icon} {w.subject.name} › {w.topic.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Avg confidence: {w.avgConfidence.toFixed(1)} | Mistakes: {w.mistakeCount}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
