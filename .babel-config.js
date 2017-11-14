// With babel 7, we'll be able to replace this file and .babelrc with
// .babelrc.js but for now, this seems to be the cleanest way to do dynamic
// babel config (the babel env property didn't quite up to the task)

const envPreset = {
  "targets": {
    "node": "6.9.0"
  }
};

if (process.env.BUILD_ES) {
  envPreset.modules = false;
}

if (process.env.NODE_ENV === 'development') {
  envPreset.targets.node = true;
}

const config = module.exports = {
  "plugins": [
    "transform-export-extensions"
  ],
  "presets": [
    ["env", envPreset]
  ]
}
