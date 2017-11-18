# @ciscospark/bowman

[![license](https://img.shields.io/github/license/ianwremmel/bowman.svg)](https://github.com/ianwremmel/bowman/blob/master/LICENSE)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

[![Greenkeeper badge](https://badges.greenkeeper.io/ianwremmel/bowman.svg?token=f557860f97be2ffae7d9428f5b1521bb54c091b4a7b9364506a700bcb24c7302&ts=1510673251040)](https://greenkeeper.io/)
[![dependencies Status](https://david-dm.org/ianwremmel/bowman/status.svg)](https://david-dm.org/ianwremmel/bowman)
[![devDependencies Status](https://david-dm.org/ianwremmel/bowman/dev-status.svg)](https://david-dm.org/ianwremmel/bowman?type=dev)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![CircleCI](https://circleci.com/gh/ianwremmel/bowman.svg?style=svg)](https://circleci.com/gh/ianwremmel/bowman)
[![Coverage Status](https://coveralls.io/repos/github/ianwremmel/bowman/badge.svg?branch=master)](https://coveralls.io/github/ianwremmel/bowman?branch=master)

> Monorepo utilities

## Install

```js
npm install @ciscospark/bowman
```

## Usage

### Transformations

#### Package Transformations

> Local Dir: .bowman/mods/pkg

Inspired by the things that jscodeshift lets to do with codemods, Bowman provides an interface for create transforms to keep all of your package.jsons consistent.

Each transform is of the form

```js
/**
 * @param {Object} pkg - The loaded package to transform
 * @returns {Promise|undefined}
 */
module.exports = async function tx(pkg) {
  // make changes to pkg here
}
```

### Running your tests

1. (optional) Check if you have tests to run
    ```bash
    bowman check testable --changed
    # => run/skip
    ```

1. List packages that need to be tested
    ```bash
    bowman list testable --changed
    ```
    > You can additionally passed the `--ignore-tooling` switch to only make the testing determination based on package changes.

### Publishing

1. Check anything publishable changed
    ```bash
    bowman check publishable
    # => yes/no
    ```

1. Add dependencies to packages
    ```bash
    bowman deps generate
    ```

1. Get latest published versions from npm and set all packages to them
    ```bash
    bowman version set --latest
    ```

1. Determine next version
    ```bash
    export NEXT_VERSION=$(bowman version next)
    ```

1. Set next version
    ```bash
    bowman version set ${NEXT_VERSION}
    ```
1. Publish

    We felt that actually putting a publish command into this repository might make this a little too easy. Instead, we've got a handy script to publish all your packages. You'll get a bunch of 404s for packages that don't have new version numbers.

    ```bash
    bowman exec -- bash -c 'npm publish --access public || true'
    ```

    > Keep an eye on #8 for the planned addition of a `--publishable` switch.

`bowman version next` and `bowman version set <version></version>` are explicitly different steps because you're probably going to need to do other things with `VERSION_NEXT` and by forcing this to be explicit, we avoid several potentially costly callouts to npm.

## Maintainers

[Ian Remmel](https://github.com/ianwremmel)

## Contribute

See [CONTRIBUTE](CONTRIBUTE.md)

## License

&copy; [MIT](LICENSE)
