module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['mocha', 'chai-sinon'],

    files: [
      'tests/unit/*_test.js'
    ],

    browsers: ['Chrome'],

    colors: true,

    port: 9876
  });
};
