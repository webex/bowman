import {colorizeFileName, makeDebug} from './debug';

const debug = makeDebug(__filename);

/**
 * Determines the package to which a given file belongs. Includes the meta
 * packages "docs" and "tooling"
 * @param {string} filename
 * @private
 * @returns {string}
 */
export default function fileToPackage(filename) {
  debug(`converting ${colorizeFileName(filename)} to package`);
  if (filename.startsWith('packages/node_modules/')) {
    const packageName = filename
      .replace('packages/node_modules/', '')
      .split('/');

    if (packageName[0].startsWith('@')) {
      const scopedPackageName = packageName
        .slice(0, 2)
        .join('/');

      debug(`determined ${colorizeFileName(filename)} to be part of "${scopedPackageName}"`);

      return scopedPackageName;
    }

    debug(`determined ${colorizeFileName(filename)} to be part of "${packageName[0]}"`);
    return packageName[0];
  }

  if (filename.startsWith('doc')) {
    debug(`determined ${colorizeFileName(filename)} to be part of the docs metapackage`);
    return 'docs';
  }

  debug(`determined ${colorizeFileName(filename)} to be part of the tooling metapackage`);
  return 'tooling';
}
