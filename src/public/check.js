import {listPackages, listTestablePackages} from './packages';
/**
 * Checks if there's anything to publish
 * @param {Object} options
 * @param {boolean} options.forcePublish
 * @returns {Promise<boolean>}
 */
export async function publishable({forcePublish = false} = {}) {
  if (forcePublish) {
    return true;
  }

  const packages = await listPackages({changed: true});
  if (packages.length === 1 && packages[0] !== 'docs' || packages.length > 1) {
    return true;
  }

  return false;
}

/**
 * Checks if there's anything to publish
 * @param {Object} options
 * @param {boolean} options.ciSkip
 * @returns {Promise<boolean>}
 */
export async function testable(options) {
  if (options.ciSkip) {
    return false;
  }

  const packages = await listTestablePackages(options);

  if (packages.length) {
    return true;
  }

  return false;

}
