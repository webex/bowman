if (process.env.CIRCLE_BRANCH && process.env.CIRCLE_BRANCH.includes('greenkeeper')) {
  module.exports = {};
}
else {
  module.exports = {
    extends: [
      '@commitlint/config-angular'
    ]
  };
}
