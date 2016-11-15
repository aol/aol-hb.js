describe('Environment config helper tests', () => {
  let environmentResolver = require('config/helpers/environmentConfigResolver');

  afterEach(() => {
    delete process.env.TRAVIS;
  });

  it('Resolve karma browsers test', () => {
    let isTravisMethodStub = sinon.stub(environmentResolver, 'isTravisEnvironment').returns(false);
    expect(environmentResolver.resolveKarmaBrowsers()).to.deep.equal(['Chrome']);

    isTravisMethodStub.returns(true);
    expect(environmentResolver.resolveKarmaBrowsers()).to.deep.equal(['CHROME_TRAVIS_CI']);

    isTravisMethodStub.restore();
  });

  it('Resolve nightwatch config test', () => {
    let isTravisMethodStub = sinon.stub(environmentResolver, 'isTravisEnvironment').returns(false);
    expect(environmentResolver.resolveNightWatchConfig()).to.equal('nightwatch.config.default');

    isTravisMethodStub.returns(true);
    expect(environmentResolver.resolveNightWatchConfig()).to.equal('nightwatch.config.travis');

    isTravisMethodStub.restore();
  });

  it('Is travis environment method test', () => {
    process.env.TRAVIS = false;
    expect(environmentResolver.isTravisEnvironment()).to.be.false;

    process.env.TRAVIS = true;
    expect(environmentResolver.isTravisEnvironment()).to.be.true;
  });
});
