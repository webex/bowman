import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import builtins from 'builtins';
import detective from 'detective';
import {readFile} from 'mz/fs';

import {listAllPackages} from '../lib/packages';
import {colorizeNumber, colorizePackageName, makeDebug, v} from '../lib/debug';


import {read, write} from './package';

const debug = makeDebug(`${__filename}`);

const directDependencies = new Map();
const directDependents = new Map();
const transitiveDependencies = new Map();
const transitiveDependents = new Map();

/**
 * Copies relevant dependencies from top-level package.json into each
 * subpackage's package.json
 * @returns {Promise}
 */
export async function generate() {
  const packages = await listAllPackages();

  for (const packageName of packages) {
    const pkg = await read(packageName);
    pkg.dependencies = await generateVersionedDeps(packageName);
    await write(packageName, pkg);
  }
}

/**
 * Generates versioned dependencies for the specified packages
 * @param {string} packageName
 * @returns {Object}
 */
async function generateVersionedDeps(packageName) {
  debug('Loading main package.json');
  const rootPkg = JSON.parse(await readFile('./package.json'));
  debug('Loaded main package.json');

  debug(`Reading all dependency names for ${colorizePackageName(packageName)}`);
  const deps = await listDirectDependencies(packageName);
  debug(`Read ${colorizeNumber(deps.length)} dependency names for ${colorizePackageName(packageName)}`);

  return deps.reduce((acc, dep) => {
    if (builtins.includes(dep)) {
      return acc;
    }

    debug(`Checking main package.json for ${v(dep)}`);
    acc[dep] = _.get(rootPkg, `dependencies.${dep}`);
    if (acc[dep]) {
      debug(`Found ${dep} in main package.json`);
    }
    else {
      debug(`Did not find ${v(dep)} in main package.json`);

      try {
        debug(`Checking if ${v(dep)} is a local package`);
        // This function needs to be synchronous since it's a reducer, so we
        // can't use `await read()`
        debug(`Requiring ${v(`packages/node_modules/${dep}/package.json`)} from the current directory`);
        acc[dep] = require(path.resolve(process.cwd(), `packages/node_modules/${dep}/package.json`)).version;
        debug(`Found ${v(dep)} locally`);
      }
      catch (err) {
        console.warn(err);
        throw new Error(`Failed to determine version for ${v(dep)}. Is it missing from package.json?`);
      }
    }

    return acc;
  }, {});
}

/**
 * Determines all the entry points for the specified packaged. memoized.
 * @param {string} packageName
 * @returns {Promise<Array<string>>}
 */
export async function listDirectDependencies(packageName) {
  debug(`Checking if we've already walked the dependencies for ${colorizePackageName(packageName)}`);
  let deps = directDependencies.get(packageName);
  if (!deps) {
    debug(`Did not find cached dependencies for ${colorizePackageName(packageName)}`);
    const entrypoints = await listEntryPoints(packageName);
    deps = findDeps(entrypoints);

    directDependencies.set(packageName, deps);
  }

  debug(`Returning ${colorizeNumber(deps.size)} direct dependencies for ${colorizePackageName(packageName)}`);
  return Array.from(deps)
    .sort();
}

/**
 * List all the packages that directly depend on packageName
 * @param {string} packageName
 * @returns {Promise<Array<string>>}
 */
export async function listDirectDependents(packageName) {
  debug(`Checking if we've already found direct dependents for ${colorizePackageName(packageName)}`);
  let directDeps = directDependents.get(packageName);
  if (directDeps) {
    debug(`Found ${colorizeNumber(directDeps.size)} cached direct dependents for ${colorizePackageName(packageName)}`);
  }
  else {
    debug(`Searching for direct dependents for ${colorizePackageName(packageName)}`);
    const packages = await listAllPackages();
    directDeps = new Set();
    for (const possibleDep of packages) {
      if ((await listDirectDependencies(possibleDep)).includes(packageName)) {
        directDeps.add(possibleDep);
      }
    }
    directDependents.set(packageName, directDeps);
    debug(`Found ${colorizeNumber(directDeps.size)} direct dependents for ${colorizePackageName(packageName)}`);
  }
  debug(`Returning ${colorizeNumber(directDeps.size)} direct dependents for ${colorizePackageName(packageName)}`);
  return directDeps;
}

/**
 * Finds direct and transitive dependencies for the specified packages.
 * @param {string} packageName
 * @returns {Promise<Array<string>>}
 */
export async function listTransitiveDependencies(packageName) {
  return Array.from(await findTransitiveDependencies(packageName))
    .sort();
}

/**
 * Finds direct and transitive dependencies for the specified packages.
 * @param {string} packageName
 * @private
 * @returns {Promise<Set<string>>}
 */
async function findTransitiveDependencies(packageName) {
  debug(`Checking for cached transitive dependencies for ${colorizePackageName(packageName)}`);
  let transitiveDeps = transitiveDependencies.get(packageName);
  if (transitiveDeps) {
    debug(`Found for cached transitive dependencies for ${colorizePackageName(packageName)}`);
  }
  else {
    debug(`Finding transitive dependencies for ${colorizePackageName(packageName)}`);

    const packages = await listAllPackages();
    const directDeps = await listDirectDependencies(packageName);
    transitiveDeps = new Set();
    for (const dep of directDeps) {
      if (packages.includes(dep)) {
        debug(`${dep} is a `);
        const newDeps = await findTransitiveDependencies(dep);
        transitiveDeps = new Set([
          ...transitiveDeps,
          ...newDeps
        ]);
      }
    }
    transitiveDeps = new Set([
      ...transitiveDeps,
      ...directDeps
    ]);
    transitiveDependencies.set(packageName, transitiveDeps);
    debug(`Found ${colorizeNumber(transitiveDeps.size)} transitive dependencies for ${colorizePackageName(packageName)}`);
  }

  debug(`Returning ${colorizeNumber(transitiveDeps.size)} transitive dependencies for ${colorizePackageName(packageName)}`);

  return transitiveDeps;
}


/**
 * Finds direct and transitive dependents for the specified package
 * @param {string} packageName
 * @returns {Promise<Array<string>>}
 */
export async function listTransitiveDependents(packageName) {
  return Array.from(await findTransitiveDependents(packageName))
    .sort();
}

/**
 * Finds direct and transitive dependents for the specified package
 * @param {string} packageName
 * @returns {Promise<Array<string>>}
 */
async function findTransitiveDependents(packageName) {
  debug(`Checking if we've already found transitive dependents for ${colorizePackageName(packageName)}`);
  let transitiveDeps = transitiveDependents.get(packageName);
  if (transitiveDeps) {
    debug(`Found ${colorizeNumber(transitiveDeps.size)} cached transitive dependents for ${colorizePackageName(packageName)}`);
  }
  else {
    debug(`Searching for transitive dependents for ${colorizePackageName(packageName)}`);
    const packages = await listAllPackages();
    const directDeps = await listDirectDependents(packageName);

    transitiveDeps = new Set();
    for (const dep of directDeps) {
      if (packages.includes(dep)) {
        transitiveDeps = new Set([
          ...transitiveDeps,
          ...await findTransitiveDependents(dep)
        ]);
      }
    }
    transitiveDeps = new Set([
      ...transitiveDeps,
      ...directDeps
    ]);
    transitiveDependents.set(packageName, transitiveDeps);
    debug(`Found ${colorizeNumber(transitiveDeps.size)} transitive dependents for ${colorizePackageName(packageName)}`);
  }
  debug(`Returning ${colorizeNumber(transitiveDeps.size)} transitive dependents for ${colorizePackageName(packageName)}`);
  return transitiveDeps;
}


/**
 * Combines the dependencies found at each entrypoint
 * @param {Array<string>} entrypoints
 * @returns {Set<string>}
 */
function findDeps(entrypoints) {
  let deps = new Set();
  for (const entrypoint of entrypoints) {
    deps = new Set([
      ...deps,
      ...walk(entrypoint)
    ]);
  }

  return deps;
}

const visited = new Map();

/**
 * Finds the (sub)tree of dependencies beginging at ${entrypoing}
 * @param {string} entrypoint
 * @private
 * @returns {Set<string>}
 */
function walk(entrypoint) {
  try {
    if (!visited.has(entrypoint)) {
      debug(`Finding requires for ${entrypoint}`);
      // This whole thing is *way* easier if we do it synchronously
      // eslint-disable-next-line no-sync
      const requires = detective(fs.readFileSync(entrypoint));
      visited.set(entrypoint, requires.reduce((acc, dep) => {
        debug(`Found ${dep} for ${entrypoint}`);
        if (dep.startsWith('.')) {
          debug(`${dep} is relative, descending`);
          const next = walk(path.resolve(path.dirname(entrypoint), dep));

          return new Set([
            ...acc,
            ...next
          ]);
        }
        else if (!builtins.includes(dep)) {
          debug(`Found dependency ${dep}`);
          acc.add(requireToPackage(dep));
        }

        return acc;
      }, new Set()));
    }

    debug(`Returning requires for ${entrypoint}`);
    return visited.get(entrypoint);
  }
  catch (err) {
    if (err.code === 'EISDIR') {
      return walk(path.resolve(entrypoint, 'index.js'));
    }
    if (err.code === 'ENOENT' && !entrypoint.endsWith('.js')) {
      return walk(`${entrypoint}.js`);
    }
    throw err;
  }
}

/**
 * Translates a required filename into a package name
 * @param {string} filename
 * @private
 * @returns {string}
 */
function requireToPackage(filename) {
  const packageName = filename.split('/');
  if (packageName[0].startsWith('@')) {
    return packageName.slice(0, 2)
      .join('/');
  }

  return packageName[0];
}


export const a = 5;

/**
 * Finds all the entrypoints for the specified package
 * @param {string|Object} pkg
 * @private
 * @returns {Promise<Array<string>>}
 */
async function listEntryPoints(pkg) {
  if (typeof pkg === 'string') {
    pkg = await read(pkg);
  }

  debug(`listing entrypoints for ${pkg.name}`);
  if (!pkg.name) {
    throw new Error('cannot read dependencies for unnamed package');
  }
  let paths = [];

  if (pkg.main) {
    debug(`Found main path for ${pkg.name}`);
    paths.push(pkg.main);
  }

  if (pkg.bin) {
    debug(`Found bin entry(s) for ${pkg.name}`);
    paths = Object.values(pkg.bin)
      .concat(paths);
  }

  if (pkg.browser) {
    debug(`Found browser entry(s) for ${pkg.name}`);
    paths = Object.values(pkg.browser)
      .filter((p) => p && !p.startsWith('@'))
      .concat(paths);
  }

  debug(paths);

  return paths
    .map((p) => path.resolve('packages', 'node_modules', pkg.name, p));
}

