var resolver = {
  resolve: function() {
    return !resolver.isTravisEnvironment() ? ['Chrome'] : ['CHROME_TRAVIS_CI'];
  },
  isTravisEnvironment: function() {
    return process.env.TRAVIS;
  }
};

module.exports = resolver;
