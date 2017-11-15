import {listPackages} from '../public/packages';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .implies('include-transitive', 'changed')
    .options({
      changed: {
        default: false,
        description: 'Only list packages that have changed from master',
        type: 'boolean'
      },
      'include-transitive': {
        default: false,
        description: 'Consider transitive dependents as changed',
        type: 'boolean'
      },
      testable: {
        default: false,
        description: 'Only list packages that are testable',
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
