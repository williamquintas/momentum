---
plan name: inline-status-update
plan description: Inline status update in list
plan status: done
---

## Idea

Add clickable status tags on GoalCard and GoalList table that open a dropdown/modal to quickly change goal status without navigating to goal detail

## Implementation

- 1. Create StatusDropdown component for selecting new goal status (ACTIVE, COMPLETED, PAUSED, CANCELLED)
- 2. Add onStatusChange prop to GoalCard component and make status Tag clickable
- 3. Add onStatusChange prop to GoalList component and wire it to table Status column
- 4. Create useUpdateGoalStatus hook wrapping useUpdateGoal for status-only updates
- 5. Add loading state feedback during status change
- 6. Test both GoalCard and GoalList table view interactions
- 7. Verify accessibility - keyboard navigation, ARIA labels

## Required Specs

<!-- SPECS_START -->
<!-- SPECS_END -->
