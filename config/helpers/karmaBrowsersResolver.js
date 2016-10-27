module.exports = function() {
  return process.env.TRAVIS ? ['CHROME_TRAVIS_CI'] : ['Chrome'];
};
