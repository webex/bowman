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
      ciSkip: {
        default: false,
        description: 'Skip tests',
        // This option really only makes sense as a git command
        hidden: true,
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
export const desc = 'Check tests should be run or skipped';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  if (argv.ciSkip) {
    console.log('skip');
    return;
  }
  const packages = await listTestablePackages(argv);

  if (packages.length) {
    console.log('run');
  }
  else {
    console.log('skip');
  }
}
