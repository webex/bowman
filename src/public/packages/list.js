import path from 'path';

import _ from 'lodash';

import {git, glob} from '../../lib';

const {diff} = git;

const cwd = 'packages/node_modules';

/**
 * Lists all packages
 * @param {Object} options
 * @param {boolean} options.testable when true, only packages with tests will be
 * included in the result
 * @returns {Promise<string>}
 */
export default async function list({testable = false, updated = false} = {}) {
  let packages = await listAllPackages();

  if (updated) {
    packages = await removeUnchanged(packages);
  }

  if (testable) {
    packages = await removeUntestablePackages(packages);
  }

  return packages;
}

/**
 * Determines the package to which a given file belongs. Includes the meta
 * packages "docs" and "tooling"
 * @param {string} filename
 * @private
 * @returns {string}
 */
function fileToPackage(filename) {
  if (filename.startsWith('packages/node_modules/')) {
    const packageName = filename
      .replace('packages/node_modules/', '')
      .split('/');

    if (packageName[0].startsWith('@')) {
      return packageName.slice(0, 2)
        .join('/');
    }

    return packageName[0];
  }

  if (filename.startsWith('docs')) {
    return 'docs';
  }

  return 'tooling';
}

/**
 * Lists all packages
 * @private
 * @returns {Promise<Set>}
 */
async function listAllPackages() {
  const packages = await glob('**/package.json', {cwd});

  return packages.map(path.dirname);
}

/**
 * Removes the unchanged packages
 * @returns {Promise<Array>}
 */
async function removeUnchanged() {
  // TODO allow using last npm tag instead of upstream/master
  const tag = 'upstream/master';

  return _(await diff(tag))
    .map(fileToPackage)
    .filter()
    .uniq()
    .value();

  // TODO optionally count dependents as changed
}

/**
 * Filters out packages that don't have tests
 * @param {Array<string>} packages
 * @returns {Promise<Array<string>>}
 */
async function removeUntestablePackages(packages) {
  // TODO make these patterns configurable
  return _(await glob('**/*.test.js', {cwd}))
    .concat(await glob('**/test', {cwd}))
    .map(path.dirname)
    .sort()
    .uniq()
    .filter((p) => packages.includes(p))
    .value();
}
