import {execSync} from 'child_process';
import path from 'path';

const debug = require('debug')('bowman:test:integration:lib:run');

/**
 * Run a command bowman command in the fixture directory. Do not include
 * "bowman".
 * @param {string} cmd
 * @return {string}
 */
export default function run(cmd) {
  process.chdir(path.resolve(__dirname, '..', 'fixtures'));
  const toExec = `${path.resolve(__dirname, '../../../bin/bowman')} ${cmd}`;
  debug(`running ${toExec}`);
  // pass {stdio: 'pipe'} to prevent error output from being printed in the test
  // report.
  return Promise.resolve(execSync(toExec, {stdio: 'pipe'})
    .toString()
    .trim());
}
