import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const getPullRequestIdentity = (event) => {
  const pr = event?.pull_request;
  const repository = event?.repository;
  const head = pr?.head;
  const base = pr?.base;
  if (
    !Number.isSafeInteger(repository?.id) ||
    repository.id <= 0 ||
    !Number.isSafeInteger(head?.repo?.id) ||
    head.repo.id <= 0 ||
    base?.repo?.id !== repository.id ||
    typeof head?.ref !== 'string' ||
    typeof base?.ref !== 'string'
  ) {
    throw new Error('Gitflow requires valid source and target repository identities');
  }
  return { pr, repository, head, base };
};

const isDependabotPullRequest = (pr, head, isSameRepository) =>
  isSameRepository &&
  pr.user?.login === 'dependabot[bot]' &&
  pr.user?.type === 'Bot' &&
  /^dependabot\/[^/]+\/.+/.test(head.ref);

const getDevelopRoute = (head, isSameRepository, isDependabot) => {
  if (/^(feature|fix)\/.+/.test(head.ref)) return 'maintenance';
  if (isSameRepository && head.ref === 'main') return 'synchronize-main';
  if (isDependabot) return 'dependabot-maintenance';
  return undefined;
};

const getMainRoute = (head, isSameRepository, isDependabot) => {
  if (isSameRepository && /^release\/.+/.test(head.ref)) return 'release';
  // The npm entry for the default branch disables ordinary updates. GitHub's
  // PR event has no security-update flag: this exception relies on that
  // security-only Dependabot configuration, not on a title or editable label.
  if (isDependabot && head.ref.startsWith('dependabot/npm_and_yarn/')) return 'dependabot-security-lane';
  return undefined;
};

/** Validate GitHub's PR payload, never a shell-interpolated branch name. */
export function checkGitflow(event) {
  const { pr, repository, head, base } = getPullRequestIdentity(event);
  const isSameRepository = head.repo.id === repository.id;
  const isDependabot = isDependabotPullRequest(pr, head, isSameRepository);
  const route =
    base.ref === 'develop'
      ? getDevelopRoute(head, isSameRepository, isDependabot)
      : base.ref === 'main'
        ? getMainRoute(head, isSameRepository, isDependabot)
        : undefined;
  if (route) return route;
  throw new Error('Invalid Gitflow route: use feature/* or fix/* -> develop, release/* -> main, or main -> develop');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.env.GITHUB_EVENT_NAME !== 'pull_request') {
      throw new Error('Gitflow guard only accepts pull_request events');
    }
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    console.log(`Gitflow check passed: ${checkGitflow(event)}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
