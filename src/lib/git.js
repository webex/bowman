import {execSync} from 'child_process';

import {makeDebug, v} from './debug';

const debug = makeDebug(__filename);

/**
 * Diffs the current repo against ${tag}
 * @param {string} tag
 * @returns {Promise<Array<Object<string, string>>>}
 */
export function diff(tag = 'upstream/master') {
  debug(`Diffing HEAD against ${v(tag)}`);

  debug(`Shelling out to \`git diff --name-only HEAD..${v(tag)}\``);
  const raw = String(execSync(`git diff --name-only HEAD..${tag}`, {stdio: 'pipe'}));
  debug('Done');

  return raw.split('\n');
}

/**
 * Returns the last commit message
 * @returns {Promise<string>}
 */
export function lastLog() {
  debug('Getting last log');

  debug('Shelling out to `git log -n 1 --format=%B`');
  const log = String(execSync('git log -n 1 --format=%B', {stdio: 'pipe'}));
  debug('Done');

  return log;
}

/**
 * @typedef {Object} LegacyGitCommitCommands
 * @property {boolean|undefined} ciSkip - HEAD commit only. indicates if tests
 * should be bypassed
 * @property {boolean|undefined} forcePublish - HEAD commit only. indicates if
 * all packages should be published instead of just changed packages
 * @property {boolean|undefined} ignoreTooling - HEAD commit only. indicates if
 * tooling changes should be ignored for determinging what tests to run
 * @property {boolean|undefined} noPush - Any commit in changeset. indicates if
 * the build should be aborted before merge/publish
 */

/**
 * Parses a git commit message for the commands previously used by
 * [spark-js-sdk](https://github.com/ciscospark/spark-js-sdk/).
 * @param {string} log
 * @return {LegacyGitCommitCommands}
 */
export function parseCommitForLegacyCommands(log) {
  debug(`Parsing ${log} for legacy git commands`);

  const commands = {};
  if (log.includes('[ci skip]') || log.includes('[ci-skip]')) {
    commands.ciSkip = true;
  }
  if (log.includes('#force-publish')) {
    commands.forcePublish = true;
  }
  if (log.includes('#ignore-tooling')) {
    commands.ignoreTooling = true;
  }
  if (log.includes('#no-push') || log.includes('#nopush') || log.includes('#no push')) {
    commands.noPush = true;
  }

  return commands;
}

/**
 * This is a placeholder function. At some point, we'll have a generic command
 * syntax, but for now, we need to just rely on the pre-defined legacy commands.
 * @param {string} log
 * @returns {LegacyGitCommitCommands}
 */
export function parseCommitForCommands(log) {
  debug(`Parsing ${log} for git commands`);

  const commands = parseCommitForLegacyCommands(log);
  // This might be something like "if command, execSync bowman ${command}"
  return commands;
}

/**
 * Parses a set of commits (with the first commit being the HEAD commit) for git
 * commands
 * @param {Array<string>} logs
 * @returns {LegacyGitCommitCommands}
 */
export function parseCommitsForCommands(logs) {
  if (!logs.length) {
    return {};
  }
  const commands = parseCommitForCommands(logs[0]);
  if (!commands.noPush) {
    for (let i = 1; i < logs.length && !commands.noPush; i++) {
      const {noPush} = parseCommitForCommands(logs[i]);
      if (noPush) {
        commands.noPush = noPush;
      }
    }
  }
  return commands;
}

/**
 * Checks all commits in changeset for git commands
 * @returns {LegacyGitCommitCommands}
 */
export function parseGitCommands() {
  let commits;
  try {
    commits = String(execSync('git log upstream/master..HEAD --format=%B', {stdio: 'pipe'}))
      .split('\n')
      .filter(Boolean);
  }
  catch (err) {
    return {};
  }
  return parseCommitsForCommands(commits);
}
