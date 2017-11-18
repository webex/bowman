/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .demandCommand(1)
    .commandDir('./shift');
}
export const command = 'shift';
export const desc = 'Apply transformations to the repository';
