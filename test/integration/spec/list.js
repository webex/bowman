import {assert} from 'chai';

import run from '../lib/run';

describe('list', () => {
  it('lists all packages in the project directory', async() => {
    const result = await run('list');
    assert.lengthOf(result.split('\n'), 3);
  });
});

describe('list --changed', () => {
  it('lists all packages that have changed between HEAD and master');
});
