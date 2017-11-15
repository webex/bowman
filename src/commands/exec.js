import {exec} from '../public/package';
import {listAllPackages} from '../lib/packages';

export const builder = {};
export const command = 'exec cmd [args...]';
export const desc = 'Run a command in each package directory';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler({cmd, args}) {
  for (const packageName of await listAllPackages()) {
    await exec(packageName, cmd, args);
  }
}
