describe('Karma browsers resolver tests', () => {
  var browserResolver = require('config/helpers/karmaBrowsersResolver');

  it('Test browsers in travis CI mode', () => {
    var isTravisMethodStub = sinon.stub(browserResolver, 'isTravisEnvironment').returns(false);
    expect(browserResolver.resolve()).to.deep.equal(['Chrome']);

    isTravisMethodStub.returns(true);
    expect(browserResolver.resolve()).to.deep.equal(['CHROME_TRAVIS_CI']);
  });
});
