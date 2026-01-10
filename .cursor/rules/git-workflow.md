# Git Workflow

## Branching Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature branches
- **bugfix/**: Bug fix branches
- **hotfix/**: Urgent production fixes
- **release/**: Release preparation branches

### Branch Protection
- **main** and **develop** branches must be protected
- Require pull request reviews before merging
- Require status checks to pass (CI/CD)
- Require branches to be up to date before merging
- Disable force pushes to protected branches
- Disable branch deletion
- Require linear history (no merge commits on main)

## Branch Naming
- Use descriptive branch names
- Include ticket/issue number if applicable
- Use kebab-case: `feature/goal-progress-tracking`
- Examples:
  - `feature/add-milestone-goals`
  - `bugfix/fix-progress-calculation`
  - `hotfix/critical-api-error`

## Commit Messages
- Use conventional commit format
- Format: `<type>(<scope>): <subject>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- Examples:
  - `feat(goals): add quantitative goal progress tracking`
  - `fix(api): handle timeout errors gracefully`
  - `docs(readme): update installation instructions`
  - `perf(goals): optimize progress calculation`
  - `ci: add automated testing workflow`

### Commit Message Body
- Separate subject from body with blank line
- Wrap body at 72 characters
- Use body to explain what and why vs. how
- Use bullet points with `-` for multiple points
- Reference issues/tickets in footer
- Example:
  ```
  feat(goals): add progress tracking

  Implement quantitative goal progress tracking with
  real-time updates and progress visualization.

  - Add progress calculation logic
  - Create progress bar component
  - Update goal store with progress state

  Closes #123
  ```

### Breaking Changes
- Indicate breaking changes in commit message
- Use `!` after type/scope: `feat(api)!: change authentication method`
- Or include `BREAKING CHANGE:` in footer:
  ```
  feat(api): update authentication

  BREAKING CHANGE: Authentication now requires JWT tokens
  instead of session cookies. Update client code accordingly.
  ```

## Commit Best Practices
- Write clear, descriptive messages
- Keep commits focused and atomic
- Reference issues/tickets in commits
- Use present tense ("add feature" not "added feature")
- Limit first line to 50-72 characters
- Add detailed description if needed

## Pull Request Process
- Create PR from feature branch to develop
- Write descriptive PR title and description
- Link related issues
- Request reviews from team members
- Address review feedback
- Ensure CI checks pass
- Squash commits if needed before merge

### Draft Pull Requests
- Use draft PRs for work-in-progress features
- Benefits: Early feedback, prevents accidental merges, shows progress
- Convert to ready when:
  - Code is complete and tested
  - All CI checks pass
  - Ready for final review
- Mark as "Ready for Review" when complete

### Issue Linking
- Use keywords to auto-close issues: `Closes #123`, `Fixes #456`, `Resolves #789`
- Reference related issues in PR description
- Link issues in commit messages for traceability
- Use issue numbers in branch names when applicable: `feature/123-add-goal-tracking`

## PR Description Template
- **What**: What changes are being made
- **Why**: Why these changes are needed
- **How**: How the changes are implemented
- **Testing**: How to test the changes
- **Screenshots**: Visual changes (if applicable)

## Code Review Guidelines
- Review for correctness and quality
- Check for security issues
- Verify tests are included
- Ensure code follows style guide
- Provide constructive feedback
- Approve when ready

### Review Requirements
- Minimum 1-2 approvals required before merge
- At least one approval from code owner or senior developer
- All requested reviewers must approve or explicitly dismiss
- Review checklist:
  - [ ] Code correctness and logic
  - [ ] Security vulnerabilities
  - [ ] Performance implications
  - [ ] Test coverage
  - [ ] Code style and consistency
  - [ ] Documentation updates
  - [ ] Accessibility considerations
  - [ ] Breaking changes documented

### Review SLA
- Respond to review requests within 24-48 hours
- If unavailable, assign alternate reviewer
- Ping reviewers after 3 days if no response
- Escalate to team lead if blocking for > 1 week

## Merge Strategy
- Use squash and merge for feature branches
- Use merge commit for release branches
- Keep commit history clean
- Delete merged branches
- Tag releases

### When to Rebase vs Merge
- **Rebase** (preferred for feature branches):
  - Before creating PR to keep history linear
  - Interactive rebase to clean up commits: `git rebase -i HEAD~n`
  - Never rebase shared/public branches
  - Use: `git rebase develop` to update feature branch
- **Merge** (for release branches and hotfixes):
  - Preserves complete history
  - Use merge commits for release branches
  - Use for integrating long-lived branches
- **Squash and Merge** (for feature branches):
  - Combines all commits into one
  - Keeps main branch history clean
  - Use when feature branch has many small commits

## Conflict Resolution
- Rebase feature branch before PR
- Resolve conflicts locally
- Test after resolving conflicts
- Communicate with team about conflicts

### Conflict Resolution Steps
1. Update local branch: `git fetch origin`
2. Rebase on target branch: `git rebase origin/develop`
3. Resolve conflicts in affected files
4. Stage resolved files: `git add <file>`
5. Continue rebase: `git rebase --continue`
6. Test thoroughly after resolution
7. Force push if needed: `git push --force-with-lease` (only on feature branches)
8. Communicate resolution approach with team

## Git Hooks
- Pre-commit: Run linting and tests
- Pre-push: Run full test suite
- Commit-msg: Validate commit message format
- Use Husky for git hooks

### Hook Configuration
- **pre-commit**: Lint staged files, run unit tests
- **pre-push**: Run full test suite, type checking
- **commit-msg**: Validate conventional commit format
- **post-merge**: Install dependencies if package.json changed
- Skip hooks when needed: `git commit --no-verify` (use sparingly)

## Hotfix Workflow
- Create hotfix branch from `main`: `git checkout -b hotfix/critical-bug main`
- Fix the issue and add tests
- Create PR to `main` (expedited review process)
- After merge to `main`, merge back to `develop`
- Tag release: `git tag -a v1.0.1 -m "Hotfix: critical bug fix"`
- Deploy immediately to production
- Document in CHANGELOG.md

## Release Branch Workflow
- Create release branch from `develop`: `git checkout -b release/v1.1.0 develop`
- Final testing and bug fixes (only critical fixes)
- Update version numbers and CHANGELOG.md
- Create PR to `main` when ready
- After merge to `main`, merge back to `develop`
- Tag release: `git tag -a v1.1.0 -m "Release v1.1.0"`
- Create GitHub release with notes
- Deploy to production

## Tagging Releases
- Tag releases with semantic versioning
- Format: `v1.0.0`, `v1.1.0`, `v2.0.0`
- Include release notes
- Update CHANGELOG.md
- Tag from main/master branch
- Annotated tags: `git tag -a v1.0.0 -m "Release v1.0.0"`
- Push tags: `git push origin v1.0.0`
- Create GitHub release with detailed notes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers bumped
- [ ] Release notes prepared
- [ ] Team notified of release
- [ ] Deployment plan ready

## CI/CD Integration
- All PRs trigger CI pipeline automatically
- Required checks must pass before merge:
  - Unit tests
  - Integration tests
  - Linting
  - Type checking
  - Build verification
  - Security scans
- Preview deployments for PRs (staging environment)
- Status checks visible in PR
- Block merge if checks fail
- Re-run failed checks after fixes

## Branch Lifecycle Management
- Delete merged branches automatically (GitHub setting) or manually
- Keep feature branches for max 30 days after merge
- Archive old branches if needed for reference
- Clean up local branches: `git branch -d <branch-name>`
- Clean up remote tracking branches: `git remote prune origin`
- Regular cleanup script recommended

## Additional Git Operations

### Cherry-Picking
- Use to apply specific commits to different branches
- Example: `git cherry-pick <commit-hash>`
- Useful for hotfixes that need to go to multiple branches
- Resolve conflicts if they occur
- Use `-x` flag to include original commit reference

### Stashing
- Save uncommitted changes: `git stash`
- List stashes: `git stash list`
- Apply stash: `git stash apply` or `git stash pop`
- Use descriptive messages: `git stash save "WIP: feature implementation"`
- Clean up old stashes: `git stash clear`

### Git Aliases
- Useful shortcuts for common operations:
  - `git config --global alias.co checkout`
  - `git config --global alias.br branch`
  - `git config --global alias.ci commit`
  - `git config --global alias.st status`
  - `git config --global alias.unstage 'reset HEAD --'`
  - `git config --global alias.last 'log -1 HEAD'`

### Interactive Rebase
- Clean up commit history: `git rebase -i HEAD~n`
- Squash commits together
- Reword commit messages
- Reorder commits
- Drop unnecessary commits
- Only use on local/feature branches

## Emergency Procedures

### Critical Bug in Production
1. Create hotfix branch immediately from `main`
2. Fix the issue with minimal changes
3. Request expedited review (ping team lead)
4. Merge to `main` after approval
5. Deploy immediately
6. Merge back to `develop`
7. Create follow-up issue for proper fix if needed

### Rollback Procedure
1. Identify last known good commit/tag
2. Revert commit: `git revert <commit-hash>`
3. Or reset to previous tag: `git reset --hard <tag>`
4. Force push only if absolutely necessary (coordinate with team)
5. Deploy rollback immediately
6. Create issue to investigate root cause
7. Document rollback in CHANGELOG.md

### After-Hours Process
- On-call engineer handles critical issues
- Create hotfix branch and PR
- Request emergency review from on-call reviewer
- Deploy after approval
- Document in morning standup
- Follow up with proper fix during business hours

## Code Freeze Periods
- Implement before major releases
- Purpose: Stabilize codebase, focus on testing
- Duration: Typically 1-3 days before release
- Exceptions: Critical security fixes, production blockers
- Process: Get approval from release manager for exceptions
- Communicate freeze dates to team in advance

## Changelog Management
- Maintain CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) format
- Sections: Added, Changed, Deprecated, Removed, Fixed, Security
- Update changelog in same PR as changes
- Include breaking changes prominently
- Use automation tools: `standard-version`, `semantic-release`
- Generate changelog from commit messages when possible

### Changelog Format
```markdown
## [1.1.0] - 2024-01-15

### Added
- Progress tracking for quantitative goals
- Milestone goal type support

### Changed
- Improved goal creation UI

### Fixed
- Progress calculation bug for recurring goals

### Security
- Updated dependencies to fix vulnerabilities
```

## Best Practices
- Commit often with meaningful messages
- Keep branches up to date
- Review code before committing
- Use meaningful branch names
- Clean up merged branches
- Document workflow for team
- Use PR templates
- Maintain clean git history
- Never force push to shared branches
- Communicate with team about conflicts
- Test thoroughly before pushing
- Keep commits focused and atomic
- Use feature flags for risky changes
- Monitor deployments after merge

