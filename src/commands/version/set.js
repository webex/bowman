import {colorizePackageName, makeDebug, v} from '../../lib/debug';
import {fetch, set} from '../../public/version';
import {listPackages} from '../../public/packages';

const debug = makeDebug(__filename);

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .conflicts('all', 'changed')
    .conflicts('fetch', 'changed')
    .implies('fetch', 'all')
    .positional('target', {
      description: 'Specific version to set in all or changed packages',
      type: 'string'
    })
    .options({
      all: {
        default: undefined,
        description: 'Set "version" in all packages. Mutually exclusive with "changed".',
        type: 'boolean'
      },
      changed: {
        default: undefined,
        description: 'Set "version" in changed packages. Mutually exclusive with "all".',
        type: 'boolean'
      },
      fetch: {
        default: undefined,
        description: 'Ask npm for the current version of each package and set that in its package.json.',
        type: 'boolean'
      }
    });
}
export const command = 'set [target]';
export const desc = '';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  argv.changed = argv.changed || !argv.all && !argv.fetch;

  if (argv.fetch) {
    const packages = await listPackages();
    for (const packageName of packages) {
      debug(`Fetching and setting version for ${colorizePackageName(packageName)}`);
      const version = await fetch(packageName);
      if (version) {
        await set({
          packageName,
          version
        });
        debug(`Fetched and set version for ${colorizePackageName(packageName)}`);
      }
      else {
        debug(`No version found for ${colorizePackageName(packageName)}`);
      }
    }
  }
  else {
    if (argv.forcePublish) {
      debug('force publish is set, setting new version in all packages');
      argv.changed = false;
      argv.all = true;
    }

    const {target, changed} = argv;
    let packages = await listPackages({changed});
    if (packages.includes('tooling')) {
      // ignore tooling does not apply here
      debug('tooling changed - setting new version in all packages');
      packages = await listPackages();
    }
    for (const packageName of packages) {
      if (packageName === 'tooling' || packageName === 'docs') {
        return;
      }
      debug(`Setting ${colorizePackageName(packageName)} to version ${v(target)}`);
      await set({
        packageName,
        version: target
      });
      debug(`Set ${colorizePackageName(packageName)} to version ${v(target)}`);
    }
  }
}
