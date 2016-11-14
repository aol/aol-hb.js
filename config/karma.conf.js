const webpackConfig = require('./webpack.config');
const environmentResolver = require('./helpers/environmentConfigResolver');

module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha', 'chai-sinon'],

    files: [
      'tests/unit/*Test.js'
    ],

    browsers: environmentResolver.resolveKarmaBrowsers(),

    colors: true,

    port: 9876,

    reporters: ['progress', 'coverage'],

    // Add webpack as preprocessor
    preprocessors: {
      'tests/unit/*Test.js': ['webpack'],
      'src/**/*.js': ['webpack', 'coverage']
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
