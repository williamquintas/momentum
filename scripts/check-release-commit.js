import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { validateVersion } from './check-version.js';

export const GIT_EXECUTABLE = process.platform === 'win32' ? 'C:\\Program Files\\Git\\cmd\\git.exe' : '/usr/bin/git';

export const runGit = (args, cwd = process.cwd()) =>
  execFileSync(GIT_EXECUTABLE, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const getPackageVersion = (cwd) => {
  const packageJson = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  return validateVersion(packageJson.version);
};

/** Verify an existing tag and checked-out commit against the fetched main ref. */
export function checkReleaseCommit(cwd = process.cwd()) {
  const tagName = `v${getPackageVersion(cwd)}`;
  // The workflow validates its trigger tag against package.json before this check.
  // Keep the CLI free of a raw tag argument while letting Git peel nested annotated tags.
  const tagCommit = runGit(['rev-parse', '--verify', `refs/tags/${tagName}^{commit}`], cwd);
  const head = runGit(['rev-parse', '--verify', 'HEAD'], cwd);
  if (head !== tagCommit) throw new Error('HEAD must equal the existing release tag commit');
  try {
    runGit(['merge-base', '--is-ancestor', head, 'refs/remotes/origin/main'], cwd);
  } catch {
    throw new Error('Release commit must already be integrated into fetched origin/main');
  }
  return head;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(`Release commit check passed: ${checkReleaseCommit()}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
