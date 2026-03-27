# Research: Goal Type Tooltips

## Overview

Research findings for implementing tooltips in the Goal Type dropdown to help users understand each goal type.

## Technology Selection

### Ant Design Tooltip

**Decision**: Use Ant Design's built-in Tooltip component
**Rationale**:

- Already integrated in the project (Ant Design 5.12.8)
- Supports mouseenter/mouseleave on desktop
- Supports click/tap on mobile via `trigger="click"`
- Accessible out of the box with proper ARIA attributes
- Consistent styling with existing UI

### Alternative Approaches Considered

1. **Custom tooltip component** - Rejected: More code to maintain, inconsistent with Ant Design
2. **Modal help dialog** - Rejected: Requires additional user action, slower than inline tooltips
3. **Inline help text** - Rejected: Clutters the form, less discoverable

## Implementation Strategy

### Option A: Label Tooltip (Recommended)

Wrap the "Goal Type" label with a Tooltip that explains the concept and provides general guidance.

```tsx
<Form.Item>
  <Tooltip title="Each goal type has different tracking methods. Hover over options for details.">
    <span>Goal Type</span>
  </Tooltip>
</Form.Item>
```

### Option B: Option Tooltips

Add Tooltip to each Select.Option. This shows specific help for each type when hovering the dropdown items.

```tsx
<Option value={GoalType.QUANTITATIVE}>
  <Tooltip title="Track numeric progress from start to target">Quantitative</Tooltip>
</Option>
```

### Recommendation

Use **Option B** (Option Tooltips) combined with an info icon next to the label. This provides:

- Contextual help for each goal type at the point of decision
- Consistent with UX best practices for form labels
- Works on both desktop (hover) and mobile (tap when using trigger="click")

## Accessibility Considerations

- Tooltips must be keyboard accessible (Ant Design Tooltip supports this)
- Use `trigger="click"` for mobile compatibility
- Ensure sufficient color contrast (per Constitution WCAG 2.1 AA)
- Screen reader support via aria-describedby

## Related Resources

- Ant Design Tooltip: https://ant.design/components/tooltip
- WCAG 2.1 Success Criterion 1.4.13 (Content on Hover or Focus)
