import {listPackages} from '../../public/packages';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export const builder = {};
export const command = 'publishable';
export const desc = 'Check if this changeset includes any publishable changes';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  if (argv.forcePublish) {
    console.log('yes');
    return;
  }

  const packages = await listPackages({changed: true});
  if (packages.length === 1 && packages[0] !== 'docs' || packages.length > 1) {
    console.log('yes');
    return;
  }

  console.log('no');
}
