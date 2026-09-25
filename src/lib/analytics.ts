import type { Mistake, Problem, Topic, Subject } from '../types';

export interface MistakeStats {
  typeDistribution: { type: string; count: number; label: string }[];
  topProblems: { problemId: string; title: string; count: number }[];
  insight: string;
}

export function computeMistakeStats(
  mistakes: Mistake[],
  problems: Problem[]
): MistakeStats {
  // type distribution
  const typeCounts: Record<string, number> = {};
  for (const m of mistakes) {
    typeCounts[m.type] = (typeCounts[m.type] ?? 0) + 1;
  }

  const TYPE_LABELS: Record<string, string> = {
    didnt_know_pattern: "Didn't Know Pattern",
    edge_case: 'Edge Case',
    off_by_one: 'Off By One',
    wrong_complexity: 'Wrong Complexity',
    syntax_error: 'Syntax Error',
    misread_question: 'Misread Question',
    logic_error: 'Logic Error',
    forgot_concept: 'Forgot Concept',
    other: 'Other',
  };

  const typeDistribution = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count, label: TYPE_LABELS[type] ?? type }))
    .sort((a, b) => b.count - a.count);

  // top problems
  const problemCounts: Record<string, number> = {};
  for (const m of mistakes) {
    problemCounts[m.problemId] = (problemCounts[m.problemId] ?? 0) + 1;
  }
  const topProblems = Object.entries(problemCounts)
    .map(([problemId, count]) => ({
      problemId,
      title: problems.find(p => p.id === problemId)?.title ?? 'Unknown',
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // insight
  const top = typeDistribution[0];
  let insight = 'Keep logging mistakes to get personalised insights.';
  if (top) {
    const focusMap: Record<string, string> = {
      edge_case: 'testing boundary inputs before finalizing your solution',
      off_by_one: 'carefully checking your loop bounds and index arithmetic',
      didnt_know_pattern: 'spending extra time studying common algorithmic patterns',
      logic_error: 'tracing through small examples before coding',
      wrong_complexity: 'analyzing time/space complexity for each approach',
      misread_question: 'reading the question twice and highlighting constraints',
      syntax_error: 'practising in your target language more regularly',
      forgot_concept: 'reviewing theoretical concepts (DBMS, OS, CN) weekly',
    };
    const focus = focusMap[top.type] ?? 'reviewing your weak areas';
    insight = `Your most common mistake is "${top.label}" (${top.count}×). Focus on ${focus}.`;
  }

  return { typeDistribution, topProblems, insight };
}

export interface WeakArea {
  subject: Subject;
  topic: Topic;
  score: number; // lower is weaker
  avgConfidence: number;
  mistakeCount: number;
  problemCount: number;
}

export function computeWeakAreas(
  subjects: Subject[],
  topics: Topic[],
  problems: Problem[],
  mistakes: Mistake[]
): WeakArea[] {
  const result: WeakArea[] = [];

  for (const topic of topics) {
    const topicProblems = problems.filter(p => p.topicId === topic.id);
    if (topicProblems.length === 0) continue;

    const avgConfidence =
      topicProblems.reduce((s, p) => s + p.confidence, 0) / topicProblems.length;

    const mistakeCount = mistakes.filter(m =>
      topicProblems.some(p => p.id === m.problemId)
    ).length;

    const subject = subjects.find(s => s.id === topic.subjectId);
    if (!subject) continue;

    // score: lower is weaker. Penalise low confidence + high mistakes
    const score = avgConfidence - mistakeCount * 0.3;

    result.push({ subject, topic, score, avgConfidence, mistakeCount, problemCount: topicProblems.length });
  }

  return result.sort((a, b) => a.score - b.score);
}

export function computeStreak(activityDates: string[]): { current: number; longest: number } {
  if (activityDates.length === 0) return { current: 0, longest: 0 };

  const unique = [...new Set(activityDates)].sort();
  let longest = 1;
  let current = 1;
  let temp = 1;

  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      temp++;
      if (temp > longest) longest = temp;
    } else {
      temp = 1;
    }
  }

  // Current streak: check if the last activity was today or yesterday
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const last = unique[unique.length - 1];
  if (last !== today && last !== yesterday) current = 0;
  else {
    current = temp;
  }

  return { current, longest };
}
