import Git from 'nodegit';
import kit from 'nodegit-kit';

const debug = require('debug')('bowman:lib:git');

/**
 * Opens the current directory as a Git.Repository
 * @returns {Promise<Git.Repository>}
 */
function openRepo() {
  return Git.Repository.open(`${process.cwd()}/.git`);
}

/**
 * Diffs the current repo against ${tag}
 * @param {string} tag
 * @returns {Promise<Array<Object<string, string>>>}
 */
export async function diff(tag) {
  debug('opening repo');
  const repo = await openRepo();
  debug(`diffing HEAD against ${tag}`);
  const d = await kit.diff(repo, 'HEAD', tag);

  return d;
}

/**
 * Returns the last commit message
 * @returns {Promise<string>}
 */
export async function lastLog() {
  const repo = await openRepo();
  const commit = await repo.getHeadCommit();

  return commit.summary();
}
