import {publishable} from '../../public/check';

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
  const isPublishable = await publishable(argv);
  if (argv.exitStatus) {
    process.exit(isPublishable ? 0 : 1);
  }
  else {
    console.log(isPublishable ? 'yes' : 'no');
  }
}
