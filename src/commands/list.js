import {list} from '../public/packages';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .implies('changedonly', 'testable')
    .options({
      changedonly: {
        default: false,
        description: 'List only the changed, testable packages',
        type: 'boolean'
      },
      testable: {
        default: false,
        description: 'List packages that should be tested in CI',
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
  const packages = await list(argv);

  for (const pkg of packages) {
    console.info(pkg);
  }
}
