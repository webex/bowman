import assert from 'assert';
import {execSync} from 'child_process';

import _ from 'lodash';

import {colorizePackageName, makeDebug, v} from '../lib/debug';

import {listPackages} from './packages';
import {read, write} from './package';

const debug = makeDebug(__filename);

/**
 * This function has two behaviors, depending on whether or not a packageName is
 * passed
 * - if there's a ${packageName}, set its version to ${version}
 * - otherwise, set ${changed} or ${all} packages to the new ${version}
 * @param {Object} options
 * @param {string} options.packageName
 * @param {string} options.version
 * @param {boolean} options.all
 * @param {boolean} options.changed
 * @returns {Promise}
 */
export async function set({
  packageName, version, changed, all
} = {}) {
  assert(version, 'Version is required');

  if (packageName) {
    await setPackageVersion(packageName, version);
    return;
  }

  assert(changed !== all, 'changed and all are mutually exclusive');
  debug(`Setting ${v(all ? 'all' : 'changed')} packages to version ${v(version)}`);

  const packages = await listPackages({changed: changed && !all});

  for (const pkgName of packages) {
    await setPackageVersion(pkgName, version);
  }
}

/**
 * Sets the version for a single package
 * @param {string} packageName
 * @param {string} version
 * @returns {Promise}
 */
async function setPackageVersion(packageName, version) {
  debug(`Reading ${colorizePackageName(packageName)}`);

  const pkg = await read(packageName);

  debug(`Setting ${colorizePackageName(packageName)} to version ${v(version)}`);

  pkg.version = version;
  await write(packageName, pkg);

  debug(`Wrote ${colorizePackageName(packageName)}`);
}

/**
 * Fetches the latest version for ${packageName} from npm
 * @param {string} packageName
 * @returns {string}
 */
export async function fetch(packageName) {
  let pkg;
  try {
    pkg = await read(packageName);
  }
  catch (err) {
    // Assume this is a not-yet-cleaned-up, removed package.
    if (err.code === 'ENOENT') {
      return undefined;
    }

    throw err;
  }

  if (!pkg.private) {
    debug(`fetching dist-tag for ${colorizePackageName(packageName)}`);
    try {
      const dt = String(execSync(`npm dist-tag ls ${packageName}`, {stdio: 'pipe'}));
      if (!dt) {
        debug(`no dist-tags found for ${colorizePackageName(packageName)}`);
        return undefined;
      }
      const tags = dt
        .split('\n')
        .map((d) => d.split(':'))
        .reduce((acc, [
          tag,
          version
        ]) => {
          acc[tag] = version;
          return acc;
        }, {});
      debug(`${colorizePackageName(packageName)} is published as version ${v(tags.latest.trim())}`);

      return tags.latest.trim();
    }
    catch (err) {
      debug('Something went wrong, but we had to use --silent, so it\'s hard to tell what', err);
    }
  }
  return undefined;
}

/**
 * Determines if there are any breaking changes between HEAD and upstream/master
 * @returns {boolean}
 */
function hasBreakingChange() {
  debug('checking for breaking changes between HEAD and upstream/master');
  const bodies = String(execSync('git log upstream/master.. --format=%b'));
  if (/^BREAKING CHANGE:/.test(bodies)) {
    debug('found breaking change');
    return true;
  }
  debug('no breaking changes detected');
  return false;
}

/**
 * Determines the next version based on conventional changelog commit history
 * @param {Object} options
 * @param {string} options.explicitReleaseVersion use this to override commit
 * history check
 * @returns {string}
 */
export async function next(options) {
  if (options.explicitReleaseVersion) {
    return options.explicitReleaseVersion;
  }

  const packages = await listPackages();
  const versions = await Promise.all(packages
  // FIXME stop filtering '@ciscospark/eslint-config' once it's out of the
  // spark-js-sdk repo
    .filter((p) => p !== '@ciscospark/eslint-config')
    .map(async(packageName) => (await read(packageName)).version));

  const currentVersion = _(versions)
    .filter()
    .map((vv) => vv.split('.')
      .map((n) => parseInt(n, 10)))
    .sort(compare)
    .map((vv) => vv.join('.'))
    .last()
    .trim();

  debug(`last published version is ${v(currentVersion)}`);

  if (hasBreakingChange()) {
    debug('detected breaking changes');
    return increment('major', currentVersion);
  }

  debug('no breaking changes');

  const type = getChangeType();
  if (!type) {
    debug('no obvious changes, assuming patch');
    const nextVersion = increment('patch', currentVersion);
    debug(`next version is ${v(nextVersion)}`);
    return nextVersion;
  }

  debug(`determined change type to be ${v(type)}`);
  const nextVersion = increment(type, currentVersion);
  debug(`next version is ${v(nextVersion)}`);
  return nextVersion;
}

/**
 * Checks commit messages to determine change type
 * @returns {Promise<boolean>}
 */
function getChangeType() {
  const scopes = new Set(String(execSync('git log upstream/master.. --format=%s'))
    .split('\n')
    .map((subject) => subject.split('(')[0])
    .sort());

  if (scopes.has('feat')) {
    return 'minor';
  }

  if (scopes.has('fix') || scopes.has('perf') || scopes.has('refactor')) {
    return 'patch';
  }

  return undefined;
}

/* eslint-disable complexity */
/**
 * Increments a semver
 * @param {string} type
 * @param {string} version
 * @returns {string}
 */
function increment(type, version) {
  debug(`incrementing ${v(version)} by ${v(type)}`);

  let [
    major,
    minor,
    patch
  ] = version
    .replace('v', '')
    .split('.')
    .map((vv) => parseInt(vv, 10));

  if (major === 0) {
    switch (type) {
      case 'major':
        minor += 1;
        patch = 0;
        break;
      case 'minor':
        patch += 1;
        break;
      case 'patch':
        patch += 1;
        break;
      default:
        throw new Error('unrecognized change type');
    }
  }
  else {
    switch (type) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        break;
      case 'patch':
        patch += 1;
        break;
      default:
        throw new Error('unrecognized change type');
    }
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Recursive compareFunction for sorting version strings
 * @param {number} l
 * @param {Array<number>} left
 * @param {number} r
 * @param {Array<number>} right
 * @returns {number}
 */
function compare([
  l,
  ...left
], [
  r,
  ...right
]) {
  if (l < r) {
    return -1;
  }
  if (l > r) {
    return 1;
  }

  if (left.length === 0) {
    return 0;
  }

  return compare(left, right);
}
