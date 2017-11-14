import fs from 'fs';
import path from 'path';

import builtins from 'builtins';
import detective from 'detective';

import {list as _list, read} from './packages';

const debug = require('debug')('bowman:public:dependencies');

const tree = new Map();
const visited = new Map();

/**
 * Builds a tree of direct dependent packages
 * @returns {Map<string, Set>}
 */
async function buildDirectDependentTree() {
  const dependents = new Map();
  for (const packageName of await _list({})) {
    dependents.set(packageName, new Set());
  }

  for (const packageName of await _list({})) {
    for (const dep of tree.get(packageName)) {
      dependents.get(dep)
        .add(packageName);
    }
  }

  return dependents;
}

/**
 * Walks all packages to generate a tree of direct dependencies
 * @returns {Promise}
 */
async function buildLocalDepTree() {
  for (const packageName of await _list({})) {
    tree.set(packageName, await list(packageName, {
      includeTransitive: false,
      localOnly: true
    }));
  }
}

/**
 * Lists the dependencies of a given package
 * @param {string} packageName
 * @param {Object} options
 * @param {boolean} [options.dependents=false}]
 * @param {boolean} [options.localOnly=false}]
 * @param {boolean} [options.includeTransitive=true}]
 * @returns {Promise<Array<string>>}
 */
export default async function list(packageName, {
  dependents = false, includeTransitive = true, localOnly = false
}) {
  if (dependents) {
    // eslint-disable-next-line prefer-rest-params
    return listDependents(...arguments);
  }
  const packages = await _list({});

  const pkg = await read(packageName);
  const entrypoints = await listEntryPoints(pkg);

  let deps = findDeps(entrypoints);
  const localDeps = Array.from(deps)
    .filter((d) => packages.includes(d));

  if (includeTransitive) {
    for (const dep of localDeps) {
      deps = new Set([
        ...deps,
        ...findDeps(listEntryPoints(await read(dep)))
      ]);
    }
  }

  if (localOnly) {
    return Array
      .from(deps)
      .filter((d) => packages.includes(d))
      .sort();
  }

  return Array.from(deps)
    .sort();
}

/**
 * Returns all the packages that depend on packageName and (optionall), the
 * packages that depend on them
 * @param {string} packageName
 * @param {Object} options
 * @param {boolean} options.includeTransitive
 * @returns {Promise<Set>}
 */
async function listDependents(packageName, {includeTransitive}) {
  await buildLocalDepTree();

  const dependents = await buildDirectDependentTree();

  if (includeTransitive) {
    const deps = dependents.get(packageName);
    if (!deps) {
      return new Set();
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const dep of deps) {
        const next = dependents.get(dep);
        for (const nDep of next) {
          changed = changed || !deps.has(nDep);
          deps.add(nDep);
        }
      }
    }

    return deps;
  }

  return dependents.get(packageName);
}

/**
 * Finds all the entrypoints for the specified package
 * @param {Object} pkg
 * @returns {Array<string>}
 */
function listEntryPoints(pkg) {
  debug(`listing entrypoints for ${pkg.name}`);
  if (!pkg.name) {
    throw new Error('cannot read dependencies for unnamed package');
  }
  let paths = [];

  if (pkg.main) {
    debug(`found main path for ${pkg.name}`);
    paths.push(pkg.main);
  }

  if (pkg.bin) {
    debug(`found bin entry(s) for ${pkg.name}`);
    paths = Object.values(pkg.bin)
      .concat(paths);
  }

  if (pkg.browser) {
    debug(`found browser entry(s) for ${pkg.name}`);
    paths = Object.values(pkg.browser)
      .filter((p) => p && !p.startsWith('@'))
      .concat(paths);
  }

  debug(paths);

  return paths
    .map((p) => path.resolve('packages', 'node_modules', pkg.name, p));
}

/**
 * Finds all the dependencies for a given set of entrypoints
 * @param {Set<string>} entrypoints
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

/**
 * Translates a required filename into a package name
 * @param {strig} filename
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

/**
 * Finds all dependencies of entrypoint
 * @param {string} entrypoint
 * @returns {Array<string>}
 */
function walk(entrypoint) {
  try {
    if (!visited.has(entrypoint)) {
      debug(`finding requires for ${entrypoint}`);
      // This whole thing is *way* easier if we do it synchronously
      // eslint-disable-next-line no-sync
      const requires = detective(fs.readFileSync(entrypoint));
      visited.set(entrypoint, requires.reduce((acc, dep) => {
        debug(`found ${dep}`);
        if (dep.startsWith('.')) {
          debug(`${dep} is relative, descending`);
          const next = walk(path.resolve(path.dirname(entrypoint), dep));

          return new Set([
            ...acc,
            ...next
          ]);
        }
        else if (!builtins.includes(dep)) {
          debug(`found dependency ${dep}`);
          acc.add(requireToPackage(dep));
        }

        return acc;
      }, new Set()));
    }

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
