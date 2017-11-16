import path from 'path';

import {assert} from 'chai';
import {readFile} from 'mz/fs';

import run from '../../lib/run';

describe('deps', () => {
  describe('generate', () => {
    it('generates dependencies for each package', async() => {
      await run('deps list not-scoped');

      const pkgNotScoped = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/not-scoped/package.json')));
      const pkgScoped1 = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/@example/scoped-package-the-first/package.json')));
      const pkgScoped2 = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/@example/scoped-package-the-second/package.json')));

      assert.deepEqual(pkgNotScoped.dependencies, {
        'examples/scoped-package-the-second': '1.0.0',
        'external-dep-3': '^3.0.0'
      });

      assert.deepEqual(pkgScoped1.dependencies, {'external-dep-1': '^0.0.1'});

      assert.deepEqual(pkgScoped2.dependencies, {
        'examples/scoped-package-the-first': '1.0.0',
        'external-dep-2': '^0.2.0'
      });
    });
  });
});
