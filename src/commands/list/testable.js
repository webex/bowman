import {listTestablePackages} from '../../public/packages';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .implies('ignoreTooling', 'changed')
    .options({
      changed: {
        default: false,
        description: 'Only list packages (or their dependents) that have changed from master',
        type: 'boolean'
      },
      ignoreTooling: {
        default: false,
        description: 'Ignore tooling changes when determining what packages should be tested',
        type: 'boolean'
      }
    });
}
export const command = 'testable';
export const desc = 'List testable packages';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  const packages = await listTestablePackages(argv);

  for (const pkg of packages) {
    console.info(pkg);
  }
}
