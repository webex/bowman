/* eslint-env mocha */

import {assert} from 'chai';


import {parseCommitForCommands, parseCommitForLegacyCommands, parseCommitsForCommands} from './git';

describe('git', () => {
  describe('parseCommitForLegacyCommands()', () => {
    it('correctly parses "no push"', () => {
      assert.deepEqual(parseCommitForLegacyCommands(''), {});
      assert.deepEqual(parseCommitForLegacyCommands('#no-push'), {noPush: true});
      assert.deepEqual(parseCommitForLegacyCommands('#no push'), {noPush: true});
      assert.deepEqual(parseCommitForLegacyCommands('#nopush'), {noPush: true});
      assert.deepEqual(parseCommitForLegacyCommands('#no-push blarg'), {noPush: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg #no-push'), {noPush: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg #no-push blarg'), {noPush: true});
    });

    it('correctly parses "ci skip"', () => {
      assert.deepEqual(parseCommitForLegacyCommands(''), {});
      assert.deepEqual(parseCommitForLegacyCommands('[ci skip]'), {ciSkip: true});
      assert.deepEqual(parseCommitForLegacyCommands('[ci-skip]'), {ciSkip: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg [ci skip]'), {ciSkip: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg [ci skip] blarg'), {ciSkip: true});
    });

    it('correctly parses "ignore tooling"', () => {
      assert.deepEqual(parseCommitForLegacyCommands(''), {});
      assert.deepEqual(parseCommitForLegacyCommands('#ignore-tooling'), {ignoreTooling: true});
      assert.deepEqual(parseCommitForLegacyCommands('#ignore-tooling blarg'), {ignoreTooling: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg #ignore-tooling'), {ignoreTooling: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg #ignore-tooling blarg'), {ignoreTooling: true});
    });

    it('correctly parses "force publish"', () => {
      assert.deepEqual(parseCommitForLegacyCommands(''), {});
      assert.deepEqual(parseCommitForLegacyCommands('#force-publish'), {forcePublish: true});
      assert.deepEqual(parseCommitForLegacyCommands('#force-publish blarg'), {forcePublish: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg #force-publish'), {forcePublish: true});
      assert.deepEqual(parseCommitForLegacyCommands('blarg #force-publish blarg'), {forcePublish: true});
    });

    it('correctly parses multiple commands', () => {
      assert.deepEqual(parseCommitForLegacyCommands('#no-push #force-publish'), {
        forcePublish: true,
        noPush: true
      });
    });
  });

  describe('parseCommitForCommands()', () => {
    it('delegates to `parseCommitForLegacyCommands()`', () => {
      assert.deepInclude(parseCommitForCommands('#no-push #force-publish'), {
        forcePublish: true,
        noPush: true
      });

      assert.deepInclude(parseCommitForCommands('abc #no-push'), {noPush: true});
    });
  });

  describe('parseGitCommends()', () => {
    it('checks the changeset for #no-push and HEAD for other commands', () => {
      assert.deepEqual(parseCommitsForCommands([
        'a',
        'b'
      ]), {});

      assert.deepEqual(parseCommitsForCommands([
        'a',
        '#no-push',
        'b'
      ]), {noPush: true});

      assert.deepEqual(parseCommitsForCommands([
        'a #ignore-tooling',
        '#no-push',
        'b'
      ]), {
        ignoreTooling: true,
        noPush: true
      });

      assert.deepEqual(parseCommitsForCommands([
        'a #ignore-tooling',
        'b'
      ]), {ignoreTooling: true});
    });
  });
});
