import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateVersion(version) {
  if (typeof version !== 'string') throw new Error('Version must be a string');
  const parts = version.split('+');
  if (parts.length > 2) throw new Error(`Invalid SemVer: ${version}`);
  const separator = parts[0].indexOf('-');
  const core = separator < 0 ? parts[0] : parts[0].slice(0, separator);
  const prerelease = separator < 0 ? undefined : parts[0].slice(separator + 1);
  const numbers = core.split('.');
  if (numbers.length !== 3 || numbers.some((part) => !/^(0|[1-9][0-9]*)$/.test(part))) {
    throw new Error(`Invalid SemVer: ${version}`);
  }
  for (const [identifiers, isPrerelease] of [
    [prerelease, true],
    [parts[1], false],
  ]) {
    if (identifiers === undefined) continue;
    if (
      identifiers
        .split('.')
        .some(
          (part) =>
            !/^[0-9A-Za-z-]+$/.test(part) ||
            (isPrerelease && /^[0-9]+$/.test(part) && part.length > 1 && part.startsWith('0'))
        )
    )
      throw new Error(`Invalid SemVer: ${version}`);
  }
  return version;
}

export function readRemoteTags(tag) {
  // An unavailable remote is an error, never evidence that a tag is absent.
  return execFileSync('git', ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`, `refs/tags/${tag}^{}`], {
    encoding: 'utf8',
    timeout: 30000,
  });
}

export function checkVersion(
  { mode = 'maintenance', version, lockVersion, rootLockVersion, tag },
  readTags = readRemoteTags
) {
  validateVersion(version);
  if (lockVersion !== version || rootLockVersion !== version) {
    throw new Error('package.json and package-lock.json versions must match');
  }
  if (mode === 'maintenance') return version;
  if (mode === 'tag') {
    if (tag !== `v${version}`) throw new Error(`Tag ${tag} does not match package version v${version}`);
    return version;
  }
  if (mode !== 'release') throw new Error(`Unknown version check mode: ${mode}`);
  const expectedRef = `refs/tags/v${version}`;
  const tags = readTags(`v${version}`);
  if (
    tags.split('\n').some((line) => {
      const ref = line.trim().split(/\s+/)[1];
      return ref === expectedRef || ref === `${expectedRef}^{}`;
    })
  )
    throw new Error(`Tag v${version} already exists; prepare a new release version`);
  return version;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    const version = checkVersion({
      mode: process.argv[2] || 'maintenance',
      version: pkg.version,
      lockVersion: lock.version,
      rootLockVersion: lock.packages?.['']?.version,
      tag: process.argv[3],
    });
    console.log(`Version check passed: ${version}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
