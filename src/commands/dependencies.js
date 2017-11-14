/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .demandCommand(1)
    .commandDir('./dependencies');
}
export const command = 'deps';
export const desc = 'Do things with dependencies';
