---
description: 'Task list for PWA Support feature implementation'
---

# Tasks: PWA Support

**Input**: Design documents from `/specs/020-pwa-support/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: TDD approach requested - tests written before implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic PWA dependencies

- [x] T001 [P] Install vite-plugin-pwa dependency in package.json
- [x] T002 [P] Create PWA icons directory structure in public/icons/
- [x] T003 Create 192x192 icon for PWA in public/icons/icon-192.svg
- [x] T004 Create 512x512 icon for PWA in public/icons/icon-512.svg

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core PWA configuration that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Configure vite-plugin-pwa in vite.config.ts with manifest settings
- [x] T006 Define PWA manifest configuration (name, short_name, theme_color, icons)
- [x] T007 Setup service worker with cache-first strategy for static assets
- [x] T008 Configure workbox for offline caching of application shell
- [x] T009 Register service worker in src/main.tsx
- [x] T010 Enable PWA in development mode for testing

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Install App as PWA (Priority: P1) 🎯 MVP

**Goal**: Users can install the Momentum app as a standalone PWA on their devices

**Independent Test**: User can complete installation flow and launch installed app; app appears in device's app list

### Tests for User Story 1 (TDD) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Unit test for usePwaInstall hook in src/**tests**/hooks/usePwaInstall.test.ts
- [x] T012 [P] [US1] Unit test for PwaInstallButton component in src/**tests**/components/PwaInstallButton.test.tsx
- [ ] T013 [US1] Integration test for PWA install flow in src/**tests**/pwa/installFlow.test.tsx

### Implementation for User Story 1

- [x] T014 [P] [US1] Create usePwaInstall hook in src/hooks/usePwaInstall.ts
- [x] T015 [US1] Implement beforeinstallprompt event listener in usePwaInstall hook
- [x] T016 [US1] Add installPrompt deferredPrompt state management
- [x] T017 [US1] Create PwaInstallButton component in src/components/common/PwaInstallButton/PwaInstallButton.tsx
- [x] T018 [US1] Add handleInstall function to trigger app installation
- [x] T019 [US1] Style PwaInstallButton with appropriate icon and text

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Use App Offline (Priority: P1)

**Goal**: Users can access the app without internet connection

**Independent Test**: User can disable network and still load the app from cache

### Tests for User Story 2 (TDD) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T020 [P] [US2] Unit test for OfflineIndicator component in src/**tests**/components/OfflineIndicator.test.tsx

### Implementation for User Story 2

- [x] T021 [P] [US2] Configure workbox runtime caching for API responses
- [x] T022 [P] [US2] Setup offline fallback page or message
- [x] T023 [US2] Create offline indicator component in src/components/common/OfflineIndicator/OfflineIndicator.tsx
- [x] T024 [US2] Implement navigator.onLine detection
- [x] T025 [US2] Add online/offline event listeners for network state

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Automatic Updates (Priority: P2)

**Goal**: App automatically updates when new version is released

**Independent Test**: New version deployed; app detects update, downloads it, and notifies user

### Tests for User Story 3 (TDD) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T026 [P] [US3] Unit test for UpdateToast component in src/**tests**/components/UpdateToast.test.tsx

### Implementation for User Story 3

- [x] T027 [P] [US3] Configure update notification in vite-plugin-pwa settings
- [x] T028 [US3] Implement update available detection in service worker
- [x] T029 [US3] Create UpdateToast component in src/components/common/UpdateToast/UpdateToast.tsx
- [x] T030 [US3] Add skipWaiting and clients.claim configuration
- [x] T031 [US3] Implement "Update Available" notification UI with reload action
- [x] T032 [US3] Add version tracking for update detection

**Checkpoint**: User Stories 1, 2, AND 3 should work independently

---

## Phase 6: User Story 4 - Accessible Install Button (Priority: P2)

**Goal**: Install button is visible in the header for easy access

**Independent Test**: User can locate and click install button in header within 3 seconds

### Tests for User Story 4 (TDD) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T033 [P] [US4] Integration test for Header with PwaInstallButton in src/**tests**/components/HeaderPwa.test.tsx

### Implementation for User Story 4

- [x] T034 [US4] Add PwaInstallButton to Header component in src/components/layout/Header/Header.tsx
- [x] T035 [US4] Position install button appropriately in header layout
- [x] T036 [US4] Add hideInstallButton logic when app is already installed
- [x] T037 [US4] Style header to accommodate install button without breaking layout

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T038 [P] Test PWA functionality across different browsers (Chrome, Edge, Firefox, Safari)
- [ ] T039 [P] Verify offline functionality with Chrome DevTools
- [ ] T040 Run Lighthouse PWA audit and fix any failing items
- [ ] T041 Update README.md with PWA installation instructions
- [ ] T042 Verify all success criteria from spec.md are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 completion (uses PwaInstallButton component)

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- US1 and US2 can be worked on in parallel after Foundational phase
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example

```bash
# After Phase 2 completes, these can run in parallel:
Task: "Implement User Story 1 - Install App as PWA"
Task: "Implement User Story 2 - Use App Offline"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 4 (related)
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
