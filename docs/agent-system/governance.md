# Codex operating contract

## Discovery and routing

Project skills live under `.agents/skills/`:

| Skill entrypoint                     | Use                                                              |
| ------------------------------------ | ---------------------------------------------------------------- |
| `momentum-context/SKILL.md`            | Establish current state, applicable rules and impact.             |
| `momentum-verify/SKILL.md`             | Select checks and report evidence for the actual change.          |
| `momentum-release-readiness/SKILL.md`  | Prepare a release decision without publishing.                    |
| `momentum-spec-delivery/SKILL.md`      | Connect requirements, existing Spec Kit artifacts and acceptance. |
| `momentum-ui-acceptance/SKILL.md`      | Check responsive UX, accessibility, languages and PWA.             |
| `momentum-dependency-triage/SKILL.md`  | Evaluate existing dependency PRs and migration risks.             |

Load only the skill and references relevant to the task. Reuse `.specify`, `.ai-assistant/rules`,
scripts and workflows; `.opencode` profiles are prior material, not automatically registered Codex agents.
The standalone profiles in `.codex/agents/` define `momentum-domain-reviewer` and
`momentum-quality-investigator`, following the
[official custom-agent schema](https://learn.chatgpt.com/docs/agent-configuration/subagents).
Start a new project session to discover these files; their creation does not activate them in this chat.
Confirm the available agent/skill list before relying on registration. Project trust and host
capabilities still apply. Profiles inherit the parent's model and permissions. Instructions to avoid edits
are behavioral limits, not a separate read-only sandbox or a substitute for permission enforcement.

## Delegation and token budget

The main agent implements and integrates. Delegate when the user authorizes delegation, using one
bounded question per specialist. Give a short brief: objective, base/SHA, owned paths, relevant artifacts,
allowed actions, acceptance criteria and expected handoff. Prefer targeted context over full-history
forks; do not reload entire instruction trees. Keep dependent steps together and one writer per file.

Use the domain reviewer for goal/persistence correctness and the quality investigator for skipped,
failing or flaky tests. Inherit the current model unless the user selects another; avoid generic extra
agents, recursive delegation and repeated broad scans. A handoff contains findings, files, verification
and unresolved issues, not a transcript. Stop repeating the same failed correction after two attempts;
change the diagnostic approach or report the evidence. Do not silently abandon required work.

## Authority and completion

Within the authorized task, proceed with source inspection, reversible scoped edits and proportionate
verification. Preserve unrelated changes. Honor existing authorization; do not ask for the same approval
again. Follow `docs/dependency-maintenance.md` for the approved personal Node/npm environment and release
policy. Missing tools or permissions are reported as blocked, never bypassed.

Require explicit human authorization for protected-branch merges, release publication/tag/push/dispatch,
major or incompatible data migrations, destructive changes to real user data, changes to credentials or
branch protections, and accepting vulnerabilities or reducing quality gates. Existing explicit approval
can cover a named operation. Present unresolved product-rule conflicts and their impact for a human
decision before implementing the dependent behavior. Preparation is allowed without publication approval.

Report the revision and relevant dirty state, acceptance evidence, commands and their outcomes. Classify
checks as passed, failed, not run or blocked. Separate local from CI results; a skipped test is not
passing evidence. Reverify affected checks after changes. Do not claim that skills create CI enforcement,
that a successful build proves journeys, or that a tag proves a published/deployed release.

## Effectiveness and evaluation

Baselines are **not measured yet**. Collect these values from actual task/PR reports before setting
targets; record date, revision, sample size and environment. Do not invent improvement percentages.

| Metric                     | Collection and definition                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Context rework             | Count completed tasks reopened because an existing rule or spec was missed, per sampled tasks.                                      |
| Evidence completeness      | Reports with revision, dirty state and explicit check outcomes / sampled reports. Target: all reports.                              |
| Local/CI divergence        | Same-revision CI failures after equivalent local checks passed; classify environment differences separately.                         |
| Critical disabled coverage | Count skipped tests/suites protecting creation, progress, completion, import/export and PWA; track suite and case counts separately. |
| Review usefulness          | Confirmed actionable reviewer findings / reviewed findings; track escaped domain defects separately.                                |
| Investigation cost         | Elapsed diagnostic time and tool calls per failure; use token usage only when the host exposes it.                                  |

Evaluate the instructions on four bounded scenarios: a simple UI change, a progress/history defect,
a dependency PR, and a release-readiness request. Expected observations are correct rule selection,
targeted checks, explicit skipped/blocked evidence and no publication during preparation. Include missing
lockfile and conflicting UX rules as variations. Use read-only replay first; any implementation or app
execution needs the task's normal authorization and environment. Document actual outcomes in the task/PR;
this checklist does not assert that those scenarios have already been executed. Refine only demonstrated
instruction failures instead of growing the catalog automatically.
