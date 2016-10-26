const webpackConfig = require('./webpack.config');

module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha', 'chai-sinon'],

    files: [
      'tests/unit/*_test.js'
    ],

    browsers: ['Chrome'],

    colors: true,

    port: 9876,

    // Add webpack as preprocessor
    preprocessors: {
      'tests/unit/*_test.js': ['webpack']
    },

    webpack: webpackConfig
  });
};
