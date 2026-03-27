# Quick Start: Create Goal

**Feature**: Create Goal | **Date**: 2026-03-22
**Purpose**: Developer guide for implementing and testing the create goal feature

## Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- React 18.2.0
- TypeScript 5.3.3
- Ant Design 5.12.8
- Zod 3.x (for validation)

## Installation

### Dependencies

```bash
# Verify Zod is installed
npm list zod

# If not installed:
npm install zod
```

### Development Setup

```bash
# Clone and setup the project
git checkout 003-create-goal
npm install

# Start development server
npm run dev

# Run tests
npm run test -- --testPathPattern=goals

# Type checking
npm run type-check
```

## Basic Usage

### 1. Import Components and Hooks

```typescript
import { CreateGoalForm } from '@/features/goals/components/CreateGoalForm';
import { useCreateGoal } from '@/features/goals/hooks/useCreateGoal';
import { GoalType } from '@/features/goals/types';
```

### 2. Add Form to Page

```typescript
export const CreateGoalPage: React.FC = () => {
  const navigate = useNavigate();
  const { createGoal, isLoading, error } = useCreateGoal();

  const handleSubmit = async (input: CreateGoalInput) => {
    try {
      const goal = await createGoal(input);
      navigate(`/goals/${goal.id}`);
    } catch (err) {
      console.error('Creation failed:', err);
    }
  };

  return (
    <div className="create-goal-page">
      <h1>Create New Goal</h1>
      <CreateGoalForm onSubmit={handleSubmit} isLoading={isLoading} />
      {error && <Alert type="error" message={error} />}
    </div>
  );
};
```

### 3. Validation Examples

```typescript
// Quantitative goal validation
const quantInput: CreateGoalInput = {
  title: 'Lose 20 pounds',
  type: GoalType.QUANTITATIVE,
  startValue: 200,
  targetValue: 180,
  currentValue: 200,
  unit: 'pounds',
  allowDecimals: false,
  // ... other fields
};

// Validate with Zod schema
import { validateGoal } from '@/features/goals/utils/goalValidation';
const errors = validateGoal(quantInput);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}
```

### 4. Type-Specific Field Examples

```typescript
// Milestone goal with dependencies
const milestoneInput: CreateGoalInput = {
  title: 'Complete Project',
  type: GoalType.MILESTONE,
  milestones: [
    { id: '1', title: 'Design', order: 1 },
    { id: '2', title: 'Development', order: 2, dependencies: ['1'] },
    { id: '3', title: 'Testing', order: 3, dependencies: ['2'] },
  ],
  // ... other fields
};

// Recurring goal with frequency
const recurringInput: CreateGoalInput = {
  title: 'Weekly Review',
  type: GoalType.RECURRING,
  recurrence: {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [0, 3, 5], // Sunday, Wednesday, Friday
  },
  // ... other fields
};

// Habit goal
const habitInput: CreateGoalInput = {
  title: 'Morning Exercise',
  type: GoalType.HABIT,
  targetFrequency: 'daily',
  // ... other fields
};
```

### 5. Storage Integration

```typescript
import { goalStorageService } from '@/services/storage/goalStorageService';

// Create and persist
const goal = await goalStorageService.createGoal(input);

// Verify in Local Storage
const savedGoal = await goalStorageService.getGoal(goal.id);
console.log('Goal saved:', savedGoal);
```

## Testing

### Run Tests

```bash
# All goal tests
npm run test -- --testPathPattern=goals

# Specific test file
npm run test -- src/__tests__/features/goals/CreateGoalForm.test.tsx

# Watch mode
npm run test -- --watch
```

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateGoalForm } from '@/features/goals/components/CreateGoalForm';

describe('CreateGoalForm', () => {
  it('should create a quantitative goal', async () => {
    const mockSubmit = vi.fn();
    render(<CreateGoalForm onSubmit={mockSubmit} />);

    // Select type
    fireEvent.click(screen.getByText('Quantitative'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'My Goal' },
    });

    // Submit
    fireEvent.click(screen.getByText('Create'));

    // Verify
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'My Goal',
        type: 'quantitative',
      }));
    });
  });
});
```

## Configuration

### Business Rules

All validation rules from @bkp/business-rules/goal-business-rules.md are enforced:

- **BR-001**: Title 1-200 characters
- **BR-002**: One goal type required
- **BR-003**: Default status 'active'
- **BR-004**: Category required
- **BR-005**: Quantitative fields required
- **BR-006**: Milestone minimum 1
- **BR-007**: Recurring config required
- **BR-008**: Habit frequency required

### Storage

Validation schemas from @bkp/validation/goal.schemas.ts

## Troubleshooting

### Form Not Loading

- Check if CreateGoalForm component imports are correct
- Verify Ant Design is installed and configured

### Validation Errors

- Review business rules in spec.md
- Check error messages in browser console
- Ensure all required fields are filled

### Storage Issues

- Check Local Storage quota (max 5-10MB)
- Clear old data if quota exceeded
- Verify goalStorageService is initialized

## Next Steps

- Implement type-specific components
- Add tests for each goal type
- Integrate with goal detail page
- Add progress tracking features (004-update-goal-progress)
