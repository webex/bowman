import {assert} from 'chai';

import run from '../lib/run';

describe('list', () => {
  it('lists all packages in the project directory', async() => {
    const result = await run('list');
    assert.lengthOf(result.trim()
      .split('\n'), 3);
  });
});

describe('list --changed', () => {
  it('lists all packages that have changed between HEAD and master');
});

describe('list --include-transitive', () => {
  it('implies --changed');
});

describe('list --changed --include-transitive', () => {
  it('lists all packages and those that depend on them between HEAD and master');
});

describe('list --testable', () => {
  it('lists all packages with test suites');
});

describe('list --changed --testable', () => {
  it('lists all packages with test suites changed between HEAD and master');
  it('lists all testable packages if the "tooling" package has changed');
});

describe('list --changed --testable --include-transitive', () => {
  it('lists all packages and those that depend on them with test suites changed between HEAD and master');
});

describe('list --changed --testable --ignore-tooling', () => {
  it('ignores the "tooling" meta package for determining changed packages');
});
