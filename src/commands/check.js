/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .options({
      exitStatus: {
        default: false,
        description: 'When set, use exit code zero for affirmative and exit code 1 for negative',
        type: 'boolean'
      }
    })
    .demandCommand(1)
    .commandDir('./check');
}
export const command = 'check';
export const desc = 'Check various things about your project';
