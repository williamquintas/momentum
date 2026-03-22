# Research: Create Goal Implementation

**Feature**: Create Goal | **Date**: 2026-03-22
**Research Focus**: Form patterns, validation approaches, state management, and goal type handling

## Research Findings

### Form Handling Best Practices
- **Ant Design Form**: Provides built-in validation, field management, and error display
- **React Hook Form**: Lightweight alternative, good performance for complex forms
- **Formik**: Mature solution, good for complex validation scenarios
- **Decision**: Use Ant Design Form for consistency with existing UI patterns

### Validation Strategies
- **Zod**: Type-safe, matches existing @bkp/validation/ patterns, good TypeScript support
- **Yup**: Popular, good error messages, slightly more verbose
- **VeeValidate**: Vue-focused, not recommended for React
- **Decision**: Continue with Zod per existing codebase patterns

### State Management for Forms
- **React Local State**: Simple for single forms, limited reusability
- **Zustand**: Matches existing setup, lightweight
- **Redux**: Overkill for form state, complex
- **Decision**: Use React local state + Zustand for creation context

### Goal Type Handling
- **Single Form with Conditionals**: Reduces duplication, maintains flow
- **Multiple Forms per Type**: More isolated, harder to maintain
- **Separate Pages per Type**: Best UX but increases navigation complexity
- **Decision**: Single form with conditional type-specific fields

### Milestone Dependency Validation
- **Cycle Detection**: Use graph traversal (DFS/BFS)
- **Libraries**: vis-data has cycle detection, but can add custom logic
- **Decision**: Implement custom cycle detection in validation utils

### Error Messages
- **Field-Level**: Show inline under each field
- **Form-Level**: Show at top or in summary
- **Toast Notifications**: Good for async errors
- **Decision**: Combine field-level + form-level errors

## Technical Decisions

### Decision 1: Form Component Strategy
**Choice**: Single CreateGoalForm with conditional type-specific field rendering  
**Rationale**:
- Reduces code duplication across form variants
- Maintains consistent user experience flow
- Easier to implement shared features (title, priority, category, etc.)
- Alternative (separate forms per type) would duplicate too much logic

**Alternatives Considered**:
- Separate forms per goal type: More isolated but 6x duplication
- Wizard pattern: Good for complex multi-step, not needed here
- Dynamic form builder: Over-engineered for this use case

### Decision 2: Validation Approach
**Choice**: Zod schemas with type guards per goal type  
**Rationale**:
- Matches existing @bkp/validation/goal.schemas.ts patterns
- Type-safe with TypeScript integration
- Reusable across components and tests
- Clear error messages

**Alternatives Considered**:
- Yup: Good but less type-safe than Zod
- Custom validation functions: No reusability, error-prone

### Decision 3: State Management
**Choice**: React Form state + Zustand for creation context  
**Rationale**:
- React Form state: Handles field values, touched state, errors
- Zustand: Optional context for creation progress, side effects
- Aligns with existing patterns in codebase

**Alternatives Considered**:
- Redux: Too heavy for form state
- Context API alone: Overkill for single feature

### Decision 4: Milestone Dependencies
**Choice**: Implement custom cycle detection with depth-first search  
**Rationale**:
- Lightweight, no external dependencies needed
- Handles complex dependency graphs
- Clear error messages for users

**Alternatives Considered**:
- vis-data library: Heavier, more features than needed
- Simple parent-child check: Insufficient for complex dependencies

### Decision 5: Type-Specific Field Components
**Choice**: Separate component per goal type  
**Rationale**:
- Isolates type-specific logic
- Easier to test and maintain
- Cleaner component structure

**Alternatives Considered**:
- Inline in CreateGoalForm: Less maintainable, complex conditionals

## Performance Considerations

- Form should load in < 1 second
- Validation should complete in < 500ms
- Storage should persist in < 200ms
- Large milestone arrays (50+ items) may need virtualization

## Accessibility

- All form fields must be keyboard navigable
- ARIA labels for all inputs
- Error messages must be associated with fields
- Color should not be the only indicator of errors

## Testing Strategy

- Unit tests for validation rules
- Component tests for form rendering and interaction
- Integration tests for full creation flow
- E2E tests for user journeys (optional)

## Security Considerations

- Sanitize user input (title, description, notes)
- Validate all data server-side (if backend added)
- Prevent XSS via proper React escaping
- Ensure Local Storage doesn't exceed quota

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- All modern browsers with ES2020+ support
