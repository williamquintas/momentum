# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add informative tooltips to the Goal Type dropdown in the goal creation form. Each tooltip explains what the goal type is, when to use it, and provides a concrete example. Uses Ant Design's Tooltip component to display help text on hover/tap.

## Technical Context

**Language/Version**: TypeScript 5.3.3  
**Primary Dependencies**: React 18.2.0, Ant Design 5.12.8, Zustand 4.4.7, React Query 5.17.9, Zod 3.22.4  
**Storage**: IndexedDB (via storage service layer)  
**Testing**: Vitest  
**Target Platform**: Web browser (SPA)  
**Project Type**: Web application  
**Performance Goals**: Initial page load < 1.5s (per Constitution)  
**Constraints**: WCAG 2.1 AA accessibility required  
**Scale/Scope**: Single page, 6 goal types, tooltip UI only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                              | Status | Notes                                                             |
| --------------------------------- | ------ | ----------------------------------------------------------------- |
| Tests required for new features   | PASS   | Vitest available; tooltip component needs unit tests              |
| Accessibility (WCAG 2.1 AA)       | PASS   | Tooltips must be keyboard accessible; Ant Design Tooltip supports |
| TypeScript strict mode            | PASS   | Project uses strict: true                                         |
| No implementation details in spec | PASS   | Spec is technology-agnostic                                       |

## Project Structure

### Documentation (this feature)

```text
specs/019-goal-type-tooltips/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/goals/
│   ├── components/
│   │   └── GoalForm/
│   │       └── GoalForm.tsx    # Main target: add tooltip to goal type dropdown
│   ├── types/
│   │   └── goal.types.ts       # GoalType enum definitions
│   └── utils/
│       └── validation.ts       # Zod validation schemas
├── components/common/          # Shared reusable components
├── hooks/                      # Global custom hooks
├── store/                      # Zustand stores
├── services/                   # API/storage services
├── types/                      # Global types
└── theme/                      # Ant Design theme config

tests/
├── unit/                       # Unit tests (Vitest)
├── integration/                # Integration tests
└── e2e/                        # End-to-end tests (optional)
```

**Structure Decision**: React SPA with Ant Design components. Feature modifies GoalForm.tsx in src/features/goals/components/GoalForm/ to add tooltip help to goal type dropdown. No backend changes needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
