import assert from 'assert';
import {execSync} from 'child_process';

import {colorizePackageName, makeDebug, v} from '../lib/debug';

import {listPackages} from './packages';
import {read, write} from './package';

const debug = makeDebug(__filename);

// FIXME
/* eslint-disable require-jsdoc */

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

async function setPackageVersion(packageName, version) {
  debug(`Reading ${colorizePackageName(packageName)}`);

  const pkg = await read(packageName);

  debug(`Setting ${colorizePackageName(packageName)} to version ${v(version)}`);

  pkg.version = version;
  await write(packageName, pkg);

  debug(`Wrote ${colorizePackageName(packageName)}`);
}

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
