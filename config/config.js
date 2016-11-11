var path = require('path');

module.exports = {
  buildDirectory: path.resolve('./build'),
  appEntryPoint: path.resolve('./src/index.js'),
  outputFileName: 'aol-hb.js',
  karmaConfigFilePath: path.resolve('./config/karma.conf.js'),
  e2eTestViewsDirectory: path.resolve('./tests/e2e/views'),
  tempFilesDir: path.resolve('./temp/'),
  nightWatchConfigPath: path.resolve('./temp/') + '/' + 'nightwatch.json'
};
