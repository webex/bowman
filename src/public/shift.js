import path from 'path';

import {readdir} from 'mz/fs';

import {listAllPackages} from '../lib/packages';
import {colorizeNumber, colorizePackageName, makeDebug, v} from '../lib/debug';

import {read, write} from './package';

const debug = makeDebug(__filename);

/**
 * Applies a loaded transform to a loaded package
 * @param {Function} tx
 * @param {Object} pkg
 * @returns {Promise<Object>}
 */
function applyTx(tx, pkg) {
  return new Promise((resolve) => resolve(tx(pkg)));
}

/**
 * Applies a loaded transform to a named package
 * @param {Function} tx
 * @param {string} packageName
 * @returns {Promise}
 */
async function applyMod(tx, packageName) {
  debug(`applying transform to ${colorizePackageName(packageName)}`);
  let pkg = await read(packageName);
  pkg = await applyTx(tx, pkg);
  if (!pkg) {
    throw new Error('Your transform must return its result');
  }
  await write(packageName, pkg);
  debug(`applied transform to ${colorizePackageName(packageName)}`);
}

/**
 * Loads a package mod by path or name
 * @param {string} mod
 * @returns {Promise<Function>}
 */
async function loadMod(mod) {
  debug(`Loading mod ${v(mod)}`);
  if (mod.startsWith('.') || mod.startsWith('/')) {
    debug(`${v(mod)} appears to be a path`);
    return require(mod);
  }

  debug(`${v(mod)} appears to be a mod's name`);

  const modDef = (await list())
    .find((m) => m.name === mod);

  if (!modDef) {
    throw new Error(`Could not find mod identified by ${v(mod)}`);
  }

  debug(`Loading mod ${v(mod)} at ${v(modDef.path)}`);

  return require(modDef.path);
}

/**
 * Applies the specified mod to the project.
 * @param {string} mod - the mod to apply
 * @returns {Promise}
 */
export async function apply(mod) {
  debug(`Applying mod ${v(mod)} to all packages`);
  const tx = await loadMod(mod);

  const packages = await listAllPackages();
  for (const packageName of packages) {
    await applyMod(tx, packageName);
  }
}

/**
 * Lists all available transformations. Search directories include:
 * - ./bowman/mods
 * - BOWMAN_JS_DIR/mods (where `BOWMAN_JS_DIR` is typically
 * `BOWMAN_INSTALL_DIR/cjs` but could be `BOWMAN_INSTALL_DIR/es` or
 * `BOWMAN_INSTALL_DIR/src`)
 * @returns {Promise<Array<string>>}
 */
export async function list() {
  debug('Listing all mods');
  const directories = [
    path.resolve(process.cwd(), '.bowman/mods/pkg'),
    path.resolve(__dirname, '../mods')
  ];

  let files = [];
  for (const dir of directories) {
    try {
      debug(`listing mods in ${v(dir)}`);

      files = files.concat((await readdir(dir)).map((f) => path.resolve(dir, f)));
    }
    catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  files = files
    .filter((f) => f.endsWith('js'))
    .sort()
    .reverse()
    .map((f) => ({
      name: path.basename(f, '.js'),
      path: f
    }));

  debug(`Found ${colorizeNumber(files.length)} mods`);
  return files;
}

