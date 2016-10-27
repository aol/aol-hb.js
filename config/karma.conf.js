const webpackConfig = require('./webpack.config');
const karmaBrowsersResolver = require('./helpers/karmaBrowsersResolver');

module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha', 'chai-sinon'],

    files: [
      'tests/unit/*Test.js'
    ],

    browsers: karmaBrowsersResolver.resolve(),

    colors: true,

    port: 9876,

    // Add webpack as preprocessor
    preprocessors: {
      'tests/unit/*Test.js': ['webpack']
    },

    customLaunchers: {
      CHROME_TRAVIS_CI: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    webpack: webpackConfig
  });
};
