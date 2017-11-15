import {list} from '../../public/packages';

export const builder = {};
export const command = 'updated';
export const desc = 'List updated packages';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler() {
  const packages = await list({updated: true});

  for (const pkg of packages) {
    console.info(pkg);
  }
}
