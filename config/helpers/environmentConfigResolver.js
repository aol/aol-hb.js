const resolver = {
  resolveKarmaBrowsers: function() {
    return resolver.isTravisEnvironment() ? ['CHROME_TRAVIS_CI'] : ['Chrome'];
  },
  resolveNightWatchConfig: function() {
    return 'nightwatch.' + (resolver.isTravisEnvironment() ? 'config.travis' : 'config.default');
  },
  isTravisEnvironment: function() {
    return process.env.TRAVIS;
  }
};

module.exports = resolver;
