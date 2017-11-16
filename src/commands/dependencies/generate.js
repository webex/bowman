import {generate} from '../../public/dependencies';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Promise}
 */
export const builder = {};
export const command = 'generate';
export const desc = 'Generate dependencies for each package';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler() {
  await generate();
}
