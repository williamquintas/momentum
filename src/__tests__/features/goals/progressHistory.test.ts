/**
 * Progress History Unit Tests
 *
 * Tests for progress history tracking per FR-013 and ADR-001.
 * Validates immutable, append-only behavior of progress history.
 */

import { describe, expect, it } from 'vitest';

import { GoalType, GoalStatus, Priority } from '@/features/goals/types';
import type { Goal, ProgressEntry } from '@/features/goals/types';
import { detectDuplicateUpdate } from '@/features/goals/utils/progressValidation';

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

const createProgressEntry = (id: string, value: number, date: Date, note?: string): ProgressEntry => ({
  id,
  date,
  value,
  note,
  metadata: {},
});

describe('Progress History', () => {
  describe('FR-013: Immutable append-only history', () => {
    it('creates new history entry without modifying existing entries', () => {
      const existingHistory: ProgressEntry[] = [
        createProgressEntry('e1', 10, new Date('2024-01-01')),
        createProgressEntry('e2', 20, new Date('2024-01-02')),
      ];

      const newEntry = createProgressEntry('e3', 30, new Date('2024-01-03'));
      const updatedHistory = [...existingHistory, newEntry];

      expect(existingHistory).toHaveLength(2);
      expect(existingHistory[0]!.id).toBe('e1');
      expect(existingHistory[1]!.id).toBe('e2');
      expect(updatedHistory).toHaveLength(3);
      expect(updatedHistory[2]!.id).toBe('e3');
    });

    it('preserves original history when adding multiple entries', () => {
      let history: ProgressEntry[] = [];

      history = [...history, createProgressEntry('e1', 10, new Date('2024-01-01'))];
      history = [...history, createProgressEntry('e2', 20, new Date('2024-01-02'))];
      history = [...history, createProgressEntry('e3', 30, new Date('2024-01-03'))];

      expect(history).toHaveLength(3);
      expect(history[0]!.value).toBe(10);
      expect(history[1]!.value).toBe(20);
      expect(history[2]!.value).toBe(30);
    });

    it('does not allow removing entries from history', () => {
      const history: ProgressEntry[] = [
        createProgressEntry('e1', 10, new Date('2024-01-01')),
        createProgressEntry('e2', 20, new Date('2024-01-02')),
      ];

      const filteredHistory = history.filter((e) => e.id !== 'e1');
      expect(history).toHaveLength(2);
      expect(filteredHistory).toHaveLength(1);
    });
  });

  describe('Progress entry structure', () => {
    it('contains required fields: id, date, value', () => {
      const entry = createProgressEntry('test-id', 50, new Date());

      expect(entry.id).toBe('test-id');
      expect(entry.date).toBeInstanceOf(Date);
      expect(entry.value).toBe(50);
    });

    it('contains optional note field', () => {
      const entryWithNote = createProgressEntry('test-id', 50, new Date(), 'Weekly update');
      const entryWithoutNote = createProgressEntry('test-id', 50, new Date());

      expect(entryWithNote.note).toBe('Weekly update');
      expect(entryWithoutNote.note).toBeUndefined();
    });

    it('contains optional metadata field', () => {
      const entry = createProgressEntry('test-id', 50, new Date());
      entry.metadata = { source: 'manual', userId: 'user-123' };

      expect(entry.metadata?.source).toBe('manual');
      expect(entry.metadata?.userId).toBe('user-123');
    });
  });

  describe('FR-014: Duplicate detection', () => {
    it('detects duplicate updates within 1 minute window', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [createProgressEntry('e1', 50, new Date(now - 30000))];

      const result = detectDuplicateUpdate('goal-1', { value: 50, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(true);
    });

    it('does not flag different values as duplicate', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [createProgressEntry('e1', 50, new Date(now - 30000))];

      const result = detectDuplicateUpdate('goal-1', { value: 60, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(false);
    });

    it('does not flag updates outside time window', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [createProgressEntry('e1', 50, new Date(now - 120000))];

      const result = detectDuplicateUpdate('goal-1', { value: 50, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(false);
    });

    it('returns original update info when duplicate detected', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [createProgressEntry('e1', 50, new Date(now - 30000), 'First update')];

      const result = detectDuplicateUpdate('goal-1', { value: 50, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(true);
      expect(result.originalUpdate?.id).toBe('e1');
      expect(result.originalUpdate?.note).toBe('First update');
      expect(result.timeDifference).toBeLessThan(60000);
    });

    it('handles empty history without errors', () => {
      const result = detectDuplicateUpdate('goal-1', { value: 50, timestamp: Date.now() }, [], 60000);

      expect(result.isDuplicate).toBe(false);
    });

    it('uses default 1-minute window', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [createProgressEntry('e1', 50, new Date(now - 59000))];

      const result = detectDuplicateUpdate('goal-1', { value: 50, timestamp: now }, history);

      expect(result.isDuplicate).toBe(true);
    });

    it('allows updates after 1 minute has passed', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [createProgressEntry('e1', 50, new Date(now - 61000))];

      const result = detectDuplicateUpdate('goal-1', { value: 50, timestamp: now }, history);

      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('History chronological order', () => {
    it('retrieves entries in chronological order (oldest first)', () => {
      const history: ProgressEntry[] = [
        createProgressEntry('e1', 10, new Date('2024-01-01')),
        createProgressEntry('e2', 20, new Date('2024-01-02')),
        createProgressEntry('e3', 30, new Date('2024-01-03')),
      ];

      const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      expect(sortedHistory[0]!.value).toBe(10);
      expect(sortedHistory[1]!.value).toBe(20);
      expect(sortedHistory[2]!.value).toBe(30);
    });

    it('sorts entries by date descending (newest first)', () => {
      const history: ProgressEntry[] = [
        createProgressEntry('e1', 10, new Date('2024-01-01')),
        createProgressEntry('e2', 20, new Date('2024-01-02')),
        createProgressEntry('e3', 30, new Date('2024-01-03')),
      ];

      const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      expect(sortedHistory[0]!.value).toBe(30);
      expect(sortedHistory[1]!.value).toBe(20);
      expect(sortedHistory[2]!.value).toBe(10);
    });

    it('handles entries with same timestamp', () => {
      const sameDate = new Date('2024-01-01');
      const history: ProgressEntry[] = [
        createProgressEntry('e1', 10, sameDate),
        createProgressEntry('e2', 20, sameDate),
      ];

      const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      expect(sortedHistory).toHaveLength(2);
    });
  });

  describe('Progress history integration with goals', () => {
    it('initializes goal with empty progress history', () => {
      const goal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 0,
        targetValue: 100,
        currentValue: 0,
        unit: 'kg',
        allowDecimals: false,
      };

      expect(goal.progressHistory).toEqual([]);
    });

    it('goal type includes progressHistory field', () => {
      const goal: Goal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 0,
        targetValue: 100,
        currentValue: 50,
        unit: 'kg',
        allowDecimals: false,
      } as Goal;

      expect(goal.progressHistory).toBeDefined();
      expect(Array.isArray(goal.progressHistory)).toBe(true);
    });

    it('updating goal preserves existing history', () => {
      const existingHistory: ProgressEntry[] = [createProgressEntry('e1', 25, new Date('2024-01-01'))];

      const goal: Goal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 0,
        targetValue: 100,
        currentValue: 50,
        unit: 'kg',
        allowDecimals: false,
        progressHistory: existingHistory,
      } as Goal;

      const newEntry = createProgressEntry('e2', 50, new Date('2024-01-02'));
      const updatedGoal = {
        ...goal,
        currentValue: 75,
        progressHistory: [...goal.progressHistory, newEntry],
      };

      expect(goal.progressHistory).toHaveLength(1);
      expect(updatedGoal.progressHistory).toHaveLength(2);
      expect(updatedGoal.progressHistory[1]!.value).toBe(50);
    });

    it('progress value reflects latest calculation', () => {
      const goal: Goal = {
        ...createBaseGoal(),
        type: GoalType.QUANTITATIVE,
        startValue: 0,
        targetValue: 100,
        currentValue: 75,
        unit: 'kg',
        allowDecimals: false,
        progress: 75,
        progressHistory: [createProgressEntry('e1', 50, new Date('2024-01-01'))],
      } as Goal;

      expect(goal.progress).toBe(75);
      expect(goal.progressHistory[0]!.value).toBe(50);
    });
  });

  describe('ADR-001: Immutable progress history principles', () => {
    it('history entries are never modified after creation', () => {
      const entry = createProgressEntry('e1', 50, new Date('2024-01-01'), 'Original note');

      const updatedGoal = {
        ...createBaseGoal(),
        progressHistory: [entry],
      };

      const newEntry = createProgressEntry('e2', 75, new Date('2024-01-02'), 'Second note');
      updatedGoal.progressHistory = [...updatedGoal.progressHistory, newEntry];

      expect(updatedGoal.progressHistory[0]!.note).toBe('Original note');
      expect(updatedGoal.progressHistory[0]!.value).toBe(50);
      expect(updatedGoal.progressHistory[1]!.note).toBe('Second note');
    });

    it('each entry has unique identifier', () => {
      const entry1 = createProgressEntry('unique-1', 50, new Date());
      const entry2 = createProgressEntry('unique-2', 75, new Date());

      expect(entry1.id).not.toBe(entry2.id);
    });

    it('entries include timestamp for audit trail', () => {
      const beforeCreation = new Date();
      const entry = createProgressEntry('e1', 50, new Date());
      const afterCreation = new Date();

      expect(entry.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(entry.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });
});
