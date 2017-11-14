import {exec, list} from '../public/packages';

export const builder = {};
export const command = 'exec cmd [args...]';
export const desc = 'Run a command in each package directory';
/**
 * yargs hanlder
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler({cmd, args}) {
  for (const packageName of await list()) {
    await exec(packageName, cmd, args);
  }
}
