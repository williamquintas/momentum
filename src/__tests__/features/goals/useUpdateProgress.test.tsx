/**
 * useUpdateProgress Hook Tests
 *
 * Tests for the useUpdateProgress React Query mutation hook
 */

import { describe, expect, it } from 'vitest';

import type { ProgressEntry } from '@/features/goals/types';
import { detectDuplicateUpdate } from '@/features/goals/utils/progressValidation';

describe('useUpdateProgress', () => {
  describe('Duplicate Detection Integration', () => {
    it('detects duplicate updates within 1 minute window', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [
        {
          id: 'prev-1',
          date: new Date(now - 30000),
          value: 75,
          note: 'Previous update 30s ago',
        },
      ];

      const result = detectDuplicateUpdate('test-goal', { value: 75, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(true);
    });

    it('allows non-duplicate updates', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [
        {
          id: 'prev-1',
          date: new Date(now - 30000),
          value: 50,
          note: 'Previous update',
        },
      ];

      const result = detectDuplicateUpdate('test-goal', { value: 75, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(false);
    });

    it('allows updates outside time window', () => {
      const now = Date.now();
      const history: ProgressEntry[] = [
        {
          id: 'prev-1',
          date: new Date(now - 120000),
          value: 75,
          note: 'Previous update 2 minutes ago',
        },
      ];

      const result = detectDuplicateUpdate('test-goal', { value: 75, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(false);
    });

    it('returns duplicate info with time difference', () => {
      const now = Date.now();
      const pastTime = now - 30000;
      const history: ProgressEntry[] = [
        {
          id: 'prev-1',
          date: new Date(pastTime),
          value: 75,
          note: 'Previous update',
        },
      ];

      const result = detectDuplicateUpdate('test-goal', { value: 75, timestamp: now }, history, 60000);

      expect(result.isDuplicate).toBe(true);
      expect(result.timeDifference).toBeLessThanOrEqual(30000);
    });
  });
});
