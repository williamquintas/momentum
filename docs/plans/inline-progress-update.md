---
plan name: inline-progress-update
plan description: Inline progress update in list
plan status: done
---

## Idea

Add clickable progress display on GoalCard and GoalList that opens a compact quick modal to update progress without navigating to goal detail

## Implementation

- 1. Create QuickProgressModal - simplified modal with just current value input for each goal type
- 2. Add onProgressClick prop to GoalCard component and make progress display clickable
- 3. Add onProgressClick prop to GoalList component and wire to table Progress column
- 4. Integrate useUpdateProgress hook for quick progress updates
- 5. Add optimistic UI feedback during update (immediate progress bar update)
- 6. Test both GoalCard and GoalList table view interactions
- 7. Verify accessibility - keyboard navigation to progress element

## Required Specs

<!-- SPECS_START -->
<!-- SPECS_END -->
