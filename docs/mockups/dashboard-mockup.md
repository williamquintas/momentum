# Dashboard Mockup - Momentum

## Overview

This document describes the UI mockup for the Momentum dashboard. The mockup shows a comprehensive multi-panel interface with four distinct views that demonstrate the key features and user experience of the application.

## Image Location

**File**: `dashboard-mockup.png` (or `.jpg` - to be placed in this directory)

> **Note**: The actual image file should be saved in this directory (`docs/mockups/`) for reference by agents and developers.

## Mockup Description

The mockup displays a multi-panel user interface for a goal/project tracking application, featuring four distinct dashboard views. The overall aesthetic is clean and modern, utilizing a consistent color palette of blues, greens, oranges, and reds to denote status, progress, and priority.

### Panel 1: Goals Tracking Dashboard (Top-Left)

**Header Elements:**

- Title: "Goals Tracking"
- Navigation tabs: "Dashboard", "Calendar", "Analytic"
- Icons: Search, notification bell, user profile

**Dashboard Overview Metrics:**

- **Total Goals**: 24
- **Completed**: 12
- **Due Soon**: 3
- **Overdue**: 2 (highlighted in red)

**Overall Progress:**

- Horizontal progress bar showing "65%" completion

**Goals Due Soon Section:**

1. "Launch Marketing Campaign" - "In 5 days" (orange tag)
2. "Save $5,000" - "Overdue" (red tag)
3. "Read 20 Books This Year" - "Overdue by 4 days" (red tag)

**Recent Achievements (Right Column):**

- "Lost 5 lbs" (64% progress)
- "AWS Certification Completed" (64% progress)
- "Bevery Progress" (64% progress)

**Top Goal Categories (Right Column):**

- Bar chart displaying various goal categories with colored bars

**Weekly Progress (Bottom Section):**

- Bar chart showing progress over days of the week
- Y-axis indicating percentages (10%, 20%, 30%)

### Panel 2: Goals List (Top-Right)

**Header Elements:**

- Title: "Goals List"
- Dropdown filters: "All Goals", "Status", "Priority", "Category"
- Search input field
- Icons: Search, notification bell, user profile

**Goal Table Columns:**

- Goal
- Status
- Priority
- Progress
- Deadline
- Assignee

**Sample Goals in Table:**

1. **"Lose 10 Pounds"**
   - Status: "In Progress" (orange tag)
   - Priority: High (green bar)
   - Progress: 50%
   - Deadline: Aug 30, 2022
   - Assignee: [icon]

2. **"Learn Spanish"**
   - Status: "In Progress" (green tag)
   - Priority: High (green bar)
   - Deadline: Jun 29
   - Assignee: [icon]

3. **"Save $5,000"**
   - Status: "High" (red tag)
   - Priority: High (green bar)
   - Progress: 64%
   - Deadline: Jun 23
   - Assignee: [icon]

4. **"Complete AWS Certification"**
   - Status: "Completed" (blue tag)
   - Priority: Medium (blue bar)
   - Deadline: Jul 23, 2022
   - Assignee: [icon]

5. **"Visit 5 New Countries"**
   - Status: "Progress" (orange tag)
   - Priority: Medium (blue bar)
   - Progress: 3/5
   - Deadline: Jul 31, 2022
   - Assignee: [icon]

**Top Goal Categories (Bottom Section):**

- Bar chart with y-axis showing percentages (10%, 25%, 35%, 50%)

### Panel 3: Goal Detail - Build Mobile App (Bottom-Left)

**Header Elements:**

- Title: "Goal Detail - Build Mobile App"
- Icons: Search, notification bell, user profile

**Progress Section:**

- "Progress 65%" with horizontal progress bar
- "Due Date: Aug 30, 2022"

**Milestones (Vertical Timeline):**

1. **"Design"** - Completed (green checkmark, green progress bar)
2. **"Development"** - "In Progress" (blue tag, blue progress bar)
3. **"Testing"** - Not started (unchecked)
4. **"Launch"** - Not started (unchecked)

**Notes Section (Right Column):**

- Two text boxes containing example notes related to the project

**Attachments Section (Right Column):**

- "Wireframe.png" (blue file icon)
- "Project Plan.pdf" (red file icon)

**Activity Section (Bottom):**

- Recent activities with user profile icons:
  - "John marked Design phase as complete."
  - "John started [activity]."

**Action Buttons (Bottom Left):**

- "Details" (or "Edit") button
- "Comment" button

### Panel 4: Reports & Analytics (Bottom-Right)

**Header Elements:**

- Title: "Reports & Analytics"
- Dropdown filters: "Metrics", "Reports"
- Icons: Search, notification bell, user profile

**Key Metrics:**

- **Completion Rate**: 72%
- **Avg. Time to Complete**: 18 days
- **Goals Overdue**: 4 (highlighted in red)
- **Top Category**: Health & Fitness (green tag)

**Completion Trend:**

- Line graph showing two trend lines (blue and red) over several months
- X-axis: Months (Jun, Feb, Mar, Apr, May, Jun, Jul, Aug)
- Y-axis: Percentages (10%, 40%, 65%, 80%)

**Top Priority Trend:**

- Bar chart showing distribution of goals by priority levels
- X-axis: Priority levels ("High", "Medium", "Low")
- Y-axis: Percentages (10%, 20%, 25%)

**Goal Type Distribution (Right Column):**

- Pie chart with four slices:
  - Green: "Quantitative 45%"
  - Purple: "Qualitative 25%"
  - Red: "Milestone" (~25%)
  - Yellow: (~5%, unlabeled)

**Goals by Priority (Bottom Section):**

- Bar chart showing distribution of goals by priority
- X-axis: Priority levels ("High", "Medium", "Low")
- Y-axis: Percentages (10%, 20%)

## Design Elements

### Color Scheme

- **Blue**: Completed status, medium priority, progress indicators
- **Green**: Completed milestones, positive metrics, high priority
- **Orange**: In progress status, warnings, due soon indicators
- **Red**: Overdue items, high priority alerts, errors

### UI Components Identified

- Progress bars (horizontal and vertical)
- Status tags/badges
- Priority indicators (colored bars)
- Data tables with sorting/filtering
- Charts (bar charts, line graphs, pie charts)
- Timeline/milestone views
- File attachment lists
- Activity feeds
- Metric cards/KPIs
- Navigation tabs
- Search and filter controls

## Key Features Demonstrated

1. **Dashboard Overview**: Quick metrics and progress visualization
2. **Goal List Management**: Table view with filtering and sorting
3. **Goal Detail View**: Milestone tracking, notes, attachments, activity
4. **Analytics & Reporting**: Comprehensive metrics and trend analysis

## Usage for Development

This mockup serves as a reference for:

- UI/UX design implementation
- Component structure and layout
- Color scheme and theming
- Data visualization requirements
- User flow and navigation patterns
- Feature prioritization

## Related Documentation

- [UI Component Guidelines](../../.cursor/rules/ui-component-guidelines.md)
- [Feature Specifications](../../specs/features/goal-features.md)
- [Architecture Documentation](../../specs/diagrams/architecture/)
