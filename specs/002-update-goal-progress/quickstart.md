# Quickstart: Update Goal Progress

## Overview

This guide gets you developing the Update Goal Progress feature. Covers setup, development workflow, testing, and common scenarios.

## Prerequisites

- Node.js 18+ with npm/yarn
- TypeScript knowledge (advanced)
- Zustand and React Form experience helpful
- Completed 003-create-goal feature

## Quick Setup

```bash
# Ensure workspace is set up
cd /home/william/momentum
npm install

# Run dev server
npm run dev

# Verify no errors
npm run type-check
```

## File Structure

```
src/features/goals/
├── components/
│   ├── ProgressUpdateForm.tsx          # Main form wrapper
│   ├── QuantitativeProgressField.tsx   # Number input
│   ├── QualitativeProgressField.tsx    # Rich text input
│   ├── BinaryProgressField.tsx         # Toggle/radio
│   ├── MilestoneProgressField.tsx      # Milestone selector
│   ├── HabitProgressField.tsx          # Date picker
│   └── RecurringProgressField.tsx      # Occurrence selector
├── hooks/
│   ├── useProgressUpdate.ts            # Main hook
│   └── useProgressForm.ts              # Form hook
├── utils/
│   ├── progressCalculation.ts          # Formula engine
│   ├── progressValidation.ts           # Validation functions
│   └── progressFormatters.ts           # Display formatting
├── types/
│   └── progress.ts                     # TypeScript types
├── validation/
│   └── progressSchemas.ts              # Zod schemas
└── store/
    └── progressStore.ts                # Zustand store
```

## Development Workflow

### 1. Start with Type Definitions

```typescript
// src/features/goals/types/progress.ts
export interface ProgressUpdate {
  goalId: string;
  timestamp: number;
  type: GoalType;
  previousValue: number;
  currentValue: number;
}

export interface QuantitativeProgressUpdate extends ProgressUpdate {
  type: 'quantitative';
  unit: string;
}
```

### 2. Create Validation Schemas

```typescript
// src/features/goals/validation/progressSchemas.ts
import { z } from 'zod';

export const quantitativeProgressSchema = z.object({
  goalId: z.string().uuid(),
  currentValue: z.number().min(0),
  notes: z.string().max(500).optional(),
});
```

### 3. Implement Calculation Functions

```typescript
// src/features/goals/utils/progressCalculation.ts
export function calculateQuantitativeProgress(startValue: number, currentValue: number, targetValue: number): number {
  if (targetValue === startValue) return 100; // Already at target

  const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
  return Math.max(0, Math.min(100, progress)); // Clamp [0, 100]
}

// Test it
console.assert(calculateQuantitativeProgress(0, 50, 100) === 50);
console.assert(calculateQuantitativeProgress(10, 20, 30) === 50);
```

### 4. Create Zustand Store

```typescript
// src/features/goals/store/progressStore.ts
import { create } from 'zustand';
import type { ProgressUpdate } from '../types/progress';

export const useProgressStore = create<ProgressState>((set, get) => ({
  updates: new Map(),
  progressCache: new Map(),

  addUpdate: async (goalId, update) => {
    set({ loading: true });
    try {
      // Validate, dedupe, persist
      const history = get().updates.get(goalId) || [];
      history.push(update);

      set((state) => ({
        updates: new Map(state.updates).set(goalId, history),
        progressCache: new Map(state.progressCache).delete(goalId),
      }));
    } catch (err) {
      set({ error: err as Error });
    }
  },
}));
```

### 5. Build Form Component

```typescript
// src/features/goals/components/ProgressUpdateForm.tsx
import { Form, Input, Button, Space } from 'antd';
import { useProgressForm } from '../hooks/useProgressForm';

export const ProgressUpdateForm: React.FC<ProgressUpdateFormProps> = ({ goal }) => {
  const { form, onSubmit, isLoading } = useProgressForm(goal.id, goal.type);

  return (
    <Form form={form} onFinish={onSubmit}>
      {goal.type === 'quantitative' && <QuantitativeProgressField />}
      {goal.type === 'qualitative' && <QualitativeProgressField />}
      {/* ... other types */}

      <Button type="primary" htmlType="submit" loading={isLoading}>
        Update Progress
      </Button>
    </Form>
  );
};
```

## Common Tasks

### Add a New Goal Type Support

1. Add type to `ProgressUpdate` union in `progress.ts`
2. Create Zod schema in `progressSchemas.ts`
3. Add validation function in `progressValidation.ts`
4. Add calculation function in `progressCalculation.ts`
5. Create form field component
6. Add conditional render in `ProgressUpdateForm`
7. Write unit tests for formula

### Test a Calculation Formula

```typescript
// In test file
import { calculateMilestoneProgress } from '../utils/progressCalculation';

describe('calculateMilestoneProgress', () => {
  it('should calculate progress as completed/total', () => {
    expect(calculateMilestoneProgress(2, 4)).toBe(50);
    expect(calculateMilestoneProgress(4, 4)).toBe(100);
    expect(calculateMilestoneProgress(0, 4)).toBe(0);
  });

  it('should require minimum 1 milestone', () => {
    expect(() => calculateMilestoneProgress(0, 0)).toThrow();
  });
});
```

### Integrate with Goal Detail Page

```typescript
// src/pages/GoalDetailPage.tsx
import { ProgressUpdateForm } from '../features/goals/components/ProgressUpdateForm';

export const GoalDetailPage: React.FC = () => {
  const goal = useGoal(goalId);

  return (
    <Layout>
      <GoalHeader goal={goal} />
      <ProgressSection goal={goal} />
      <ProgressUpdateForm goal={goal} />  {/* Add form */}
      <ProgressHistory goalId={goalId} />
    </Layout>
  );
};
```

## Testing Strategies

### Unit Test Calculation Functions

```bash
npm test -- progressCalculation.test.ts
```

### Component Test Form

```bash
npm test -- ProgressUpdateForm.test.tsx
# Look for: form rendering, field validation, submit success/error
```

### Integration Test Full Flow

```bash
npm test -- progress-integration.test.ts
# Look for: form → validation → store → localStorage → goal update
```

## Debug Checklist

- [ ] Goal type correctly detected from context
- [ ] Zod validation passing for input values
- [ ] Progress calculation formula verified manually
- [ ] LocalStorage updates visible in DevTools → Application → LocalStorage
- [ ] Zustand store state correct: `useProgressStore.getState()`
- [ ] Form submission handler called (add console.log)
- [ ] Success toast displayed on update
- [ ] Goal progress property updated in UI

## Performance Considerations

- **Form Submission**: Target <500ms from click to toast
- **Progress Calculation**: Reuse cache when possible
- **History Loading**: Pagination for goals with 100+ updates
- **Validation**: Run client-side only (no network calls)

## Security Notes

- Validate all numeric inputs (no NaN, Infinity)
- Sanitize qualitative text (prevent XSS in rich text)
- Verify goalId ownership before accepting updates
- Timestamp should be ≤ current time (prevent future dates)

## Common Issues

### "Progress not updating in UI"

- Check: Is goal's progress property being updated?
- Check: Did Zustand store.addUpdate actually run?
- Check: Did localStorage persist the update?
- Fix: Add console.log at each step, verify order

### "Validation failing unexpectedly"

- Check: Does Zod schema match input types?
- Check: Are optional fields truly optional in schema?
- Fix: Test schema in isolation: `schema.parse(testData)`

### "Form not submitting"

- Check: Form validation passing (no red errors)?
- Check: Submit button enabled (not disabled)?
- Check: onSubmit handler registered on Form?
- Fix: Check browser console for JavaScript errors

## Related Documentation

- @bkp/business-rules/goal-business-rules.md - BR-009, BR-010, BR-011
- @bkp/types/goal.types.ts - Goal type interfaces
- @bkp/validation/goal.schemas.ts - Reference validation patterns
- 003-create-goal spec - Form patterns (CreateGoalForm can be extended)
- 005-complete-goal spec - Status transitions triggered by progress
