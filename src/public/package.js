import path from 'path';

import {readFile, writeFile} from 'mz/fs';

import {spawn} from '../lib';

const cwd = 'packages/node_modules';

/**
 * Executes a command in the directory of the specified package
 * @param {string} packageName
 * @param {string} cmd
 * @param {Array<string>} args
 * @param {Object} options
 * @returns {Promise<string>}
 */
export function exec(packageName, cmd, args = [], options = {}) {
  return spawn(cmd, args, Object.assign({cwd: path.join(cwd, packageName)}), options);
}

/**
 * Returns the main entrypoint for a given package
 * @param {string} packageName
 * @returns {Promise<string>}
 */
export async function getMain(packageName) {
  const pkg = await read(packageName);

  return pkg.main;
}

/**
 * Loads a package.json as a JavaScript object
 * @param {string} packageName
 * @returns {Promise<Object>}
 */
export async function read(packageName) {
  const packagePath = path.join(cwd, packageName, 'package.json');

  return JSON.parse(await readFile(packagePath));
}

/**
 * Sets a new entrypoint for a given package
 * @param {string} packageName
 * @param {string} main
 * @returns {Promise}
 */
export async function setMain(packageName, main) {
  const pkg = await read(packageName);
  pkg.main = main;
  await write(packageName, pkg);
}

/**
 * Saves an object to a package.json
 * @param {string} packageName
 * @param {Object} pkg
 * @returns {Promise}
 */
export async function write(packageName, pkg) {
  const packagePath = path.join(cwd, packageName, 'package.json');
  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

