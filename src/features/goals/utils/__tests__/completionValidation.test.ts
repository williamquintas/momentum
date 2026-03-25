/**
 * Completion Validation Tests
 *
 * Unit tests for completion eligibility validation functions.
 */

import { describe, it, expect } from 'vitest';

import { GoalType, GoalStatus } from '@/types/goal.types';

import {
  validateCompletionEligibility,
  isEligibleForCompletion,
  getCompletionCriteria,
  getCompletionCriteriaSummary,
  canOverrideCompletion,
} from '../completionValidation';

describe('validateCompletionEligibility', () => {
  it('should reject goals that are not active', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.COMPLETED,
      progress: 100,
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('completed');
  });

  it('should accept quantitative goal at 100% progress', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 100,
      currentValue: 100,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(true);
  });

  it('should accept quantitative goal that exceeds target', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 150,
      currentValue: 150,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(true);
  });

  it('should reject quantitative goal below 100%', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 50,
      currentValue: 50,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(false);
  });

  it('should accept binary goal at 100% progress', () => {
    const goal = {
      id: '1',
      type: GoalType.BINARY,
      status: GoalStatus.ACTIVE,
      progress: 100,
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(true);
  });

  it('should accept qualitative goal with completed status', () => {
    const goal = {
      id: '1',
      type: GoalType.QUALITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 100,
      qualitativeStatus: 'completed',
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(true);
  });

  it('should reject qualitative goal not completed', () => {
    const goal = {
      id: '1',
      type: GoalType.QUALITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 50,
      qualitativeStatus: 'in_progress',
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(false);
  });

  it('should accept milestone goal with all milestones completed', () => {
    const goal = {
      id: '1',
      type: GoalType.MILESTONE,
      status: GoalStatus.ACTIVE,
      progress: 100,
      milestones: [
        { id: 'm1', title: 'M1', status: 'completed' as const, order: 1 },
        { id: 'm2', title: 'M2', status: 'completed' as const, order: 2 },
      ],
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(true);
  });

  it('should reject milestone goal with incomplete milestones', () => {
    const goal = {
      id: '1',
      type: GoalType.MILESTONE,
      status: GoalStatus.ACTIVE,
      progress: 50,
      milestones: [
        { id: 'm1', title: 'M1', status: 'completed' as const, order: 1 },
        { id: 'm2', title: 'M2', status: 'pending' as const, order: 2 },
      ],
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(false);
  });

  it('should handle paused goals', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.PAUSED,
      progress: 100,
      title: 'Test Goal',
    } as never;

    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(false);
  });
});

describe('isEligibleForCompletion', () => {
  it('should return boolean result', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 100,
      currentValue: 100,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const result = isEligibleForCompletion(goal);
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });

  it('should return false for inactive goals', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.CANCELLED,
      progress: 100,
      title: 'Test Goal',
    } as never;

    const result = isEligibleForCompletion(goal);
    expect(result).toBe(false);
  });
});

describe('getCompletionCriteria', () => {
  it('should return criteria for quantitative goals', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 50,
      currentValue: 50,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const criteria = getCompletionCriteria(goal);
    expect(criteria.goalType).toBe(GoalType.QUANTITATIVE);
    expect(criteria.requirements.length).toBeGreaterThan(0);
    expect(criteria.met).toBe(false);
  });

  it('should return criteria with partial completion info', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 75,
      currentValue: 75,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const criteria = getCompletionCriteria(goal);
    expect(criteria.met).toBe(false);
    expect(criteria.partialMet).toBeDefined();
    expect(criteria.partialMet?.length).toBeGreaterThan(0);
  });
});

describe('getCompletionCriteriaSummary', () => {
  it('should return ready message for eligible goals', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 100,
      currentValue: 100,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const summary = getCompletionCriteriaSummary(goal);
    expect(summary).toContain('ready');
  });

  it('should return requirements for ineligible goals', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 50,
      currentValue: 50,
      targetValue: 100,
      title: 'Test Goal',
    } as never;

    const summary = getCompletionCriteriaSummary(goal);
    expect(summary).not.toContain('ready');
    expect(summary).toContain('Current value');
  });
});

describe('canOverrideCompletion', () => {
  it('should return true for active goals', () => {
    const goal = {
      id: '1',
      type: GoalType.QUANTITATIVE,
      status: GoalStatus.ACTIVE,
      progress: 50,
      title: 'Test Goal',
    } as never;

    expect(canOverrideCompletion(goal)).toBe(true);
  });
});
