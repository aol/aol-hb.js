module.exports = function() {
  return process.env.TRAVIS ? ['Chrome_travis_ci'] : ['Chrome'];
};
