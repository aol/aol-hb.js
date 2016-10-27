var resolver = {
  resolve: () => {
    return !resolver.isTravisEnvironment() ? ['Chrome'] : ['CHROME_TRAVIS_CI'];
  },
  isTravisEnvironment: () => {
    return process.env.TRAVIS;
  }
};

module.exports = resolver;
