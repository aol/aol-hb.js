var path = require('path');

module.exports = {
  buildDirectory: path.resolve('./build'),
  appEntryPoint: 'src/Index.js',
  outputFileName: 'pub-api.js',
  karmaConfigFilePath: __dirname + '/karma.conf.js',
  e2eTestViewsDirectory: path.resolve('./tests/e2e/views')
};
