/**
 * Completion Metrics Calculator
 *
 * Functions to calculate completion metrics for different goal types
 * at the time of goal completion.
 */

import {
  isHabitGoal,
  isMilestoneGoal,
  isQuantitativeGoal,
  isRecurringGoal,
  type Goal,
  type ProgressEntry,
} from '@/types/goal.types';

import type {
  GoalCompletionMetrics,
  QuantitativeMetrics,
  MilestoneMetrics,
  HabitMetrics,
  RecurringMetrics,
  CompletionMetrics,
} from '../types/completion';

/**
 * Calculate completion metrics for a goal
 */
export function calculateCompletionMetrics(goal: Goal, history: ProgressEntry[]): GoalCompletionMetrics {
  if (isQuantitativeGoal(goal)) {
    return calculateQuantitativeMetrics(goal, history);
  }
  if (isMilestoneGoal(goal)) {
    return calculateMilestoneMetrics(goal);
  }
  if (isHabitGoal(goal)) {
    return calculateHabitMetrics(goal);
  }
  if (isRecurringGoal(goal)) {
    return calculateRecurringMetrics(goal);
  }

  // Default base metrics for qualitative/binary
  return calculateBaseMetrics(goal, history);
}

/**
 * Calculate base metrics shared by all goal types
 */
function calculateBaseMetrics(goal: Goal, history: ProgressEntry[]): CompletionMetrics {
  const totalTime = new Date().getTime() - new Date(goal.createdAt).getTime();
  const totalUpdates = history.length;

  const averageProgressRate = totalTime > 0 ? goal.progress / (totalTime / (1000 * 60 * 60 * 24)) : 0;

  return {
    totalTime,
    totalUpdates,
    averageProgressRate,
    calculatedAt: Date.now(),
    version: '1.0',
  };
}

/**
 * Calculate metrics for quantitative goals
 */
function calculateQuantitativeMetrics(goal: Goal, history: ProgressEntry[]): QuantitativeMetrics {
  const base = calculateBaseMetrics(goal, history);

  const progressVelocity = base.totalTime > 0 ? goal.progress / (base.totalTime / (1000 * 60 * 60 * 24)) : 0;

  const overshootPercentage =
    isQuantitativeGoal(goal) && goal.targetValue > 0
      ? ((goal.currentValue - goal.targetValue) / goal.targetValue) * 100
      : 0;

  const updateFrequency =
    base.totalUpdates > 0 && base.totalTime > 0
      ? base.totalUpdates / (base.totalTime / (1000 * 60 * 60 * 24 * 7)) // updates per week
      : 0;

  return {
    ...base,
    progressVelocity,
    overshootPercentage,
    updateFrequency,
  };
}

/**
 * Calculate metrics for milestone goals
 */
function calculateMilestoneMetrics(goal: Goal): MilestoneMetrics {
  const base = calculateBaseMetrics(goal, goal.progressHistory || []);

  if (!isMilestoneGoal(goal) || !goal.milestones) {
    return {
      ...base,
      completionOrder: [],
      timePerMilestone: [],
      milestoneEfficiency: 0,
    };
  }

  const completedMilestones = goal.milestones
    .filter((m) => m.status === 'completed')
    .sort((a, b) => {
      const aDate = a.completedDate ? new Date(a.completedDate).getTime() : 0;
      const bDate = b.completedDate ? new Date(b.completedDate).getTime() : 0;
      return aDate - bDate;
    });

  const completionOrder = completedMilestones.map((m) => m.order);

  const timePerMilestone: number[] = [];
  let prevTime = new Date(goal.createdAt).getTime();

  for (const milestone of completedMilestones) {
    if (milestone.completedDate) {
      const currTime = new Date(milestone.completedDate).getTime();
      timePerMilestone.push(currTime - prevTime);
      prevTime = currTime;
    }
  }

  const milestoneEfficiency =
    completedMilestones.length > 0 ? (completedMilestones.length / goal.milestones.length) * 100 : 0;

  return {
    ...base,
    completionOrder,
    timePerMilestone,
    milestoneEfficiency,
  };
}

/**
 * Calculate metrics for habit goals
 */
function calculateHabitMetrics(goal: Goal): HabitMetrics {
  const base = calculateBaseMetrics(goal, goal.progressHistory || []);

  if (!isHabitGoal(goal)) {
    return {
      ...base,
      longestStreak: 0,
      completionConsistency: 0,
      dailyCompletionRate: 0,
    };
  }

  const longestStreak = goal.completionStats?.streak?.longest || 0;
  const completionConsistency = goal.completionStats?.completionRate || 0;
  const dailyCompletionRate =
    goal.completionStats?.completedOccurrences && goal.completionStats.totalOccurrences > 0
      ? (goal.completionStats.completedOccurrences / goal.completionStats.totalOccurrences) * 100
      : 0;

  return {
    ...base,
    longestStreak,
    completionConsistency,
    dailyCompletionRate,
  };
}

/**
 * Calculate metrics for recurring goals
 */
function calculateRecurringMetrics(goal: Goal): RecurringMetrics {
  const base = calculateBaseMetrics(goal, goal.progressHistory || []);

  if (!isRecurringGoal(goal)) {
    return {
      ...base,
      occurrenceCompletionRate: 0,
      onTimeCompletionPercentage: 0,
      patternAdherence: 0,
    };
  }

  const occurrenceCompletionRate = goal.completionStats?.completionRate || 0;
  const onTimeCompletionPercentage =
    goal.completionStats?.completedOccurrences && goal.completionStats.totalOccurrences > 0
      ? (goal.completionStats.completedOccurrences / goal.completionStats.totalOccurrences) * 100
      : 0;

  const patternAdherence = 100;

  return {
    ...base,
    occurrenceCompletionRate,
    onTimeCompletionPercentage,
    patternAdherence,
  };
}

/**
 * Format metrics for display
 */
export function formatMetricsForDisplay(metrics: GoalCompletionMetrics): Record<string, string> {
  const formatted: Record<string, string> = {};

  formatted['Total Time'] = formatDuration(metrics.totalTime);
  formatted['Total Updates'] = `${metrics.totalUpdates} progress updates`;
  formatted['Avg. Progress/Day'] = `${metrics.averageProgressRate.toFixed(2)}%`;

  if ('progressVelocity' in metrics) {
    formatted['Progress Velocity'] = `${metrics.progressVelocity.toFixed(2)}%/day`;
    if (metrics.overshootPercentage > 0) {
      formatted['Overshoot'] = `+${metrics.overshootPercentage.toFixed(1)}%`;
    }
  }

  if ('milestoneEfficiency' in metrics) {
    formatted['Milestone Efficiency'] = `${metrics.milestoneEfficiency.toFixed(0)}%`;
    formatted['Milestones Completed'] = `${metrics.completionOrder.length}`;
  }

  if ('longestStreak' in metrics) {
    formatted['Longest Streak'] = `${metrics.longestStreak} days`;
    formatted['Completion Rate'] = `${metrics.dailyCompletionRate.toFixed(0)}%`;
  }

  if ('occurrenceCompletionRate' in metrics) {
    formatted['Occurrence Rate'] = `${metrics.occurrenceCompletionRate.toFixed(0)}%`;
    formatted['On-time Rate'] = `${metrics.onTimeCompletionPercentage.toFixed(0)}%`;
  }

  return formatted;
}

function formatDuration(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} days, ${hours} hours`;
  }
  return `${hours} hours`;
}
