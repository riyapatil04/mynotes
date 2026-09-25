import { useEffect, useState } from 'react';
import { flashcardRepo } from '../db/repositories';
import type { Flashcard, Confidence } from '../types';
import { useRoadmapStore } from '../store/roadmapStore';
import { computeNextReview } from '../lib/spacedRepetition';
import { nowISO } from '../lib/dateUtils';
import EmptyState from '../components/common/EmptyState';

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const { subjects } = useRoadmapStore();
  const [filterSubject, setFilterSubject] = useState<string>('all');

  useEffect(() => {
    flashcardRepo.getDueForReview().then(c => {
      setCards(c);
      setIdx(0);
      setFlipped(false);
      setDone(false);
    }).catch(console.error);
  }, [filterSubject]);

  const filtered = filterSubject === 'all' ? cards : cards.filter(c => c.subjectId === filterSubject);
  const card = filtered[idx];

  const rate = async (confidence: Confidence, passed: boolean) => {
    if (!card) return;
    const nextReviewAt = computeNextReview(confidence, passed, card.nextReviewAt);
    const updated: Flashcard = { ...card, confidence, nextReviewAt, updatedAt: nowISO() };
    await flashcardRepo.upsert(updated);
    setFlipped(false);
    if (idx + 1 >= filtered.length) setDone(true);
    else setIdx(i => i + 1);
  };

  if (filtered.length === 0 && !done) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">📚 Flashcards</h1>
        <EmptyState
          icon="🃏"
          title="No flashcards due"
          description="All caught up! Check back later or seed the default data."
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">📚 Flashcards</h1>
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Session complete!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          You reviewed {filtered.length} flashcard{filtered.length !== 1 ? 's' : ''}.
        </p>
        <button onClick={() => { setDone(false); setIdx(0); }} className="mt-4 btn-primary">
          Review Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📚 Flashcards</h1>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="input-base text-sm"
          aria-label="Filter by subject"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-right">
        {idx + 1} / {filtered.length}
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer h-64 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center p-8 text-center shadow-sm hover:shadow-md transition-shadow"
        onClick={() => setFlipped(f => !f)}
        role="button"
        aria-label={flipped ? 'Card answer (click to flip back)' : 'Card question (click to reveal answer)'}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setFlipped(f => !f); }}
      >
        {!flipped ? (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">Question</p>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{card?.question}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Click to reveal answer</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-green-500 dark:text-green-400 mb-3 uppercase tracking-wide">Answer</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{card?.answer}</p>
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">How well did you know this?</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => rate(1, false)} className="py-2 rounded-lg border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              😵 Forgot
            </button>
            <button onClick={() => rate(3, true)} className="py-2 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 text-sm font-medium hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
              🤔 Recalled with effort
            </button>
            <button onClick={() => rate(5, true)} className="py-2 rounded-lg border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
              😄 Easy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
