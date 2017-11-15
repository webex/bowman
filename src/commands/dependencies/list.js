import list from '../../public/dependencies';

export const builder = {
  dependents: {
    default: false,
    description: 'Flip the list and find the packages a package depends on',
    type: 'boolean'
  },
  includeTransitive: {
    default: true,
    description: 'Also include subdependencies',
    type: 'boolean'
  },
  localOnly: {
    default: false,
    description: 'Only show the local dependencies and (optionally)  subdependencies',
    type: 'boolean'
  }
};
export const command = 'list packageName';
export const desc = 'Do things with dependencies';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  const packages = await list(argv.packageName, argv);

  for (const pkg of packages) {
    console.info(pkg);
  }
}
