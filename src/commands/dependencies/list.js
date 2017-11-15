import {
  listDependencies,
  listDependents
} from '../../public/packages';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Promise}
 */
export function builder(yargs) {
  return yargs
    .positional('packageName', {
      description: 'Name of the package to query',
      type: 'string'
    })
    .implies('dependents', 'localOnly')
    .options({
      dependents: {
        default: false,
        description: 'Flip the list and find the packages a package depends on',
        type: 'boolean'
      },
      includeTransitive: {
        default: false,
        description: 'Also include subdependencies',
        type: 'boolean'
      },
      localOnly: {
        default: false,
        description: 'Only show the local dependencies and (optionally)  subdependencies',
        type: 'boolean'
      }
    });
}
export const command = 'list packageName';
export const desc = 'Do things with dependencies';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  let packages;
  if (argv.dependents) {
    packages = await listDependents(argv.packageName, argv);
  }
  else {
    packages = await listDependencies(argv.packageName, argv);
  }

  for (const packageName of packages) {
    console.info(packageName);
  }
}
