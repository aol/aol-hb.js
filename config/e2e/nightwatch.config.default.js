module.exports = (function(settings) {
  settings.test_settings.default.desiredCapabilities = {
    browserName: 'chrome',
    marionette: true
  };

  return settings;

})(require('./nightwatch.json'));
