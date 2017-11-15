import {assert} from 'chai';

import run from '../../lib/run';

describe('deps', () => {
  describe('list [packageName]', () => {
    it('lists all direct dependencies for the specified package', async() => {
      const result = await run('deps list not-scoped');
      assert.lengthOf(result.split('\n'), 2);
      assert.include(result, '@example/scoped-package-the-second');
      assert.include(result, 'external-dep-3');
    });
  });

  describe('list --local-only [packageName]', () => {
    it('lists all local direct dependencies for the specified package', async() => {
      const result = await run('deps list not-scoped --local-only');
      assert.lengthOf(result.split('\n'), 1);
      assert.include(result, '@example/scoped-package-the-second');
    });
  });

  describe('list --include-transitive [packageName]', () => {
    it('lists all transitive dependencies for the specified package', async() => {
      const result = await run('deps list not-scoped --include-transitive');
      assert.lengthOf(result.split('\n'), 5);
      assert.include(result, '@example/scoped-package-the-first');
      assert.include(result, '@example/scoped-package-the-second');
      assert.include(result, 'external-dep-1');
      assert.include(result, 'external-dep-2');
      assert.include(result, 'external-dep-3');
    });
  });

  describe('list --include-transitive --local-only [packageName]', () => {
    it('lists all local transitive dependencies for the specified package', async() => {
      const result = await run('deps list not-scoped --include-transitive --local-only');
      assert.lengthOf(result.split('\n'), 2);
      assert.include(result, '@example/scoped-package-the-first');
      assert.include(result, '@example/scoped-package-the-second');
    });
  });

  describe('list --dependents [packageName]', () => {
    it('implies --local-only', async() => {
      let result;
      try {
        result = await run('deps list @example/scoped-package-the-first --dependents');
      }
      catch (err) {
        result = err.output[2].toString();
      }

      assert.match(result, /Implications failed/);
      assert.match(result, /dependents -> localOnly/);

      result = await run('deps list @example/scoped-package-the-first --dependents --local-only');

      assert.notMatch(result, /Implications failed/);
    });
  });

  describe('list --dependents --local-only [packageName]', () => {
    it('lists all packages that directly depend on the specified package', async() => {
      const result = await run('deps list @example/scoped-package-the-first --dependents --local-only');
      assert.lengthOf(result.split('\n'), 1);
      assert.include(result, '@example/scoped-package-the-second');
    });
  });

  describe('list --dependents --include-transitive --local-only [packageName]', () => {
    it('lists all packages that transitively depend on the specified package', async() => {
      const result = await run('deps list @example/scoped-package-the-first --dependents --include-transitive --local-only');
      assert.lengthOf(result.split('\n'), 2);
      assert.include(result, '@example/scoped-package-the-second');
      assert.include(result, 'not-scoped');
    });
  });
});
