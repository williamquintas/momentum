/**
 * Goal Validation Unit Tests
 *
 * Tests for validation utilities covering all business rules (BR-001 to BR-008)
 */

import { describe, expect, it } from 'vitest';

import { GoalType, GoalStatus, Priority, RecurrenceFrequency, QualitativeStatus } from '@/features/goals/types';
import type {
  QuantitativeGoal,
  QualitativeGoal,
  BinaryGoal,
  MilestoneGoal,
  RecurringGoal,
  HabitGoal,
} from '@/features/goals/types';
import {
  validateMilestoneUpdate,
  getUnmetDependencies,
  canCompleteMilestone,
} from '@/features/goals/utils/progressValidation';
import {
  safeValidateGoal,
  zodErrorToFieldErrors,
  formatZodError,
  isValidGoal,
  isQuantitativeGoal,
  isQualitativeGoal,
  isBinaryGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
} from '@/features/goals/utils/validation';

const createUuid = () => crypto.randomUUID();

const createQuantitativeGoal = (
  overrides?: Partial<{
    title: string;
    category: string;
    startValue: number;
    targetValue: number;
    currentValue: number;
    unit: string;
    allowDecimals: boolean;
  }>
): QuantitativeGoal =>
  ({
    id: createUuid(),
    title: 'Test Goal',
    description: '',
    type: GoalType.QUANTITATIVE,
    status: GoalStatus.ACTIVE,
    priority: Priority.MEDIUM,
    category: 'Test',
    tags: ['test'],
    startValue: 0,
    targetValue: 100,
    currentValue: 0,
    unit: 'kg',
    allowDecimals: false,
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
    ...overrides,
  }) as QuantitativeGoal;

const createQualitativeGoal = (): QualitativeGoal => ({
  id: createUuid(),
  title: 'Test Goal',
  description: '',
  type: GoalType.QUALITATIVE,
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Test',
  tags: ['test'],
  qualitativeStatus: QualitativeStatus.NOT_STARTED,
  selfAssessments: [],
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

const createBinaryGoal = (): BinaryGoal => ({
  id: createUuid(),
  title: 'Test Goal',
  description: '',
  type: GoalType.BINARY,
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Test',
  tags: ['test'],
  currentCount: 0,
  allowPartialCompletion: false,
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

const createMilestoneGoal = (): MilestoneGoal => ({
  id: createUuid(),
  title: 'Test Goal',
  description: '',
  type: GoalType.MILESTONE,
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Test',
  tags: ['test'],
  milestones: [{ id: createUuid(), title: 'First Milestone', order: 0, status: 'pending' }],
  allowMilestoneReordering: false,
  requireSequentialCompletion: false,
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

const createRecurringGoal = (): RecurringGoal => ({
  id: createUuid(),
  title: 'Test Goal',
  description: '',
  type: GoalType.RECURRING,
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Test',
  tags: ['test'],
  recurrence: { frequency: 'daily' as RecurrenceFrequency, interval: 1 },
  completionStats: {
    totalOccurrences: 0,
    completedOccurrences: 0,
    completionRate: 0,
    streak: { current: 0, longest: 0 },
  },
  occurrences: [],
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

const createHabitGoal = (): HabitGoal => ({
  id: createUuid(),
  title: 'Test Goal',
  description: '',
  type: GoalType.HABIT,
  status: GoalStatus.ACTIVE,
  priority: Priority.MEDIUM,
  category: 'Test',
  tags: ['test'],
  targetFrequency: 'daily',
  completionStats: {
    totalOccurrences: 0,
    completedOccurrences: 0,
    completionRate: 0,
    streak: { current: 0, longest: 0 },
  },
  entries: [],
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

describe('Goal Validation', () => {
  describe('validateGoal', () => {
    it('validates complete quantitative goal object', () => {
      const goal = createQuantitativeGoal();
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates complete qualitative goal object', () => {
      const goal = createQualitativeGoal();
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates complete binary goal object', () => {
      const goal = createBinaryGoal();
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates complete milestone goal object', () => {
      const goal = createMilestoneGoal();
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates complete recurring goal object', () => {
      const goal = createRecurringGoal();
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates complete habit goal object', () => {
      const goal = createHabitGoal();
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('rejects goal with invalid title (empty)', () => {
      const goal = createQuantitativeGoal({ title: '' });
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(false);
    });

    it('rejects goal with invalid title (too long)', () => {
      const goal = createQuantitativeGoal({ title: 'A'.repeat(201) });
      const result = safeValidateGoal(goal);
      expect(result.success).toBe(false);
    });
  });

  describe('zodErrorToFieldErrors', () => {
    it('converts Zod error to field error map', () => {
      const goal = createQuantitativeGoal({ title: '' });
      const result = safeValidateGoal(goal);

      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        const fieldErrors = zodErrorToFieldErrors(result.error);
        expect(Object.keys(fieldErrors).length).toBeGreaterThan(0);
      }
    });

    it('handles valid input without errors', () => {
      const goal = createQuantitativeGoal();
      const result = safeValidateGoal(goal);

      expect(result.success).toBe(true);
    });
  });

  describe('formatZodError', () => {
    it('formats single error', () => {
      const goal = createQuantitativeGoal({ title: '' });
      const result = safeValidateGoal(goal);

      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        const formatted = formatZodError(result.error);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      }
    });

    it('formats multiple errors', () => {
      const goal = createQuantitativeGoal({ title: '', category: '' });
      const result = safeValidateGoal(goal);

      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        const formatted = formatZodError(result.error);
        expect(typeof formatted).toBe('string');
      }
    });
  });

  describe('Type Guards', () => {
    it('isQuantitativeGoal returns true for quantitative goals', () => {
      const goal = createQuantitativeGoal();

      expect(isQuantitativeGoal(goal)).toBe(true);
      expect(isQualitativeGoal(goal)).toBe(false);
      expect(isBinaryGoal(goal)).toBe(false);
      expect(isMilestoneGoal(goal)).toBe(false);
      expect(isRecurringGoal(goal)).toBe(false);
      expect(isHabitGoal(goal)).toBe(false);
    });

    it('isQualitativeGoal returns true for qualitative goals', () => {
      const goal = createQualitativeGoal();

      expect(isQualitativeGoal(goal)).toBe(true);
      expect(isQuantitativeGoal(goal)).toBe(false);
      expect(isBinaryGoal(goal)).toBe(false);
    });

    it('isBinaryGoal returns true for binary goals', () => {
      const goal = createBinaryGoal();

      expect(isBinaryGoal(goal)).toBe(true);
      expect(isQuantitativeGoal(goal)).toBe(false);
    });

    it('isMilestoneGoal returns true for milestone goals', () => {
      const goal = createMilestoneGoal();

      expect(isMilestoneGoal(goal)).toBe(true);
      expect(isQuantitativeGoal(goal)).toBe(false);
    });

    it('isRecurringGoal returns true for recurring goals', () => {
      const goal = createRecurringGoal();

      expect(isRecurringGoal(goal)).toBe(true);
      expect(isQuantitativeGoal(goal)).toBe(false);
    });

    it('isHabitGoal returns true for habit goals', () => {
      const goal = createHabitGoal();

      expect(isHabitGoal(goal)).toBe(true);
      expect(isQuantitativeGoal(goal)).toBe(false);
    });
  });

  describe('isValidGoal', () => {
    it('returns true for valid quantitative goal', () => {
      const goal = createQuantitativeGoal();
      expect(isValidGoal(goal)).toBe(true);
    });

    it('returns true for valid qualitative goal', () => {
      const goal = createQualitativeGoal();
      expect(isValidGoal(goal)).toBe(true);
    });

    it('returns true for valid binary goal', () => {
      const goal = createBinaryGoal();
      expect(isValidGoal(goal)).toBe(true);
    });

    it('returns true for valid milestone goal', () => {
      const goal = createMilestoneGoal();
      expect(isValidGoal(goal)).toBe(true);
    });

    it('returns true for valid recurring goal', () => {
      const goal = createRecurringGoal();
      expect(isValidGoal(goal)).toBe(true);
    });

    it('returns true for valid habit goal', () => {
      const goal = createHabitGoal();
      expect(isValidGoal(goal)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidGoal(null as unknown)).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(isValidGoal({})).toBe(false);
    });

    it('returns false for incomplete goal', () => {
      expect(isValidGoal({ title: '' })).toBe(false);
    });
  });

  describe('BR-005: Quantitative Goal Validation', () => {
    it('validates quantitative goal with all required fields', () => {
      const goal = createQuantitativeGoal({
        startValue: 0,
        targetValue: 100,
        currentValue: 0,
        unit: 'kg',
        allowDecimals: false,
      });

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates quantitative goal with decimals allowed', () => {
      const goal = createQuantitativeGoal({
        startValue: 0,
        targetValue: 100,
        currentValue: 0,
        unit: 'kg',
        allowDecimals: true,
      });

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });
  });

  describe('BR-006: Milestone Goal Validation', () => {
    it('validates milestone goal with at least one milestone', () => {
      const goal = createMilestoneGoal();

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('rejects milestone goal without milestones', () => {
      const goal = createMilestoneGoal();
      goal.milestones = [];

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(false);
    });

    it('validates milestone goal with multiple milestones', () => {
      const goal = createMilestoneGoal();
      goal.milestones = [
        { id: createUuid(), title: 'First', order: 0, status: 'pending' as const },
        { id: createUuid(), title: 'Second', order: 1, status: 'pending' as const },
      ];

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });
  });

  describe('BR-007: Recurring Goal Validation', () => {
    it('validates recurring goal with daily frequency', () => {
      const goal = createRecurringGoal();

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates recurring goal with weekly frequency and daysOfWeek', () => {
      const goal = createRecurringGoal();
      goal.recurrence = { frequency: RecurrenceFrequency.WEEKLY, interval: 1, daysOfWeek: [1, 3, 5] };

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('rejects recurring goal without interval', () => {
      const goal = createRecurringGoal();
      goal.recurrence = { frequency: RecurrenceFrequency.DAILY, interval: 0 };

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(false);
    });
  });

  describe('BR-008: Habit Goal Validation', () => {
    it('validates habit goal with daily frequency', () => {
      const goal = createHabitGoal();
      goal.targetFrequency = 'daily';

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates habit goal with custom frequency', () => {
      const goal = createHabitGoal();
      goal.targetFrequency = 'custom';
      goal.customFrequency = 5;

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });

    it('validates habit goal with every_other_day frequency', () => {
      const goal = createHabitGoal();
      goal.targetFrequency = 'every_other_day';

      const result = safeValidateGoal(goal);
      expect(result.success).toBe(true);
    });
  });

  describe('BR-027: Milestone Dependency Validation', () => {
    it('returns no unmet dependencies when none exist', () => {
      const m1 = { id: 'm1', title: 'First', order: 0, status: 'completed' as const };
      const m2 = { id: 'm2', title: 'Second', order: 1, status: 'pending' as const };
      const milestones = [m1, m2];

      const unmet = getUnmetDependencies(m2, milestones);
      expect(unmet).toHaveLength(0);
    });

    it('detects unmet dependencies', () => {
      const m1 = { id: 'm1', title: 'First', order: 0, status: 'pending' as const };
      const m2 = { id: 'm2', title: 'Second', order: 1, status: 'pending' as const, dependencies: ['m1'] as string[] };
      const milestones = [m1, m2];

      const unmet = getUnmetDependencies(m2, milestones);
      expect(unmet).toContain('m1');
    });

    it('allows completion when all dependencies are completed', () => {
      const milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'completed' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'pending' as const, dependencies: ['m1'] as string[] },
      ];

      const result = canCompleteMilestone('m2', milestones, false);
      expect(result.canComplete).toBe(true);
    });

    it('blocks completion when dependencies are unmet', () => {
      const milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'pending' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'pending' as const, dependencies: ['m1'] as string[] },
      ];

      const result = canCompleteMilestone('m2', milestones, false);
      expect(result.canComplete).toBe(false);
      expect(result.reason).toContain('Unmet dependencies');
    });

    it('blocks completion when milestone not found', () => {
      const milestones = [{ id: 'm1', title: 'First', order: 0, status: 'pending' as const }];

      const result = canCompleteMilestone('nonexistent', milestones, false);
      expect(result.canComplete).toBe(false);
      expect(result.reason).toContain('not found');
    });

    it('blocks completion for already completed milestone', () => {
      const milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'completed' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'completed' as const },
      ];

      const result = canCompleteMilestone('m2', milestones, false);
      expect(result.canComplete).toBe(false);
      expect(result.reason).toContain('already completed');
    });

    it('blocks completion for skipped milestone', () => {
      const milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'pending' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'skipped' as const, dependencies: ['m1'] as string[] },
      ];

      const result = canCompleteMilestone('m2', milestones, false);
      expect(result.canComplete).toBe(false);
      expect(result.reason).toContain('skipped');
    });

    it('blocks sequential completion when previous not done', () => {
      const milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'pending' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'pending' as const },
      ];

      const result = canCompleteMilestone('m2', milestones, true);
      expect(result.canComplete).toBe(false);
      expect(result.reason).toContain('Previous milestone');
    });

    it('allows sequential completion when previous is completed', () => {
      const milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'completed' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'pending' as const },
      ];

      const result = canCompleteMilestone('m2', milestones, true);
      expect(result.canComplete).toBe(true);
    });

    it('allows sequential completion when previous is skipped', () => {
      const milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'skipped' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'pending' as const },
      ];

      const result = canCompleteMilestone('m2', milestones, true);
      expect(result.canComplete).toBe(true);
    });

    it('validateMilestoneUpdate rejects completion with unmet dependencies', () => {
      const goal = createMilestoneGoal();
      goal.milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'pending' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'pending' as const, dependencies: ['m1'] as string[] },
      ];
      goal.requireSequentialCompletion = false;

      const result = validateMilestoneUpdate(goal, 'm2', true, []);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unmet dependencies');
    });

    it('validateMilestoneUpdate allows completion when all dependencies met', () => {
      const goal = createMilestoneGoal();
      goal.milestones = [
        { id: 'm1', title: 'First', order: 0, status: 'completed' as const },
        { id: 'm2', title: 'Second', order: 1, status: 'pending' as const, dependencies: ['m1'] as string[] },
      ];

      const result = validateMilestoneUpdate(goal, 'm2', true, []);
      expect(result.isValid).toBe(true);
    });
  });
});
