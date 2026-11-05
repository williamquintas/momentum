import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { validateVersion } from './check-version.js';

/** Verify an existing tag and checked-out commit against the fetched main ref. */
export function checkReleaseCommit(tag, cwd = process.cwd()) {
  if (typeof tag !== 'string' || !tag.startsWith('v')) {
    throw new Error('An existing v-prefixed version tag is required');
  }
  validateVersion(tag.slice(1));
  const git = (args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const tagCommit = git(['rev-parse', '--verify', `refs/tags/${tag}^{commit}`]);
  const head = git(['rev-parse', '--verify', 'HEAD']);
  if (head !== tagCommit) throw new Error('HEAD must equal the existing release tag commit');
  try {
    git(['merge-base', '--is-ancestor', head, 'refs/remotes/origin/main']);
  } catch {
    throw new Error('Release commit must already be integrated into fetched origin/main');
  }
  return head;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(`Release commit check passed: ${checkReleaseCommit(process.argv[2])}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
