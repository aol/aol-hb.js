describe('Utils tests', () => {
  var utils = require('src/Utils');

  it('Get app name method test', () => {
    expect(utils.getAppName()).to.equal('pub-api');
  });
});
