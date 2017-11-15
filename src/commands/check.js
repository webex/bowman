/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .demandCommand(1)
    .commandDir('./check');
}
export const command = 'check';
export const desc = 'Check various things about your project';
