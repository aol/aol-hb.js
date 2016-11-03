var resolver = {
  resolveKarmaBrowsers: () => {
    return resolver.isTravisEnvironment() ? ['CHROME_TRAVIS_CI'] : ['Chrome'];
  },
  resolveNightWatchConfig: () => {
    return 'nightwatch.' + (resolver.isTravisEnvironment() ? 'config.travis' : 'config.default');
  },
  isTravisEnvironment: () => {
    return process.env.TRAVIS;
  }
};

module.exports = resolver;
