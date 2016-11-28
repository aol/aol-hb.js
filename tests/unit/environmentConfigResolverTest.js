describe('Environment config helper tests', () => {
  let resolver = require('config/helpers/environmentConfigResolver');

  describe('resolveKarmaBrowsers()', () => {
    it('should resolve browsers for local building mode', () => {
      let isTravisMethodStub = sinon.stub(resolver, 'isTravisEnvironment').returns(false);

      expect(resolver.resolveKarmaBrowsers()).to.deep.equal(['Chrome']);
      isTravisMethodStub.restore();
    });

    it('should resolve browsers for travis CI mode', () => {
      let isTravisMethodStub = sinon.stub(resolver, 'isTravisEnvironment').returns(true);

      expect(resolver.resolveKarmaBrowsers()).to.deep.equal(['CHROME_TRAVIS_CI']);
      isTravisMethodStub.restore();
    });
  });

  describe('resolveNightWatchConfig()', () => {
    it('should resolve nightwatch config for building locally', () => {
      let isTravisMethodStub = sinon.stub(resolver, 'isTravisEnvironment').returns(false);

      expect(resolver.resolveNightWatchConfig()).to.equal('nightwatch.config.default');
      isTravisMethodStub.restore();
    });

    it('should resolve nightwatch config for building on travis CI', () => {
      let isTravisMethodStub = sinon.stub(resolver, 'isTravisEnvironment').returns(true);

      expect(resolver.resolveNightWatchConfig()).to.equal('nightwatch.config.travis');
      isTravisMethodStub.restore();
    });
  });

  describe('isTravisEnvironment()', () => {
    afterEach(() => {
      delete process.env.TRAVIS;
    });

    it('should be resolved as not travis environment', () => {
      process.env.TRAVIS = false;
      expect(resolver.isTravisEnvironment()).to.be.false;
    });

    it('should be resolved as travis environment', () => {
      process.env.TRAVIS = true;
      expect(resolver.isTravisEnvironment()).to.be.true;
    });
  });
});
