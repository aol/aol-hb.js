const path = require('path');
module.exports = (function(settings) {
  settings.test_settings.default.desiredCapabilities = {
    browserName: 'phantomjs',
    javascriptEnabled: true,
    acceptSslCerts: true
  };

  settings.test_settings.default.desiredCapabilities['phantomjs.binary.path'] =
    path.resolve('./node_modules/phantomjs/bin/phantomjs');

  return settings;
})(require('./nightwatch.json'));
