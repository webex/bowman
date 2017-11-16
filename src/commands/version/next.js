import {next} from '../../public/version';

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export const build = {
  explicitReleaseVersion: {
    description: 'If set, ignore history parsing and just return this value.',
    type: 'string'
  }
};
export const command = 'next';
export const desc = 'Determines the next publish version. Does not make changes, but should be run *after* package versions have been set to their published version.';
/**
 * yargs handler
 * @param {*} argv
 * @returns {Promise}
 */
export async function handler(argv) {
  // it's not a callback
  // eslint-disable-next-line callback-return
  console.log(await next(argv));
}

