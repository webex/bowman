import path from 'path';

import _ from 'lodash';

import {colorizeNumber, makeDebug} from './debug';
import fileToPackage from './file';

import {git, glob} from '.';

const debug = makeDebug(__filename);

const {diff} = git;
const cwd = 'packages/node_modules';

/**
 * Lists all packages
 * @private
 * @returns {Promise<Array>}
 */
export async function listAllPackages() {
  debug('listing all packages');

  const packages = await glob('**/package.json', {cwd});

  return packages.map(path.dirname);
}

/**
 * List all packages that have changed between here and ${tag}
 * @param {string} tag
 * @returns {Promise<Array<string>>}
 */
export async function listChangedPackages(tag = 'upstream/master') {
  debug('listing changed packages');

  const changed = _(await diff(tag))
    .filter()
    .map(fileToPackage)
    .sort()
    .uniq()
    .value();

  debug(`found ${colorizeNumber(changed.length)} changed packages`);

  return changed;
}

/**
 * Lists all packages that have tests
 * @returns {Promise<Array<string>>}
 */
export async function listTestablePackages() {
  debug('listing testable packages');

  const testable = _(await glob(`${cwd}/**/*.test.js`))
    .concat(await glob(`${cwd}/**/test/**/*.js`))
    .filter()
    .map(path.dirname)
    .map(fileToPackage)
    .sort()
    .uniq()
    .value();

  debug(`found ${colorizeNumber(testable.length)} testable packages`);

  return testable;
}
