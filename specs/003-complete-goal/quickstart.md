# Quickstart: Complete Goal

## Overview
This guide gets you developing the Complete Goal feature. Covers setup, development workflow, testing, and common completion scenarios.

## Prerequisites
- Node.js 18+ with npm/yarn
- TypeScript knowledge (advanced)
- Zustand and React Form experience helpful
- Completed 001-create-goal and 002-update-goal-progress features

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
│   ├── CompleteGoalDialog.tsx          # Main completion dialog
│   ├── CompletionCriteriaDisplay.tsx   # Shows completion requirements
│   ├── CompletionMetricsPreview.tsx    # Shows final statistics
│   ├── CompletionSuccess.tsx           # Celebration component
│   └── celebrations/
│       ├── AchievementBadge.tsx        # Badge display
│       ├── CelebrationAnimation.tsx    # Animation wrapper
│       └── CelebrationToast.tsx        # Toast notifications
├── hooks/
│   ├── useCompletionDetection.ts       # Auto-detection hook
│   └── useAutomaticCompletion.ts       # Background monitoring
├── utils/
│   ├── completionValidation.ts         # Eligibility checks
│   ├── completionMetrics.ts            # Statistics calculation
│   ├── completionEligibility.ts        # Type-specific checks
│   └── celebrationEngine.ts            # Celebration system
├── types/
│   └── completion.ts                   # Completion interfaces
├── validation/
│   └── completionSchemas.ts            # Zod schemas
└── store/
    └── completionStore.ts              # Zustand store
```

## Development Workflow

### 1. Start with Completion Validation
```typescript
// src/features/goals/utils/completionValidation.ts
export function validateCompletionEligibility(goal: Goal): ValidationResult {
  if (goal.status !== 'active') {
    return { valid: false, reason: 'Goal is not active' };
  }

  switch (goal.type) {
    case 'quantitative':
      return goal.currentValue >= goal.targetValue
        ? { valid: true }
        : { valid: false, reason: 'Target not reached' };
    
    case 'binary':
      return goal.achieved
        ? { valid: true }
        : { valid: false, reason: 'Goal not achieved' };
    
    case 'milestone':
      const completed = goal.milestones.filter(m => m.completed).length;
      const total = goal.milestones.length;
      return completed === total
        ? { valid: true }
        : { valid: false, reason: `${completed}/${total} milestones completed` };
    
    default:
      return { valid: false, reason: 'Unsupported goal type' };
  }
}

// Test it
const goal = { type: 'quantitative', currentValue: 50, targetValue: 100 };
console.assert(!validateCompletionEligibility(goal).valid);
```

### 2. Create Completion Metrics Calculator
```typescript
// src/features/goals/utils/completionMetrics.ts
export function calculateCompletionMetrics(
  goal: Goal,
  history: ProgressUpdate[]
): CompletionMetrics {
  const totalTime = Date.now() - goal.createdAt;
  const totalUpdates = history.length;
  const averageProgressRate = goal.progress / (totalTime / (1000 * 60 * 60 * 24)); // per day

  return {
    totalTime,
    totalUpdates,
    averageProgressRate,
    // Add goal-specific metrics...
  };
}
```

### 3. Create Zustand Completion Store
```typescript
// src/features/goals/store/completionStore.ts
import { create } from 'zustand';
import type { CompletionEvent } from '../types/completion';

export const useCompletionStore = create<CompletionState>((set, get) => ({
  completions: new Map(),
  pendingCompletions: new Set(),
  
  completeGoal: async (goalId, options = {}) => {
    set({ loading: true });
    try {
      const goal = await getGoal(goalId);
      const validation = validateCompletionEligibility(goal);
      
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      const history = await getProgressHistory(goalId);
      const metrics = calculateCompletionMetrics(goal, history);
      
      const completion: CompletionEvent = {
        goalId,
        completedAt: Date.now(),
        completionType: options.manual ? 'manual' : 'automatic',
        finalProgress: goal.progress,
        metrics,
      };

      // Update goal status
      await updateGoalStatus(goalId, 'completed');
      
      // Store completion event
      set(state => ({
        completions: new Map(state.completions).set(goalId, completion),
      }));

      // Trigger celebration
      triggerCelebration(completion);
      
    } catch (err) {
      set({ error: err as Error });
    } finally {
      set({ loading: false });
    }
  },
}));
```

### 4. Build Completion Dialog Component
```typescript
// src/features/goals/components/CompleteGoalDialog.tsx
import { Modal, Button, Space, Divider } from 'antd';
import { useCompletionStore } from '../store/completionStore';
import { CompletionCriteriaDisplay } from './CompletionCriteriaDisplay';
import { CompletionMetricsPreview } from './CompletionMetricsPreview';

export const CompleteGoalDialog: React.FC<CompleteGoalDialogProps> = ({
  goal,
  open,
  onClose,
  onCompleted
}) => {
  const { completeGoal, loading } = useCompletionStore();

  const handleComplete = async () => {
    try {
      await completeGoal(goal.id, { manual: true });
      onCompleted?.();
      onClose();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Modal
      title="Complete Goal"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="complete"
          type="primary"
          loading={loading}
          onClick={handleComplete}
        >
          Complete Goal
        </Button>
      ]}
    >
      <CompletionCriteriaDisplay goal={goal} />
      <Divider />
      <CompletionMetricsPreview goal={goal} />
    </Modal>
  );
};
```

## Common Tasks

### Add Completion Button to Goal Detail Page
```typescript
// src/pages/GoalDetailPage.tsx
import { CompleteGoalDialog } from '../features/goals/components/CompleteGoalDialog';
import { useCompletionDetection } from '../features/goals/hooks/useCompletionDetection';

export const GoalDetailPage: React.FC = () => {
  const goal = useGoal(goalId);
  const { isEligible } = useCompletionDetection(goalId);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  return (
    <Layout>
      <GoalHeader goal={goal} />
      
      {isEligible && (
        <Button
          type="primary"
          onClick={() => setShowCompleteDialog(true)}
          style={{ marginBottom: 16 }}
        >
          🎉 Complete Goal
        </Button>
      )}
      
      <CompleteGoalDialog
        goal={goal}
        open={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onCompleted={() => {
          // Refresh goal data, show success message
        }}
      />
      
      <GoalContent goal={goal} />
    </Layout>
  );
};
```

### Test Completion Eligibility
```typescript
// In test file
import { validateCompletionEligibility } from '../utils/completionValidation';

describe('validateCompletionEligibility', () => {
  it('should validate quantitative goal completion', () => {
    const goal = {
      type: 'quantitative' as const,
      currentValue: 100,
      targetValue: 50,
      status: 'active' as const
    };
    
    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(true);
  });

  it('should reject incomplete quantitative goal', () => {
    const goal = {
      type: 'quantitative' as const,
      currentValue: 25,
      targetValue: 100,
      status: 'active' as const
    };
    
    const result = validateCompletionEligibility(goal);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Target not reached');
  });
});
```

### Implement Automatic Completion Detection
```typescript
// src/features/goals/hooks/useAutomaticCompletion.ts
import { useEffect } from 'react';
import { useCompletionDetection } from './useCompletionDetection';
import { useCompletionStore } from '../store/completionStore';

export function useAutomaticCompletion(goalId: string) {
  const { isEligible } = useCompletionDetection(goalId);
  const { completeGoal } = useCompletionStore();
  
  useEffect(() => {
    if (isEligible) {
      // Could show a prompt or auto-complete based on user preferences
      console.log('Goal is eligible for completion:', goalId);
    }
  }, [isEligible, goalId]);
}
```

### Add Celebration System
```typescript
// src/features/goals/utils/celebrationEngine.ts
export function getCelebrationForGoal(goal: Goal): CelebrationData {
  // Determine celebration type based on goal characteristics
  if (goal.progress >= 150) { // Overshot target
    return {
      type: 'achievement',
      message: 'Outstanding! You exceeded your goal!',
      badge: 'overachiever',
      animation: true,
      sound: true
    };
  }
  
  return {
    type: 'achievement',
    message: 'Congratulations on completing your goal!',
    animation: true
  };
}

export function triggerCelebration(celebration: CelebrationData) {
  // Show toast
  if (celebration.message) {
    showToast(celebration.message, 'success');
  }
  
  // Play sound
  if (celebration.sound) {
    playCelebrationSound();
  }
  
  // Show animation
  if (celebration.animation) {
    showCelebrationAnimation();
  }
}
```

## Testing Strategies

### Unit Test Completion Logic
```bash
npm test -- completionValidation.test.ts
# Test eligibility checks, metrics calculation, validation errors
```

### Component Test Completion Dialog
```bash
npm test -- CompleteGoalDialog.test.tsx
# Test dialog rendering, completion submission, error handling
```

### Integration Test Full Completion Flow
```bash
npm test -- completion-integration.test.ts
# Test: progress update → eligibility check → completion dialog → goal status change
```

## Debug Checklist

- [ ] Goal status is 'active' before completion attempt
- [ ] Completion eligibility validation passes
- [ ] Completion metrics calculated correctly
- [ ] Goal status changes to 'completed' after completion
- [ ] Completion event stored in localStorage
- [ ] Celebration triggered (check console for logs)
- [ ] UI updates to reflect completed state
- [ ] Progress updates blocked on completed goals

## Performance Considerations

- **Eligibility Checking**: Run on progress updates, debounce if needed
- **Metrics Calculation**: Pre-calculate and cache for display
- **Storage**: Completion events are small, minimal performance impact
- **Celebrations**: Load assets on demand, respect user preferences

## Security Notes

- Validate goal ownership before allowing completion
- Ensure completion events are immutable once created
- Prevent completion of already completed goals
- Sanitize celebration messages and user inputs

## Common Issues

### "Completion validation fails unexpectedly"
- Check: Goal status is 'active'
- Check: All completion criteria met for goal type
- Check: No circular dependencies in milestone goals
- Fix: Add debug logging to validation functions

### "Goal doesn't show as completable"
- Check: useCompletionDetection hook is used
- Check: Eligibility checking runs after progress updates
- Check: UI re-renders when eligibility changes
- Fix: Add console.log to eligibility checking

### "Completion dialog doesn't open"
- Check: Completion button renders when eligible
- Check: onClick handler calls setShowCompleteDialog(true)
- Check: Modal open prop connected to state
- Fix: Check React DevTools for state values

## Related Documentation
- @bkp/business-rules/goal-business-rules.md - BR-012, BR-013, BR-014
- @bkp/types/goal.types.ts - Goal status transitions
- 001-create-goal spec - Goal CRUD operations
- 002-update-goal-progress spec - Progress update patterns
- 006-goal-status-management spec - Status transition rules
