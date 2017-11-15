import {assert} from 'chai';

import run from '../lib/run';

describe('exec', () => {
  it('executes a command in each package directory', async() => {
    const result = await run('exec pwd');
    assert.lengthOf(result.trim()
      .split('\n'), 3);
  });
});
