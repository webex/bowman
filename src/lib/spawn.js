import cp from 'child_process';

import invariant from 'invariant';

/**
 * Simplified spawn
 * @param {string} cmd
 * @param {Array<string>} [args]
 * @param {Object} [options]
 * @returns {Promise}
 */
export default function spawn(cmd, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    invariant(cmd, '"cmd" is required');
    invariant(Array.isArray(args), '"args" is required and must be an Array');

    const opts = Object.assign({
      detached: false,
      stdio: 'inherit'
    }, options);
    const child = cp.spawn(cmd, args, opts);

    let data = '';
    if (child.stderr) {
      child.stderr.on('data', (d) => {
        data += d;
      });
    }

    child.on('close', (code) => {
      if (code) {
        const e = new Error(code);
        e.data = data;

        return reject(e);
      }

      return resolve();
    });

    if (options && options.detached) {
      child.unref();
      /* eslint no-param-reassign: [0] */
      options.child = child;
    }
  });
}
