# Research: Duplicate Progress Update Bug

## Bug Analysis

### Issue Description

- Error: "Duplicate progress update detected. Please wait before submitting another update."
- Triggered incorrectly on first-time progress updates
- Source: `src/features/goals/hooks/useUpdateProgress.ts:96`

### Code Flow

1. **Entry Point**: `useUpdateProgress.ts` - React Query mutation hook
2. **Duplicate Detection**: `progressValidation.ts:246` - `detectDuplicateUpdate()` function
3. **Storage**: `goalStorageService.ts:508` - `updateProgress()` function

### Duplicate Detection Logic (progressValidation.ts)

```typescript
export function detectDuplicateUpdate(
  goalId: string,
  newUpdate: { value: number; timestamp: number },
  history: ProgressEntry[],
  timeWindow: number = DEFAULT_DUPLICATE_WINDOW_MS
): DuplicateDetectionResult {
  const recentUpdates = history.filter((entry) => {
    const timeDiff = Math.abs(newUpdate.timestamp - entry.date.getTime());
    return timeDiff <= timeWindow;
  });

  for (const entry of recentUpdates) {
    if (entry.value === newUpdate.value) {
      return { isDuplicate: true, ... };
    }
  }
  return { isDuplicate: false };
}
```

### Key Findings

1. **Empty History Handling**: Tests confirm `detectDuplicateUpdate` handles empty history correctly - returns `isDuplicate: false`

2. **History Population**: `createGoal` (goalStorageService.ts:331) creates goals with `progressHistory: input.progressHistory || []` - defaults to empty array

3. **Progress Calculation**: Uses formula `((currentValue - startValue) / (targetValue - startValue)) * 100`

### Potential Root Causes

1. **React Query Cache Issue**: The cache might contain stale progress history from a previous goal or corrupted state
2. **Optimistic Update Race Condition**: The `onMutate` adds an optimistic entry to `progressHistory` before the server validates
3. **Timestamp Collision**: If somehow the same timestamp is generated
4. **Goal State Corruption**: The `currentGoal` from cache might have unexpected data

### Test Results

- All FR-014 tests pass (7 tests for duplicate detection)
- Empty history handling works correctly

## Decision

**Most Likely Cause**: React Query cache state corruption or race condition during optimistic updates. The cache `currentGoal.progressHistory` might contain unexpected entries.

**Recommended Fix**: Add defensive validation in `detectDuplicateUpdate` to ensure:

1. History entries have valid dates
2. Check against actual stored history, not just cache
3. Add logging to track what's in the cache at time of detection

## No NEEDS CLARIFICATION Required

This is a bugfix with a clear issue description. No additional clarification needed.
