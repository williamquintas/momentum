# Research: Update Goal Progress

## Technical Decision Log

### Decision 1: Form Architecture - Single Form vs. Type-Specific Forms
**Status**: ACCEPTED

**Options**:
1. Single unified `ProgressUpdateForm` with type-aware field rendering
2. Separate forms for each goal type (`QuantitativeProgressForm`, `QualitativeProgressForm`, etc.)

**Decision**: Option 1 - Single unified form with conditional rendering

**Rationale**:
- **Code Reuse**: Common elements (notes, timestamp, submit button) not duplicated
- **Consistent UX**: Same interface regardless of goal type
- **Easier to Extend**: Adding new goal type requires minimal changes
- **Simpler Navigation**: Single component in detail page, easier to locate

**Trade-offs**:
- Form component becomes larger (~200-300 lines)
- Conditional rendering with 6+ branches (complexity)
- Testing requires all type scenarios
- Mitigation: Extract fields to separate components, clear type discrimination

**Implementation**:
```typescript
export const ProgressUpdateForm: React.FC<ProgressUpdateFormProps> = ({ goal }) => {
  const renderTypeField = () => {
    switch (goal.type) {
      case 'quantitative':
        return <QuantitativeProgressField goal={goal} />;
      case 'qualitative':
        return <QualitativeProgressField goal={goal} />;
      // ... etc
    }
  };
  
  return (
    <Form>
      <Form.Item>{renderTypeField()}</Form.Item>
      <NotesField />
      <Button>Update</Button>
    </Form>
  );
};
```

### Decision 2: Progress History Storage - Immutable Append Log vs. Current Value Only
**Status**: ACCEPTED

**Options**:
1. Store all progress updates in immutable append-only log, recalculate current progress
2. Store only current progress value, overwrite on each update
3. Store both (current value + history for analytics)

**Decision**: Option 1 - Immutable append-only log with calculated current progress

**Rationale**:
- **Auditability**: Complete history for tracking changes over time
- **Analytics**: Data for progress charts and trends
- **Undo/Redo**: Foundation for future features
- **Data Integrity**: No lost updates, clear timestamp trail

**Trade-offs**:
- Larger storage footprint (history vs. just current value)
- Requires calculation to get current progress (vs. direct lookup)
- Complexity of duplicate detection

**Mitigation**:
- Cache current progress (O(1) lookup after first calculation)
- Periodic history archival to keep storage bounded
- Efficient duplicate detection (timestamp + value within 1-minute window)

**Implementation**:
```typescript
// Store structure
interface ProgressHistory {
  [goalId: string]: ProgressUpdate[]; // Immutable array
}

// Getter with caching
export function getCurrentProgress(goalId: string): number {
  const cache = progressCache.get(goalId);
  if (cache && !isStale(cache.lastUpdated)) {
    return cache.value;
  }
  
  const history = progressHistory[goalId] || [];
  const current = recalculateFromHistory(history);
  progressCache.set(goalId, { value: current, lastUpdated: now() });
  return current;
}
```

### Decision 3: Validation Strategy - Zod with Custom Validators vs. Imperative Validation
**Status**: ACCEPTED

**Options**:
1. Use Zod schemas with custom refinements for business logic
2. Imperative validation functions checking all constraints manually
3. Hybrid: Zod for type safety, separate business rule validators

**Decision**: Option 1 - Zod with custom refinements

**Rationale**:
- **Type Safety**: Zod infers types automatically
- **Composability**: Can nest schemas for complex validations
- **Error Messages**: Built-in localization support
- **Consistency**: Single source of truth for validation rules

**Trade-offs**:
- Learning curve for Zod advanced features
- Custom refinements can become complex

**Implementation**:
```typescript
export const quantitativeUpdateSchema = z.object({
  goalId: z.string().uuid(),
  currentValue: z.number()
    .min(0, 'Value cannot be negative')
    .refine(
      (val) => val <= goal.targetValue, 
      'Cannot exceed target value'
    ),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => !isDuplicateUpdate(data.goalId, data),
  'Update too similar to previous (within 1 minute)'
);
```

### Decision 4: Progress Calculation - Type-Safe Utilities vs. Generic Formula Engine
**Status**: ACCEPTED

**Options**:
1. Type-specific calculation functions per goal type
2. Single polymorphic `calculateProgress(update, goal)` function
3. Rule engine with formula definitions

**Decision**: Option 1 - Type-specific functions

**Rationale**:
- **Clarity**: Each formula explicitly defined, easy to understand
- **Testing**: Unit test each formula independently
- **Type Safety**: No runtime type checking needed
- **Debugging**: Clear error messages per type

**Trade-offs**:
- More code (6 functions instead of 1)
- Slight duplication in formula structure

**Implementation**:
```typescript
// One function per type
export function calculateQuantitativeProgress(
  startValue: number,
  currentValue: number,
  targetValue: number
): number {
  const denominator = targetValue - startValue;
  if (denominator === 0) return 100;
  
  const progress = ((currentValue - startValue) / denominator) * 100;
  return Math.max(0, Math.min(100, progress));
}

export function calculateMilestoneProgress(
  completedCount: number,
  totalCount: number
): number {
  if (totalCount < 1) throw new Error('Minimum 1 milestone required');
  return (completedCount / totalCount) * 100;
}
```

### Decision 5: Form State Management - React Form + Zustand vs. React Form Only
**Status**: ACCEPTED

**Options**:
1. Use Ant Design Form with local component state only
2. Store progress updates globally in Zustand (all updates shared)
3. Hybrid: Local form state for editing, Zustand for persistence

**Decision**: Option 3 - Hybrid approach

**Rationale**:
- **Separation of Concerns**: Form state separate from app state
- **Performance**: Local state doesn't trigger global updates during typing
- **Simplicity**: Zustand only involved on submit
- **Testability**: Form behavior testable without Zustand mocking

**Trade-offs**:
- Small state duplication (form state vs. final update)
- Two sources of truth (mitigated by clear responsibilities)

**Implementation**:
```typescript
// Form: local state during editing
const [form] = Form.useForm<ProgressUpdateFormData>();

// On submit: move to Zustand
const handleSubmit = async (data: ProgressUpdateFormData) => {
  const update = transformFormDataToUpdate(data);
  await progressStore.addUpdate(goalId, update);
};
```

### Decision 6: Error Recovery - Abort on Error vs. Partial Success vs. Optimistic Updates
**Status**: ACCEPTED (Abort on Error for MVP)

**Options**:
1. Abort entire update if validation fails
2. Partial success (store update even if goal.progress update fails)
3. Optimistic update (update UI immediately, persist in background)

**Decision**: Option 1 - Abort on error (MVP), upgrade to Option 3 later

**Rationale**:
- **Safety**: No half-committed state
- **Simplicity**: Easier to understand and test
- **Correctness**: Data consistency guaranteed

**Trade-offs**:
- UI feels slower (wait for confirmation)
- Users cannot "undo" if they make mistake

**Future**: Can implement optimistic updates in Phase 2 with rollback capability

## Research Findings

### Progress Calculation Formula References
- **Quantitative BR-009**: `((current - start) / (target - start)) * 100`
  - Source: @bkp/business-rules/progress-calculation-rules.mmd
  - Validated in tests: test-specs.md
  
- **Milestone BR-010**: `(completed / total) * 100`
  - Requires ≥1 milestone
  - No cyclic dependencies allowed
  
- **Binary BR-011**: `(achieved ? 100 : 0)`
  - Simple on/off toggle
  - No intermediate states

### Form Library Comparison
| Library | Pros | Cons | Choice |
|---------|------|------|--------|
| React Hook Form | Lightweight, small bundle | Less built-in validation | Considered |
| Ant Design Form | Rich components, validation | Larger bundle | ✅ CHOSEN |
| Formik | Well-established | Older, less TypeScript support | Considered |

**Choice Rationale**: Momentum already uses Ant Design; using Form component provides consistency, pre-built input types (number, date), and validation integration.

### State Management Patterns Review
| Approach | Pros | Cons | Choice |
|----------|------|------|--------|
| Local component state | Simple, no boilerplate | Hard to share, test | For form editing only |
| Redux | Predictable, DevTools | Verbose boilerplate | Not chosen |
| Zustand | Minimal, flexible | Less structure | ✅ CHOSEN for persistence |
| Context API | Built-in, flexible | Performance issues at scale | Not chosen |

**Choice Rationale**: Zustand already used in Momentum; minimal boilerplate for progress store, easy to test with `getState()`.

### Storage Strategy Comparison
| Strategy | Pros | Cons | Choice |
|----------|------|------|--------|
| LocalStorage only | No backend needed, works offline | Limited storage (~5-10MB) | ✅ CHOSEN (MVP) |
| IndexedDB | Larger storage, better querying | More complex API | Future |
| Backend API | Unlimited, sync across devices | Requires backend, complexity | Future |

**Choice Rationale**: MVP targets offline-first, single-device operation; LocalStorage sufficient for typical goal tracking volume.

### Duplicate Detection Strategy
**Options**:
1. Exact match (timestamp + value + notes)
2. Value + timewindow (within 1 minute, same value)
3. Warn user but allow duplicates

**Decision**: Option 2 - Value + timewindow

**Rationale**:
- Prevents accidental double-submissions
- Allows legitimate updates of same value (e.g., daily habit tracking)
- Window of 1 minute is user-perceivable time

**Implementation**:
```typescript
function isDuplicate(goalId: string, update: ProgressUpdate): boolean {
  const lastUpdate = getLastUpdate(goalId);
  if (!lastUpdate) return false;
  
  const timeDiff = update.timestamp - lastUpdate.timestamp;
  const sameValue = update.currentValue === lastUpdate.currentValue;
  
  return sameValue && timeDiff < 60000; // 1 minute window
}
```

## Type Safety Audit

- ✅ All ProgressUpdate types discriminated by `type` property
- ✅ Type guards provided for runtime narrowing
- ✅ Zod schemas ensure runtime validation
- ✅ No `any` types in interface definitions
- ✅ Goal.progress: number (always valid percentage or 0)
- ✅ Calculation functions: (inputs: number) => number (no side effects)

## Performance Baseline

| Operation | Target | Notes |
|-----------|--------|-------|
| Form submission | <500ms | Includes validation + storage |
| Progress recalculation | <100ms | For 100+ updates in history |
| Form render | <50ms | Type-conditional fields |
| Duplicate detection | <10ms | Using Map lookup |

## Security Considerations

1. **Input Validation**: All Zod schemas validate before processing
2. **XSS Prevention**: Rich text sanitized (use `react-quill` with default sanitization)
3. **Timestamp Validation**: Reject updates with future timestamps
4. **Goal Ownership**: Verify user owns goal before accepting update (future work)
5. **Storage Quota**: Monitor localStorage usage, implement cleanup

## Testing Strategy

**Unit Tests**: Formula functions, validation logic, type guards (95%+ coverage)
**Component Tests**: Form rendering, field validation, error display
**Integration Tests**: Full workflow (form → validation → store → localStorage → UI update)
**Edge Cases**:
- Zero-target quantitative goals
- Single-milestone goals
- Rapid duplicate submissions
- Long history (100+ updates)
- Storage quota exceeded
