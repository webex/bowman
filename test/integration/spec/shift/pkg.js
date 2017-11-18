import {execSync} from 'child_process';
import path from 'path';

import {assert} from 'chai';
import {readFile} from 'mz/fs';

import run from '../../lib/run';

describe('shift', () => {
  describe('pkg', () => {
    after(() => {
      execSync('git checkout .', {cwd: path.resolve(__dirname, '../../fixtures')});
    });

    describe('--list', () => {
      it('lists all local and default package mods', async() => {
        const result = await run('shift pkg --list');
        assert.lengthOf(result.split('\n'), 2);
        assert.equal(result, '500-defaults\n900-sort-package');
      });
    });

    describe('500-defaults', () => {
      it('adds two properties to each package', async() => {
        await run('shift pkg 500-defaults');
        const pkgNotScoped = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/not-scoped/package.json')));
        const pkgScoped1 = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/@example/scoped-package-the-first/package.json')));
        const pkgScoped2 = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/@example/scoped-package-the-second/package.json')));
        assert.isTrue(pkgNotScoped.totallyTransformBy500Defaults);
        assert.isTrue(pkgScoped1.totallyTransformBy500Defaults);
        assert.isTrue(pkgScoped2.totallyTransformBy500Defaults);
      });

      it('adds properties out of order', async() => {
        await run('shift pkg 500-defaults');
        const pkgNotScoped = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/not-scoped/package.json')));
        const keys = Object.keys(pkgNotScoped)
          .reverse();
        assert.equal(keys[0], 'startsLastButGetsSorted');
        assert.equal(keys[1], 'totallyTransformBy500Defaults');
      });
    });

    describe('--all', () => {
      it('applies all available mods', async() => {
        await run('shift pkg --all');
        const pkgNotScoped = JSON.parse(await readFile(path.resolve(__dirname, '../../fixtures/packages/node_modules/not-scoped/package.json')));
        const keys = Object.keys(pkgNotScoped)
          .reverse();
        assert.equal(keys[1], 'startsLastButGetsSorted');
        assert.equal(keys[0], 'totallyTransformBy500Defaults');
      });
    });
  });
});
