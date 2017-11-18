import {listPackages} from '../public/packages';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .options({
      changed: {
        default: false,
        description: 'Only list packages that have changed from master',
        type: 'boolean'
      }
    })
    .commandDir('./list');
}
export const command = 'list';
export const desc = 'List packages';

/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  const packages = await listPackages(argv);

  for (const pkg of packages) {
    console.info(pkg);
  }
}
