describe('Environment config helper tests', () => {
  var environmentResolver = require('config/helpers/environmentConfigResolver');

  it('Resolve karma browsers test', () => {
    var isTravisMethodStub = sinon.stub(environmentResolver, 'isTravisEnvironment').returns(false);
    expect(environmentResolver.resolveKarmaBrowsers()).to.deep.equal(['Chrome']);

    isTravisMethodStub.returns(true);
    expect(environmentResolver.resolveKarmaBrowsers()).to.deep.equal(['CHROME_TRAVIS_CI']);

    isTravisMethodStub.restore();
  });

  it('Resolve nightwatch config test', () => {
    var isTravisMethodStub = sinon.stub(environmentResolver, 'isTravisEnvironment').returns(false);
    expect(environmentResolver.resolveNightWatchConfig()).to.equal('nightwatch.config.default');

    isTravisMethodStub.returns(true);
    expect(environmentResolver.resolveNightWatchConfig()).to.equal('nightwatch.config.travis');

    isTravisMethodStub.restore();
  });
});
