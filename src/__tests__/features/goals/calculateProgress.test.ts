/**
 * Progress Calculation Unit Tests
 *
 * Tests for progress calculation utilities covering all business rules (BR-009 to BR-015)
 */

import { describe, expect, it } from 'vitest';

import { GoalType, GoalStatus, Priority, QualitativeStatus } from '@/features/goals/types';
import type {
  QuantitativeGoal,
  QualitativeGoal,
  BinaryGoal,
  MilestoneGoal,
  RecurringGoal,
  HabitGoal,
  Goal,
} from '@/features/goals/types';
import {
  calculateProgress,
  calculateQuantitativeProgress,
  calculateBinaryProgress,
  calculateQualitativeProgress,
  calculateMilestoneProgress,
  calculateRecurringProgress,
  calculateHabitProgress,
  clampProgress,
} from '@/features/goals/utils/calculateProgress';

const createUuid = () => crypto.randomUUID();

const createBaseGoal = () => ({
  id: createUuid(),
  title: 'Test Goal',
  description: '',
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Test',
  tags: ['test'] as string[],
  progress: 0,
  progressHistory: [],
  notes: [],
  attachments: [],
  relatedGoals: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-user',
  archived: false,
  favorite: false,
});

describe('Progress Calculation', () => {
  describe('clampProgress', () => {
    it('clamps positive values to 100', () => {
      expect(clampProgress(150, false)).toBe(100);
    });

    it('clamps negative values to 0', () => {
      expect(clampProgress(-10, false)).toBe(0);
    });

    it('keeps values within range unchanged', () => {
      expect(clampProgress(50, false)).toBe(50);
    });

    it('allows over-achievement when flag is true', () => {
      expect(clampProgress(150, true)).toBe(150);
    });

    it('clamps to 0 even with over-achievement flag for negative values', () => {
      expect(clampProgress(-10, true)).toBe(0);
    });
  });

  describe('BR-009: Quantitative Progress Calculation', () => {
    it('calculates correct progress for normal case', () => {
      const goal: QuantitativeGoal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 200,
        targetValue: 180,
        currentValue: 195,
        unit: 'kg',
        allowDecimals: false,
      } as QuantitativeGoal;

      expect(calculateQuantitativeProgress(goal)).toBe(25);
    });

    it('returns 100% when currentValue >= targetValue with equal start and target', () => {
      const goal: QuantitativeGoal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 100,
        targetValue: 100,
        currentValue: 100,
        unit: 'kg',
        allowDecimals: false,
      } as QuantitativeGoal;

      expect(calculateQuantitativeProgress(goal)).toBe(100);
    });

    it('returns 0% when currentValue < startValue', () => {
      const goal: QuantitativeGoal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 100,
        targetValue: 200,
        currentValue: 50,
        unit: 'kg',
        allowDecimals: false,
      } as QuantitativeGoal;

      expect(calculateQuantitativeProgress(goal)).toBe(0);
    });

    it('clamps to 100% when currentValue > targetValue', () => {
      const goal: QuantitativeGoal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 100,
        targetValue: 200,
        currentValue: 250,
        unit: 'kg',
        allowDecimals: false,
        allowOverAchievement: false,
      } as QuantitativeGoal;

      expect(calculateQuantitativeProgress(goal)).toBe(100);
    });

    it('allows over-achievement when allowOverAchievement is true', () => {
      const goal: QuantitativeGoal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 100,
        targetValue: 200,
        currentValue: 250,
        unit: 'kg',
        allowDecimals: false,
        allowOverAchievement: true,
      } as QuantitativeGoal;

      expect(calculateQuantitativeProgress(goal)).toBe(150);
    });
  });

  describe('BR-010: Milestone Progress Calculation', () => {
    it('calculates correct progress for completed milestones', () => {
      const goal: MilestoneGoal = {
        ...createBaseGoal(),
        type: GoalType.MILESTONE,
        milestones: [
          { id: '1', title: 'M1', order: 0, status: 'completed' },
          { id: '2', title: 'M2', order: 1, status: 'completed' },
          { id: '3', title: 'M3', order: 2, status: 'pending' },
        ],
        allowMilestoneReordering: false,
        requireSequentialCompletion: false,
      } as MilestoneGoal;

      expect(calculateMilestoneProgress(goal)).toBeCloseTo(66.67, 1);
    });

    it('excludes skipped milestones from calculation', () => {
      const goal: MilestoneGoal = {
        ...createBaseGoal(),
        type: GoalType.MILESTONE,
        milestones: [
          { id: '1', title: 'M1', order: 0, status: 'completed' },
          { id: '2', title: 'M2', order: 1, status: 'completed' },
          { id: '3', title: 'M3', order: 2, status: 'skipped' },
        ],
        allowMilestoneReordering: false,
        requireSequentialCompletion: false,
      } as MilestoneGoal;

      expect(calculateMilestoneProgress(goal)).toBe(100);
    });

    it('returns 0 for goal with no milestones', () => {
      const goal: MilestoneGoal = {
        ...createBaseGoal(),
        type: GoalType.MILESTONE,
        milestones: [],
        allowMilestoneReordering: false,
        requireSequentialCompletion: false,
      } as MilestoneGoal;

      expect(calculateMilestoneProgress(goal)).toBe(0);
    });
  });

  describe('BR-011: Binary Progress Calculation', () => {
    it('calculates correct progress with targetCount', () => {
      const goal: BinaryGoal = {
        ...createBaseGoal(),
        type: GoalType.BINARY,
        currentCount: 3,
        targetCount: 5,
        allowPartialCompletion: false,
      } as BinaryGoal;

      expect(calculateBinaryProgress(goal)).toBe(60);
    });

    it('returns 100% when currentCount > 0 and no targetCount', () => {
      const goal: BinaryGoal = {
        ...createBaseGoal(),
        type: GoalType.BINARY,
        currentCount: 1,
        allowPartialCompletion: false,
      } as BinaryGoal;

      expect(calculateBinaryProgress(goal)).toBe(100);
    });

    it('returns 0% when currentCount is 0 and no targetCount', () => {
      const goal: BinaryGoal = {
        ...createBaseGoal(),
        type: GoalType.BINARY,
        currentCount: 0,
        allowPartialCompletion: false,
      } as BinaryGoal;

      expect(calculateBinaryProgress(goal)).toBe(0);
    });
  });

  describe('BR-012: Qualitative Progress Calculation', () => {
    describe('Status-based progress (no self-assessments)', () => {
      it('returns 0% for not_started status', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.NOT_STARTED,
          selfAssessments: [],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(0);
      });

      it('returns 50% for in_progress status', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          selfAssessments: [],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(50);
      });

      it('returns 100% for completed status', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.COMPLETED,
          selfAssessments: [],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(100);
      });

      it('falls back to status when selfAssessments is undefined', () => {
        const goal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          selfAssessments: undefined,
        } as unknown as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(50);
      });
    });

    describe('Self-assessment based progress', () => {
      it('calculates 90% for ratings [8, 9, 10] per acceptance criteria', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          selfAssessments: [
            { id: '1', date: new Date(), rating: 8 },
            { id: '2', date: new Date(), rating: 9 },
            { id: '3', date: new Date(), rating: 10 },
          ],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(90);
      });

      it('calculates progress from single self-assessment', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.NOT_STARTED,
          selfAssessments: [{ id: '1', date: new Date(), rating: 7 }],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(70);
      });

      it('calculates 100% for all perfect 10 ratings', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          selfAssessments: [
            { id: '1', date: new Date(), rating: 10 },
            { id: '2', date: new Date(), rating: 10 },
          ],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(100);
      });

      it('calculates 10% for all minimum 1 ratings', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          selfAssessments: [
            { id: '1', date: new Date(), rating: 1 },
            { id: '2', date: new Date(), rating: 1 },
          ],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(10);
      });
    });

    describe('Target rating based progress', () => {
      it('calculates progress relative to targetRating', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          targetRating: 8,
          selfAssessments: [{ id: '1', date: new Date(), rating: 8 }],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(100);
      });

      it('calculates 75% when average (6) is 75% of target (8)', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          targetRating: 8,
          selfAssessments: [
            { id: '1', date: new Date(), rating: 6 },
            { id: '2', date: new Date(), rating: 6 },
          ],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(75);
      });

      it('clamps to 100% when exceeding targetRating', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          targetRating: 5,
          selfAssessments: [
            { id: '1', date: new Date(), rating: 8 },
            { id: '2', date: new Date(), rating: 10 },
          ],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(100);
      });

      it('calculates 50% when average (5) is 50% of target (10)', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.IN_PROGRESS,
          targetRating: 10,
          selfAssessments: [{ id: '1', date: new Date(), rating: 5 }],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(50);
      });
    });

    describe('Edge cases', () => {
      it('handles empty selfAssessments array like undefined', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.COMPLETED,
          selfAssessments: [],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(100);
      });

      it('uses latest status when selfAssessments exist but should fallback', () => {
        const goal: QualitativeGoal = {
          ...createBaseGoal(),
          type: GoalType.QUALITATIVE,
          qualitativeStatus: QualitativeStatus.COMPLETED,
          selfAssessments: [{ id: '1', date: new Date(), rating: 5 }],
        } as QualitativeGoal;

        expect(calculateQualitativeProgress(goal)).toBe(50);
      });
    });
  });

  describe('BR-013: Recurring Progress Calculation', () => {
    it('calculates correct completion rate', () => {
      const goal: RecurringGoal = {
        ...createBaseGoal(),
        type: GoalType.RECURRING,
        recurrence: { frequency: 'daily', interval: 1 },
        completionStats: {
          totalOccurrences: 10,
          completedOccurrences: 7,
          completionRate: 70,
          streak: { current: 0, longest: 0 },
        },
        occurrences: [],
      } as RecurringGoal;

      expect(calculateRecurringProgress(goal)).toBe(70);
    });

    it('returns 0 when totalOccurrences is 0', () => {
      const goal: RecurringGoal = {
        ...createBaseGoal(),
        type: GoalType.RECURRING,
        recurrence: { frequency: 'daily', interval: 1 },
        completionStats: {
          totalOccurrences: 0,
          completedOccurrences: 0,
          completionRate: 0,
          streak: { current: 0, longest: 0 },
        },
        occurrences: [],
      } as RecurringGoal;

      expect(calculateRecurringProgress(goal)).toBe(0);
    });
  });

  describe('BR-014: Habit Progress Calculation', () => {
    it('calculates correct habit completion rate', () => {
      const goal: HabitGoal = {
        ...createBaseGoal(),
        type: GoalType.HABIT,
        targetFrequency: 'daily',
        completionStats: {
          totalOccurrences: 7,
          completedOccurrences: 5,
          completionRate: 71.4,
          streak: { current: 3, longest: 5 },
        },
        entries: [],
      } as HabitGoal;

      expect(calculateHabitProgress(goal)).toBeCloseTo(71.4, 1);
    });

    it('returns 0 when totalOccurrences is 0', () => {
      const goal: HabitGoal = {
        ...createBaseGoal(),
        type: GoalType.HABIT,
        targetFrequency: 'daily',
        completionStats: {
          totalOccurrences: 0,
          completedOccurrences: 0,
          completionRate: 0,
          streak: { current: 0, longest: 0 },
        },
        entries: [],
      } as HabitGoal;

      expect(calculateHabitProgress(goal)).toBe(0);
    });
  });

  describe('BR-015: Progress Clamping Integration', () => {
    it('all goal types clamp to 0-100 by default', () => {
      const quantitativeGoal: QuantitativeGoal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 0,
        targetValue: 100,
        currentValue: 200,
        unit: 'kg',
        allowDecimals: false,
      } as QuantitativeGoal;

      expect(calculateProgress(quantitativeGoal)).toBe(100);
    });

    it('calculateProgress routes to correct calculator', () => {
      const quantitativeGoal: QuantitativeGoal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 0,
        targetValue: 100,
        currentValue: 50,
        unit: 'kg',
        allowDecimals: false,
      } as QuantitativeGoal;

      expect(calculateProgress(quantitativeGoal)).toBe(50);
    });

    it('calculateProgress routes to binary calculator', () => {
      const binaryGoal: BinaryGoal = {
        ...createBaseGoal(),
        type: GoalType.BINARY,
        currentCount: 3,
        targetCount: 5,
        allowPartialCompletion: false,
      } as BinaryGoal;

      expect(calculateProgress(binaryGoal)).toBe(60);
    });

    it('calculateProgress routes to milestone calculator', () => {
      const milestoneGoal: MilestoneGoal = {
        ...createBaseGoal(),
        type: GoalType.MILESTONE,
        milestones: [
          { id: 'm1', title: 'M1', order: 0, status: 'completed' },
          { id: 'm2', title: 'M2', order: 1, status: 'completed' },
          { id: 'm3', title: 'M3', order: 2, status: 'pending' },
        ],
        allowMilestoneReordering: false,
        requireSequentialCompletion: false,
      } as MilestoneGoal;

      expect(calculateProgress(milestoneGoal)).toBeCloseTo(66.67, 1);
    });

    it('calculateProgress routes to recurring calculator', () => {
      const recurringGoal: RecurringGoal = {
        ...createBaseGoal(),
        type: GoalType.RECURRING,
        recurrence: { frequency: 'daily', interval: 1 },
        completionStats: {
          totalOccurrences: 10,
          completedOccurrences: 7,
          completionRate: 70,
          streak: { current: 3, longest: 5 },
        },
        occurrences: [],
      } as RecurringGoal;

      expect(calculateProgress(recurringGoal)).toBe(70);
    });

    it('calculateProgress routes to habit calculator', () => {
      const habitGoal: HabitGoal = {
        ...createBaseGoal(),
        type: GoalType.HABIT,
        targetFrequency: 'daily',
        completionStats: {
          totalOccurrences: 7,
          completedOccurrences: 5,
          completionRate: 71.4,
          streak: { current: 3, longest: 5 },
        },
        entries: [],
      } as HabitGoal;

      expect(calculateProgress(habitGoal)).toBeCloseTo(71.4, 1);
    });

    it('calculateProgress returns 0 for unknown goal type', () => {
      const unknownGoal = {
        ...createBaseGoal(),
        type: 'unknown' as GoalType,
      } as unknown as Goal;

      expect(calculateProgress(unknownGoal)).toBe(0);
    });
  });

  describe('Edge cases for all calculation functions', () => {
    it('handles milestone with all milestones skipped (totalCount === 0)', () => {
      const goal: MilestoneGoal = {
        ...createBaseGoal(),
        type: GoalType.MILESTONE,
        milestones: [
          { id: 'm1', title: 'M1', order: 0, status: 'skipped' },
          { id: 'm2', title: 'M2', order: 1, status: 'skipped' },
        ],
        allowMilestoneReordering: false,
        requireSequentialCompletion: false,
      } as MilestoneGoal;

      expect(calculateMilestoneProgress(goal)).toBe(0);
    });
  });
});
