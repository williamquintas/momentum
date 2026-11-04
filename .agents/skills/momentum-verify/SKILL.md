---
name: momentum-verify
description: Verify a Momentum change before handoff or PR, selecting existing checks by impact and reporting reproducible evidence and skipped coverage.
---

# Verification evidence

Inputs: requested change, acceptance criteria, diff/base and current environment.
Paths and commands below are relative to the repository root.

## Preconditions

- Record HEAD and relevant staged, unstaged and untracked changes; a SHA alone
  does not identify a dirty checkout. Preserve edits belonging to other tasks.
- Read `package.json` and `docs/dependency-maintenance.md` before npm execution.
  Use approved personal Node/npm isolated from corporate configuration. Do not
  enable blocked global npm, use corporate npm or bypass an execution block.
- Check lockfile and dependency availability. Missing prerequisites are blocked
  checks, not permission to regenerate a lockfile or install unrelated tools.

## Checks

- For runtime changes, select relevant Vitest files with
  `npx vitest run <file>`; use the available local runner, without downloading one.
- For code/configuration changes, use `npm run validate` and `npm run build`
  according to impact. For translations, run `npm run validate:translations`.
- For full test evidence, run `npm test -- --run`. For requested coverage, use
  `npm run test:coverage -- --run`; a normal test run does not prove coverage exists.
- For version policy, use `node --test scripts/check-version.node-test.js` and
  `node scripts/check-version.js maintenance` when the lockfile is present.
- Dependency batches require the full sequence documented in
  `docs/dependency-maintenance.md`, including clean installation and security audit.
- Inspect relevant `describe.skip`, `it.skip` and TODO tests; list critical journeys
  they leave unverified. A green suite does not validate skipped behavior.
- For documentation-only changes, prefer link, schema and formatting checks over
  unrelated application tests. Do not autoformat the entire dirty worktree.

## Result and stopping condition

For each check report command, exit code when executed, scope and status:
`passed`, `failed`, `not run` or `blocked`, with reason for the last two.
Include revision/dirty state, relevant skipped tests and remaining acceptance gaps.
Distinguish local results from CI results and their actual revisions.

Never suppress a gate, delete assertions or disable tests to obtain green output.
Retry only when evidence supports a change; after two unsuccessful repair attempts
for the same failure, return the reproduction and diagnosis to the main agent.
Any subsequent edits invalidate the affected results and require appropriate reruns.
