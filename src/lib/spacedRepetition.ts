import type { Confidence } from '../types';
import { addDays, nowISO } from './dateUtils';

const BASE_INTERVALS: Record<Confidence, number> = {
  1: 1,
  2: 1,
  3: 4,
  4: 14,
  5: 30,
};

/**
 * Compute nextReviewAt based on confidence and whether the review passed.
 * @param confidence  current confidence (1-5)
 * @param passed      true if the user successfully recalled; false if they failed
 * @param currentNext existing nextReviewAt ISO string (used for multiplier)
 */
export function computeNextReview(
  confidence: Confidence,
  passed: boolean,
  _currentNext?: string
): string {
  if (!passed) {
    // reset to 1-day interval
    return addDays(nowISO(), 1);
  }
  const base = BASE_INTERVALS[confidence];
  return addDays(nowISO(), base);
}

/**
 * After a successful review, extend interval by 1.5x.
 */
export function extendInterval(currentNextISO: string): string {
  const now = new Date();
  const next = new Date(currentNextISO);
  const days = Math.max(1, Math.round((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  return addDays(nowISO(), Math.round(days * 1.5));
}
