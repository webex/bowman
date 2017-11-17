import {makeDebug} from '../../lib/debug';
import {apply, list} from '../../public/shift';

const debug = makeDebug(__filename);

/**
 * yargs builder
 * @param {*} yargs
 * @returns {Object}
 */
export function builder(yargs) {
  return yargs
    .positional('transform', {
      description: 'Name of the transform to apply. May also be a a path"',
      type: 'string'
    })
    .options({
      all: {
        default: false,
        description: 'Opt into running all transforms. Must be explicitly specified if `transform` is omitted.',
        type: 'boolean'
      },
      list: {
        default: false,
        description: 'List all available transforms',
        type: 'boolean'
      }
    });
}
export const command = 'pkg [transform]';
export const desc = 'Apply transformations across the repository';

/**
 * yargs handler
 * @param {*} argv
 * @returns {Object}
 */
export async function handler(argv) {
  if (argv.list) {
    debug('Printing all mods and exiting');
    for (const mod of await list()) {
      console.log(mod.name);
    }
  }
  else if (argv.transform) {
    debug(`Applying single transform ${argv.transform}`);

    await apply(argv.transform);
  }
  else if (argv.all) {
    debug('Applying all transforms');
    for (const mod of await list()) {
      try {
        await apply(mod.name);
      }
      catch (err) {
        console.error(`Failed to apply transform ${mod}`);
        console.error(err);
        throw err;
      }
    }
  }
  else {
    throw new Error('One of `transform` or `--all` must be specified');
  }
}
