---
name: momentum-ui-acceptance
description: Check affected Momentum screens for responsive UX, accessibility, localization and PWA behavior using available preview/browser capabilities and synthetic data.
---

# UI acceptance

Inputs: changed screens, acceptance criteria, available preview and browser tools.
All paths below are relative to the repository root.

## Procedure

1. Read relevant `AGENTS.md` UX rules, `.ai-assistant/rules/accessibility.md`,
   `.ai-assistant/rules/ui-component-guidelines.md` and scenarios in
   `docs/qa-exploratory-tests.md`. Use the actual changed UI as the scope.
2. Inspect the available environment before choosing tools. Do not assume Playwright,
   axe or a browser automation package is installed; use available capabilities.
   If execution is unavailable, report static findings and unverified criteria.
3. When running npm preview/build commands, follow `docs/dependency-maintenance.md`:
   approved personal installation, isolated from corporate configuration; no blocked
   global npm, corporate npm or policy bypass. Do not install browser tools implicitly.
4. Check representative mobile and desktop widths around the affected breakpoints.
   Verify navigation, 44px touch targets, primary action hierarchy, Settings-only
   import/export, loading/empty/error states and integer progress percentages.
5. Exercise keyboard navigation, focus visibility/return, accessible names, form
   error feedback, dark/light contrast and reduced motion where affected. Automated
   findings support, but do not replace, manual keyboard and visual evidence.
6. Check relevant languages and long text with existing locale resources; validate
   translation keys using `npm run validate:translations` when available.
7. For PWA changes, test a production build in an isolated browser profile: offline
   behavior, refresh, update and retained synthetic goals. Development service-worker
   behavior is not evidence of the production update path. Clean only fixtures and
   caches belonging to this test profile, never the user's browser storage.

## Result and boundary

Report tested revision, viewport/theme/locale, journey, result and relevant visual
or browser evidence; identify checks not run and why. Use only synthetic data.
Do not publish, interact with real goals, clear user data or claim WCAG compliance
from an automated scan alone. Route ambiguous product rules to the main agent with
specific competing evidence rather than inventing a new design requirement.
