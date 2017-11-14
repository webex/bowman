import {assert} from 'chai';

import run from '../lib/run';

before(() => process.chdir('./test/integration/fixtures'));

describe('list', () => {
  it('lists all packages in the project directory', async() => {
    const result = await run('list');
    assert.lengthOf(result.trim()
      .split('\n'), 3);
  });
});
