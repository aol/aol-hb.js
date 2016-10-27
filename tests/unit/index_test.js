describe('Utils tests', function() {
  var utils = require('src/Utils');

  it('Get app name method test', function() {
    expect(utils.getAppName()).to.equal('pub-api');
  });
});
