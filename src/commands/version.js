/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .demandCommand(1)
    .commandDir('./version');
}
export const command = 'version';
export const desc = 'Get/set versions';
