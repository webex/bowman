import {execSync} from 'child_process';

const debug = require('debug')('bowman:lib:git');

/**
 * Diffs the current repo against ${tag}
 * @param {string} tag
 * @returns {Promise<Array<Object<string, string>>>}
 */
export function diff(tag) {
  debug(`Diffing HEAD against ${tag}`);

  debug(`Shelling out to \`git diff --name-only HEAD..${tag}\``);
  const raw = String(execSync(`git diff --name-only HEAD..${tag}`));
  debug('Done');

  return raw;
}

/**
 * Returns the last commit message
 * @returns {Promise<string>}
 */
export function lastLog() {
  debug('Getting last log');

  debug('Shelling out to `git log -n 1 --format=%B`');
  const log = String(execSync('git log -n 1 --format=%B'));
  debug('Done');

  return log;
}
