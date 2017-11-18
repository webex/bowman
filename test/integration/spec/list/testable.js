import {assert} from 'chai';

import run from '../../lib/run';

describe('list', () => {
  describe('testable', () => {
    it('lists all packages with tests', async() => {
      const result = await run('list testable');
      console.log(result);
      assert.lengthOf(result.split('\n'), 1);
      assert.include(result, 'not-scoped');
    });
  });

  describe('testable --changed', () => {
    it('lists all testable packages and their dependents that differ from upstream/master');
    describe('if tooling has changed', () => {
      it('lists all testable packages');
    });
  });

  describe('testable --changed --ignore-tooling', () => {
    it('lists only testable packages and their dependents that differ from upstream/master even if tooling has changed');
  });

  describe('testable --ignore-tooling', () => {
    it('implies --changed', async() => {
      let result;
      try {
        result = await run('list testable --ignore-tooling');
      }
      catch (err) {
        result = err.output[2].toString();
      }

      assert.match(result, /Implications failed/);
      assert.match(result, /ignoreTooling -> changed/);

      try {
        result = await run('list testable --changed --ignore-tooling');
      }
      catch (err) {
        result = err.output[2].toString();
      }
      assert.notMatch(result, /Implications failed/);
    });
  });
});
